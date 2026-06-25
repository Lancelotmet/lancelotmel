import {
  Appointment,
  BookingPayload,
  formatDateTime,
  getNotifyEmails,
  getEncounterType,
  getServiceName
} from "@/lib/appointments";

type GoogleEventResponse = {
  id?: string;
  htmlLink?: string;
  error?: {
    message?: string;
  };
};

function hasCalendarCredentials() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN
  );
}

async function getAccessToken() {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN || "",
      grant_type: "refresh_token"
    })
  });

  const data = (await response.json()) as { access_token?: string; error_description?: string };

  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || "Google OAuth token request failed.");
  }

  return data.access_token;
}

export async function createCalendarEvent(appointment: Appointment, payload: BookingPayload) {
  if (!hasCalendarCredentials()) {
    return {
      configured: false,
      eventId: null,
      htmlLink: null
    };
  }

  const accessToken = await getAccessToken();
  const calendarId = encodeURIComponent(process.env.GOOGLE_CALENDAR_ID || "primary");
  const notifyEmails = new Set([...getNotifyEmails(), payload.email].filter(Boolean));

  const description = [
    `Tipo: ${getEncounterType(appointment.service)}`,
    `Servicio: ${getServiceName(appointment.service)}`,
    `Cliente: ${payload.name}`,
    `Correo: ${payload.email}`,
    payload.phone ? `Telefono: ${payload.phone}` : null,
    payload.notes ? `Notas: ${payload.notes}` : null,
    "",
    "Reserva creada desde el centro de administracion de encuentros de Lancelot."
  ]
    .filter(Boolean)
    .join("\n");

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?sendUpdates=all`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        summary: `Lancelot - ${getEncounterType(appointment.service)} con ${payload.name}`,
        description,
        start: {
          dateTime: appointment.starts_at,
          timeZone: "America/Bogota"
        },
        end: {
          dateTime: appointment.ends_at,
          timeZone: "America/Bogota"
        },
        attendees: Array.from(notifyEmails).map((email) => ({ email })),
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 24 * 60 },
            { method: "popup", minutes: 30 }
          ]
        }
      })
    }
  );

  const event = (await response.json()) as GoogleEventResponse;

  if (!response.ok) {
    throw new Error(event.error?.message || "Google Calendar event creation failed.");
  }

  return {
    configured: true,
    eventId: event.id || null,
    htmlLink: event.htmlLink || null,
    message: `Invitacion enviada para ${formatDateTime(appointment.starts_at)}.`
  };
}
