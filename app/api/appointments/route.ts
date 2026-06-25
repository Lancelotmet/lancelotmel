import { NextRequest, NextResponse } from "next/server";
import {
  addMinutes,
  Appointment,
  BookingPayload,
  BUSINESS_HOURS,
  composeService,
  isBusinessSlot,
  isSupportedEncounterType,
  isSupportedService
} from "@/lib/appointments";
import { createCalendarEvent } from "@/lib/google-calendar";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function hasAdminAccess(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("adminToken") || request.headers.get("x-admin-token");
  return Boolean(process.env.ADMIN_ACCESS_TOKEN && token === process.env.ADMIN_ACCESS_TOKEN);
}

export async function GET(request: NextRequest) {
  if (!hasAdminAccess(request)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("starts_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ appointments: data });
}

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as Partial<BookingPayload>;

  if (!payload.name?.trim()) {
    return badRequest("El nombre es obligatorio.");
  }

  if (!payload.email?.trim() || !payload.email.includes("@")) {
    return badRequest("Ingresa un correo valido.");
  }

  if (!payload.encounterType || !isSupportedEncounterType(payload.encounterType)) {
    return badRequest("Selecciona un tipo de encuentro valido.");
  }

  if (!payload.service || !isSupportedService(payload.service)) {
    return badRequest("Selecciona un servicio valido.");
  }

  if (!payload.startsAt) {
    return badRequest("Selecciona un horario disponible.");
  }

  const startsAt = new Date(payload.startsAt);

  if (Number.isNaN(startsAt.getTime()) || !isBusinessSlot(startsAt)) {
    return badRequest("El horario seleccionado no esta disponible.");
  }

  if (startsAt.getTime() <= Date.now()) {
    return badRequest("Selecciona una fecha futura.");
  }

  const endsAt = addMinutes(startsAt, BUSINESS_HOURS.slotMinutes);
  const supabase = createSupabaseServerClient();

  const { data: existing, error: existingError } = await supabase
    .from("appointments")
    .select("id")
    .eq("starts_at", startsAt.toISOString())
    .neq("status", "cancelled")
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  if (existing) {
    return NextResponse.json({ error: "Ese horario ya fue reservado." }, { status: 409 });
  }

  const insertPayload = {
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone?.trim() || null,
    service: composeService(payload.encounterType, payload.service),
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    notes: payload.notes?.trim() || null,
    status: "confirmed"
  };

  const { data: appointment, error: insertError } = await supabase
    .from("appointments")
    .insert(insertPayload)
    .select("*")
    .single<Appointment>();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  let calendarMessage = "Reserva guardada. Configura Google Calendar para enviar invitaciones automaticas.";
  let calendarConfigured = false;

  try {
    const calendar = await createCalendarEvent(appointment, payload as BookingPayload);
    calendarConfigured = calendar.configured;

    if (calendar.configured) {
      await supabase
        .from("appointments")
        .update({
          google_event_id: calendar.eventId,
          calendar_html_link: calendar.htmlLink
        })
        .eq("id", appointment.id);

      calendarMessage = calendar.message || "Invitacion de calendario enviada.";
    }
  } catch (error) {
    calendarMessage =
      error instanceof Error
        ? `Reserva guardada, pero Google Calendar fallo: ${error.message}`
        : "Reserva guardada, pero Google Calendar fallo.";
  }

  return NextResponse.json({
    appointment,
    calendarConfigured,
    message: calendarMessage
  });
}
