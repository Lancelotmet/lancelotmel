"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  Appointment,
  AppointmentStatus,
  BUSINESS_HOURS,
  ENCOUNTER_TYPES,
  formatDateKey,
  formatDateTime,
  formatTime,
  getEncounterType,
  getServiceName
} from "@/lib/appointments";

type LoadState =
  | { type: "idle"; message: "" }
  | { type: "info" | "ok" | "error"; message: string };

type CalendarView = "month" | "day";

function statusLabel(status: AppointmentStatus) {
  if (status === "cancelled") return "Cancelada";
  if (status === "pending") return "Pendiente";
  return "Confirmada";
}

function toLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("es-CO", {
    month: "long",
    year: "numeric"
  }).format(date);
}

function longDateLabel(dateKey: string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "full"
  }).format(parseDateKey(dateKey));
}

function buildMonthDays(monthDate: Date) {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const days: Date[] = [];

  for (let index = 0; index < mondayOffset; index += 1) {
    const date = new Date(firstDay);
    date.setDate(firstDay.getDate() - (mondayOffset - index));
    days.push(date);
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), day));
  }

  while (days.length % 7 !== 0) {
    const date = new Date(days[days.length - 1]);
    date.setDate(date.getDate() + 1);
    days.push(date);
  }

  return days;
}

export default function AdminAppointments() {
  const [token, setToken] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "Todos">("Todos");
  const [calendarView, setCalendarView] = useState<CalendarView>("month");
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => toLocalDateKey(new Date()));
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<LoadState>({ type: "idle", message: "" });

  const upcoming = useMemo(
    () =>
      appointments.filter(
        (appointment) =>
          appointment.status !== "cancelled" && new Date(appointment.starts_at).getTime() >= Date.now()
      ),
    [appointments]
  );

  const todayCount = useMemo(() => {
    const today = new Date();
    return appointments.filter((appointment) => {
      const startsAt = new Date(appointment.starts_at);
      return (
        appointment.status !== "cancelled" &&
        startsAt.getFullYear() === today.getFullYear() &&
        startsAt.getMonth() === today.getMonth() &&
        startsAt.getDate() === today.getDate()
      );
    }).length;
  }, [appointments]);

  const filteredAppointments = useMemo(
    () =>
      appointments.filter((appointment) => {
        const matchesType = typeFilter === "Todos" || getEncounterType(appointment.service) === typeFilter;
        const matchesStatus = statusFilter === "Todos" || appointment.status === statusFilter;
        return matchesType && matchesStatus;
      }),
    [appointments, statusFilter, typeFilter]
  );

  const appointmentsByDay = useMemo(() => {
    const grouped = new Map<string, Appointment[]>();

    for (const appointment of filteredAppointments) {
      const dateKey = formatDateKey(appointment.starts_at);
      const dayAppointments = grouped.get(dateKey) || [];
      dayAppointments.push(appointment);
      grouped.set(dateKey, dayAppointments);
    }

    for (const dayAppointments of grouped.values()) {
      dayAppointments.sort(
        (first, second) => new Date(first.starts_at).getTime() - new Date(second.starts_at).getTime()
      );
    }

    return grouped;
  }, [filteredAppointments]);

  const selectedDayAppointments = appointmentsByDay.get(selectedDate) || [];
  const selectedAppointment =
    selectedDayAppointments.find((appointment) => appointment.id === selectedAppointmentId) ||
    selectedDayAppointments[0] ||
    null;
  const monthDays = useMemo(() => buildMonthDays(visibleMonth), [visibleMonth]);
  const todayKey = toLocalDateKey(new Date());

  async function loadAppointments(nextToken = token) {
    setLoading(true);
    setState({ type: "info", message: "Cargando agenda..." });

    try {
      const response = await fetch("/api/appointments", {
        headers: {
          "x-admin-token": nextToken
        }
      });
      const data = (await response.json()) as { appointments?: Appointment[]; error?: string };

      if (!response.ok) {
        setState({ type: "error", message: data.error || "No se pudo cargar la agenda." });
        return;
      }

      setAppointments(data.appointments || []);
      setSelectedAppointmentId(null);
      setDeleteCandidateId(null);
      setState({ type: "ok", message: "Agenda actualizada." });
    } catch {
      setState({ type: "error", message: "No se pudo cargar la agenda." });
    } finally {
      setLoading(false);
    }
  }

  function moveMonth(direction: -1 | 1) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + direction, 1));
  }

  function goToToday() {
    const today = new Date();
    setVisibleMonth(today);
    setSelectedDate(toLocalDateKey(today));
    setSelectedAppointmentId(null);
  }

  function selectCalendarDay(dateKey: string) {
    setSelectedDate(dateKey);
    setSelectedAppointmentId(null);
    setCalendarView("day");
  }

  async function handleTokenSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadAppointments(token);
  }

  async function updateStatus(id: string, status: AppointmentStatus) {
    setLoading(true);
    setState({ type: "info", message: "Actualizando cita..." });

    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token
        },
        body: JSON.stringify({ status })
      });
      const data = (await response.json()) as { appointment?: Appointment; error?: string };

      if (!response.ok || !data.appointment) {
        setState({ type: "error", message: data.error || "No se pudo actualizar la cita." });
        return;
      }

      setAppointments((current) =>
        current.map((appointment) => (appointment.id === id ? data.appointment! : appointment))
      );
      setDeleteCandidateId(null);
      setState({ type: "ok", message: "Cita actualizada." });
    } catch {
      setState({ type: "error", message: "No se pudo actualizar la cita." });
    } finally {
      setLoading(false);
    }
  }

  async function deleteAppointment(id: string) {
    setLoading(true);
    setState({ type: "info", message: "Eliminando encuentro..." });

    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-token": token
        }
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !data.ok) {
        setState({ type: "error", message: data.error || "No se pudo eliminar el encuentro." });
        return;
      }

      setAppointments((current) => current.filter((appointment) => appointment.id !== id));
      setSelectedAppointmentId(null);
      setDeleteCandidateId(null);
      setState({ type: "ok", message: "Encuentro eliminado definitivamente." });
    } catch {
      setState({ type: "error", message: "No se pudo eliminar el encuentro." });
    } finally {
      setLoading(false);
    }
  }

  function renderDeleteControls(appointment: Appointment) {
    if (appointment.status !== "cancelled") {
      return null;
    }

    if (deleteCandidateId === appointment.id) {
      return (
        <div className="delete-confirm">
          <span>Confirmar eliminacion definitiva</span>
          <button
            className="danger-button"
            disabled={loading}
            onClick={() => deleteAppointment(appointment.id)}
            type="button"
          >
            Si, eliminar
          </button>
          <button
            className="button secondary"
            disabled={loading}
            onClick={() => setDeleteCandidateId(null)}
            type="button"
          >
            Conservar
          </button>
        </div>
      );
    }

    return (
      <button
        className="danger-button subtle"
        disabled={loading}
        onClick={() => setDeleteCandidateId(appointment.id)}
        type="button"
      >
        Eliminar
      </button>
    );
  }

  return (
    <div className="form">
      <form className="form-grid" onSubmit={handleTokenSubmit}>
        <div className="field">
          <label htmlFor="admin-token">Token de administracion</label>
          <input
            id="admin-token"
            type="password"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="ADMIN_ACCESS_TOKEN"
            required
          />
        </div>
        <div className="field">
          <label>&nbsp;</label>
          <button className="button" disabled={loading} type="submit">
            Cargar agenda
          </button>
        </div>
      </form>

      {state.type !== "idle" ? <p className={`status ${state.type}`}>{state.message}</p> : null}

      <div className="summary-grid" aria-label="Resumen de agenda">
        <article className="metric">
          <span>Activos proximos</span>
          <strong>{upcoming.length}</strong>
        </article>
        <article className="metric">
          <span>Hoy</span>
          <strong>{todayCount}</strong>
        </article>
        <article className="metric">
          <span>Cancelados</span>
          <strong>{appointments.filter((appointment) => appointment.status === "cancelled").length}</strong>
        </article>
        <article className="metric">
          <span>Total registros</span>
          <strong>{appointments.length}</strong>
        </article>
      </div>

      <div className="panel-title">
        <h2>Calendario operativo</h2>
        <span className="pill">{filteredAppointments.length} visibles</span>
      </div>

      <div className="filters" aria-label="Filtros de agenda">
        <div className="field">
          <label htmlFor="type-filter">Tipo</label>
          <select id="type-filter" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            <option value="Todos">Todos</option>
            {ENCOUNTER_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="status-filter">Estado</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as AppointmentStatus | "Todos")}
          >
            <option value="Todos">Todos</option>
            <option value="confirmed">Confirmadas</option>
            <option value="pending">Pendientes</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>
      </div>

      <section className="calendar-board" aria-label="Calendario administrativo">
        <div className="calendar-toolbar">
          <div>
            <p className="toolbar-kicker">Vista actual</p>
            <h3>{calendarView === "month" ? monthLabel(visibleMonth) : longDateLabel(selectedDate)}</h3>
          </div>
          <div className="calendar-actions" aria-label="Acciones del calendario">
            <button className="icon-button" type="button" onClick={() => moveMonth(-1)} title="Mes anterior">
              &lt;
            </button>
            <button className="button secondary" type="button" onClick={goToToday}>
              Hoy
            </button>
            <button className="icon-button" type="button" onClick={() => moveMonth(1)} title="Mes siguiente">
              &gt;
            </button>
            <div className="segmented" role="tablist" aria-label="Cambiar vista">
              <button
                className={calendarView === "month" ? "active" : ""}
                type="button"
                onClick={() => setCalendarView("month")}
              >
                Mes
              </button>
              <button
                className={calendarView === "day" ? "active" : ""}
                type="button"
                onClick={() => setCalendarView("day")}
              >
                Dia
              </button>
            </div>
          </div>
        </div>

        {calendarView === "month" ? (
          <div className="month-view">
            <div className="weekday-row" aria-hidden="true">
              {["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="month-grid">
              {monthDays.map((day) => {
                const dateKey = toLocalDateKey(day);
                const dayAppointments = appointmentsByDay.get(dateKey) || [];
                const isSelected = dateKey === selectedDate;
                const isToday = dateKey === todayKey;
                const isOutsideMonth = day.getMonth() !== visibleMonth.getMonth();
                const activeDayAppointments = dayAppointments.filter(
                  (appointment) => appointment.status !== "cancelled"
                );

                return (
                  <button
                    className={`calendar-day ${isSelected ? "selected" : ""} ${
                      isToday ? "today" : ""
                    } ${isOutsideMonth ? "muted" : ""}`}
                    key={dateKey}
                    onClick={() => selectCalendarDay(dateKey)}
                    type="button"
                  >
                    <span className="day-number">{day.getDate()}</span>
                    {activeDayAppointments.length > 0 ? (
                      <span className="day-count">{activeDayAppointments.length}</span>
                    ) : null}
                    <span className="day-events">
                      {dayAppointments.slice(0, 3).map((appointment) => (
                        <span className={`event-dot ${appointment.status}`} key={appointment.id}>
                          {formatTime(appointment.starts_at)} {getEncounterType(appointment.service)}
                        </span>
                      ))}
                      {dayAppointments.length > 3 ? (
                        <span className="event-more">+{dayAppointments.length - 3} mas</span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="day-view">
            <aside className="day-list" aria-label="Compromisos del dia seleccionado">
              <div className="day-list-header">
                <h3>{longDateLabel(selectedDate)}</h3>
                <span className="pill">{selectedDayAppointments.length} compromisos</span>
              </div>
              {selectedDayAppointments.length === 0 ? (
                <div className="empty-state">
                  <strong>Dia disponible</strong>
                  <span>No hay encuentros con los filtros actuales.</span>
                </div>
              ) : (
                selectedDayAppointments.map((appointment) => (
                  <button
                    className={`appointment-card ${
                      selectedAppointment?.id === appointment.id ? "selected" : ""
                    }`}
                    key={appointment.id}
                    onClick={() => setSelectedAppointmentId(appointment.id)}
                    type="button"
                  >
                    <span className="appointment-time">
                      {formatTime(appointment.starts_at)} - {formatTime(appointment.ends_at)}
                    </span>
                    <strong>{appointment.name}</strong>
                    <span>
                      {getEncounterType(appointment.service)} | {getServiceName(appointment.service)}
                    </span>
                    <span className={`badge ${appointment.status}`}>{statusLabel(appointment.status)}</span>
                  </button>
                ))
              )}
            </aside>
            <div className="timeline" aria-label="Linea de tiempo del dia">
              {Array.from(
                { length: BUSINESS_HOURS.endHour - BUSINESS_HOURS.startHour },
                (_, index) => BUSINESS_HOURS.startHour + index
              ).map((hour) => {
                const appointment = selectedDayAppointments.find(
                  (item) => new Date(item.starts_at).getHours() === hour
                );

                return (
                  <div className="timeline-row" key={hour}>
                    <span className="timeline-hour">{`${String(hour).padStart(2, "0")}:00`}</span>
                    <div className={`timeline-slot ${appointment ? "busy" : "free"}`}>
                      {appointment ? (
                        <button
                          className="timeline-event"
                          type="button"
                          onClick={() => setSelectedAppointmentId(appointment.id)}
                        >
                          <strong>{appointment.name}</strong>
                          <span>{getEncounterType(appointment.service)}</span>
                        </button>
                      ) : (
                        <span>Disponible</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <aside className="detail-panel" aria-label="Detalle del compromiso">
              {selectedAppointment ? (
                <>
                  <span className="type-badge">{getEncounterType(selectedAppointment.service)}</span>
                  <h3>{selectedAppointment.name}</h3>
                  <p>{getServiceName(selectedAppointment.service)}</p>
                  <dl>
                    <div>
                      <dt>Horario</dt>
                      <dd>
                        {formatTime(selectedAppointment.starts_at)} - {formatTime(selectedAppointment.ends_at)}
                      </dd>
                    </div>
                    <div>
                      <dt>Contacto</dt>
                      <dd>{selectedAppointment.email}</dd>
                    </div>
                    {selectedAppointment.phone ? (
                      <div>
                        <dt>Telefono</dt>
                        <dd>{selectedAppointment.phone}</dd>
                      </div>
                    ) : null}
                    <div>
                      <dt>Estado</dt>
                      <dd>
                        <span className={`badge ${selectedAppointment.status}`}>
                          {statusLabel(selectedAppointment.status)}
                        </span>
                      </dd>
                    </div>
                    {selectedAppointment.notes ? (
                      <div>
                        <dt>Notas</dt>
                        <dd>{selectedAppointment.notes}</dd>
                      </div>
                    ) : null}
                  </dl>
                  <div className="admin-tools">
                    <button
                      className="button secondary"
                      disabled={loading || selectedAppointment.status === "confirmed"}
                      onClick={() => updateStatus(selectedAppointment.id, "confirmed")}
                      type="button"
                    >
                      Confirmar
                    </button>
                    <button
                      className="button secondary"
                      disabled={loading || selectedAppointment.status === "cancelled"}
                      onClick={() => updateStatus(selectedAppointment.id, "cancelled")}
                      type="button"
                    >
                      Cancelar
                    </button>
                    {renderDeleteControls(selectedAppointment)}
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <strong>Sin seleccion</strong>
                  <span>Elige un compromiso del dia para ver sus detalles.</span>
                </div>
              )}
            </aside>
          </div>
        )}
      </section>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Tipo</th>
              <th>Servicio / proceso</th>
              <th>Contacto</th>
              <th>Estado</th>
              <th>Calendario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={8}>Carga la agenda para ver los encuentros.</td>
              </tr>
            ) : filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan={8}>No hay encuentros con estos filtros.</td>
              </tr>
            ) : (
              filteredAppointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{formatDateTime(appointment.starts_at)}</td>
                  <td>
                    <strong>{appointment.name}</strong>
                    {appointment.notes ? <div>{appointment.notes}</div> : null}
                  </td>
                  <td>
                    <span className="type-badge">{getEncounterType(appointment.service)}</span>
                  </td>
                  <td>{getServiceName(appointment.service)}</td>
                  <td>
                    <div>{appointment.email}</div>
                    {appointment.phone ? <div>{appointment.phone}</div> : null}
                  </td>
                  <td>
                    <span className={`badge ${appointment.status}`}>{statusLabel(appointment.status)}</span>
                  </td>
                  <td>
                    {appointment.calendar_html_link ? (
                      <a href={appointment.calendar_html_link} target="_blank" rel="noreferrer">
                        Ver evento
                      </a>
                    ) : (
                      "Sin evento"
                    )}
                  </td>
                  <td>
                    <div className="admin-tools">
                      <button
                        className="button secondary"
                        disabled={loading || appointment.status === "confirmed"}
                        onClick={() => updateStatus(appointment.id, "confirmed")}
                        type="button"
                      >
                        Confirmar
                      </button>
                      <button
                        className="button secondary"
                        disabled={loading || appointment.status === "cancelled"}
                        onClick={() => updateStatus(appointment.id, "cancelled")}
                        type="button"
                      >
                        Cancelar
                      </button>
                      {renderDeleteControls(appointment)}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
