"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AvailableSlot, ENCOUNTER_TYPES, SERVICES_BY_TYPE } from "@/lib/appointments";

type SubmitState =
  | { type: "idle"; message: "" }
  | { type: "info" | "ok" | "error"; message: string };

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function BookingForm() {
  const today = useMemo(() => toDateInputValue(new Date()), []);
  const [date, setDate] = useState(today);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [encounterType, setEncounterType] = useState<(typeof ENCOUNTER_TYPES)[number]>("Cita");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState<SubmitState>({ type: "idle", message: "" });

  useEffect(() => {
    let ignore = false;

    async function loadSlots() {
      setLoadingSlots(true);
      setSelectedSlot("");
      setState({ type: "idle", message: "" });

      try {
        const response = await fetch(`/api/availability?date=${date}`);
        const data = (await response.json()) as { slots?: AvailableSlot[]; error?: string };

        if (!ignore) {
          if (!response.ok) {
            setState({ type: "error", message: data.error || "No se pudo consultar disponibilidad." });
            setSlots([]);
          } else {
            setSlots(data.slots || []);
          }
        }
      } catch {
        if (!ignore) {
          setState({ type: "error", message: "No se pudo consultar disponibilidad." });
          setSlots([]);
        }
      } finally {
        if (!ignore) {
          setLoadingSlots(false);
        }
      }
    }

    loadSlots();
    return () => {
      ignore = true;
    };
  }, [date]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const bookingForm = event.currentTarget;
    setSubmitting(true);
    setState({ type: "info", message: "Confirmando la reserva..." });

    const form = new FormData(bookingForm);
    const payload = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      phone: String(form.get("phone") || ""),
      encounterType: String(form.get("encounterType") || ""),
      service: String(form.get("service") || ""),
      startsAt: selectedSlot,
      notes: String(form.get("notes") || "")
    };

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = (await response.json().catch(() => ({}))) as { message?: string; error?: string };

      if (!response.ok) {
        setState({
          type: "error",
          message: data.error || `No se pudo crear la reserva. Codigo ${response.status}.`
        });
        return;
      }

      setState({ type: "ok", message: data.message || "Reserva confirmada." });
      bookingForm.reset();
      setSelectedSlot("");
      const availability = await fetch(`/api/availability?date=${date}`);
      const availabilityData = (await availability.json()) as { slots?: AvailableSlot[] };
      setSlots(availabilityData.slots || []);
    } catch (error) {
      setState({
        type: "error",
        message:
          error instanceof Error
            ? `No se pudo crear la reserva: ${error.message}`
            : "No se pudo crear la reserva."
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="name">Nombre completo</label>
        <input id="name" name="name" autoComplete="name" required />
      </div>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="email">Correo</label>
          <input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="field">
          <label htmlFor="phone">Telefono</label>
          <input id="phone" name="phone" autoComplete="tel" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="encounterType">Tipo de encuentro</label>
        <select
          id="encounterType"
          name="encounterType"
          required
          value={encounterType}
          onChange={(event) => setEncounterType(event.target.value as (typeof ENCOUNTER_TYPES)[number])}
        >
          {ENCOUNTER_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="service">Servicio o proceso</label>
        <select id="service" name="service" required key={encounterType}>
          {SERVICES_BY_TYPE[encounterType].map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="date">Fecha</label>
        <input id="date" type="date" min={today} value={date} onChange={(event) => setDate(event.target.value)} />
      </div>
      <div className="field">
        <label>Horario disponible</label>
        {loadingSlots ? (
          <p className="status info">Consultando horarios...</p>
        ) : slots.length > 0 ? (
          <div className="slots" role="list" aria-label="Horarios disponibles">
            {slots.map((slot) => (
              <button
                className={`slot ${selectedSlot === slot.startsAt ? "active" : ""} ${
                  slot.available ? "" : "unavailable"
                }`}
                disabled={!slot.available}
                key={slot.startsAt}
                onClick={() => setSelectedSlot(slot.startsAt)}
                type="button"
                title={slot.available ? "Horario disponible" : "Horario no disponible"}
              >
                {slot.available ? slot.label : `${slot.label} no disponible`}
              </button>
            ))}
          </div>
        ) : (
          <p className="status info">No hay horarios disponibles para esta fecha.</p>
        )}
      </div>
      <div className="field">
        <label htmlFor="notes">Notas</label>
        <textarea id="notes" name="notes" placeholder="Motivo de consulta o detalle adicional" />
      </div>
      {state.type !== "idle" ? <p className={`status ${state.type}`}>{state.message}</p> : null}
      <button className="button" disabled={!selectedSlot || submitting} type="submit">
        Confirmar reserva
      </button>
    </form>
  );
}
