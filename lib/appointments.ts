export const ENCOUNTER_TYPES = [
  "Cita",
  "Clase",
  "Sesion",
  "Diagnostico",
  "Consulta"
] as const;

export const SERVICES_BY_TYPE = {
  Cita: [
    "Orientacion inicial",
    "Seguimiento familiar",
    "Planeacion pedagogica",
    "Acompañamiento institucional"
  ],
  Clase: [
    "Clase personalizada",
    "Refuerzo academico",
    "Estrategias de estudio",
    "Lectura, escritura y pensamiento"
  ],
  Sesion: [
    "Sesion pedagogica",
    "Sesion de orientacion",
    "Sesion con familia",
    "Sesion de cierre"
  ],
  Diagnostico: [
    "Diagnostico de aprendizaje",
    "Caracterizacion pedagogica",
    "Perfil de fortalezas y retos",
    "Informe pedagogico"
  ],
  Consulta: [
    "Consulta inicial",
    "Consulta de seguimiento",
    "Consulta virtual",
    "Consulta para instituciones"
  ]
} as const;

export const APPOINTMENT_SERVICES = Object.values(SERVICES_BY_TYPE).flat();

export const BUSINESS_HOURS = {
  startHour: 8,
  endHour: 18,
  slotMinutes: 60,
  maxDaysAhead: 45
};

export type AppointmentStatus = "pending" | "confirmed" | "cancelled";

export type Appointment = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  service: string;
  starts_at: string;
  ends_at: string;
  notes: string | null;
  status: AppointmentStatus;
  google_event_id: string | null;
  calendar_html_link: string | null;
};

export type BookingPayload = {
  name: string;
  email: string;
  phone?: string;
  encounterType?: string;
  service: string;
  startsAt: string;
  notes?: string;
};

export type AvailableSlot = {
  startsAt: string;
  label: string;
  available: boolean;
};

export function getNotifyEmails() {
  return (process.env.APPOINTMENT_NOTIFY_EMAILS || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
}

export function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export function formatDateTime(value: string | Date) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Bogota"
  }).format(new Date(value));
}

export function formatDateKey(value: string | Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Bogota",
    year: "numeric"
  }).formatToParts(new Date(value));
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

export function formatTime(value: string | Date) {
  return new Intl.DateTimeFormat("es-CO", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Bogota"
  }).format(new Date(value));
}

export function isSupportedService(service: string) {
  const cleanService = getServiceName(service);
  return APPOINTMENT_SERVICES.includes(cleanService as (typeof APPOINTMENT_SERVICES)[number]);
}

export function isSupportedEncounterType(encounterType: string) {
  return ENCOUNTER_TYPES.includes(encounterType as (typeof ENCOUNTER_TYPES)[number]);
}

export function composeService(encounterType: string, service: string) {
  return `${encounterType}: ${service}`;
}

export function getEncounterType(service: string) {
  const [prefix] = service.split(":");
  const cleanPrefix = prefix.trim();
  if (isSupportedEncounterType(cleanPrefix)) {
    return cleanPrefix;
  }

  if (service.toLowerCase().includes("clase")) return "Clase";
  if (service.toLowerCase().includes("diagnostico")) return "Diagnostico";
  if (service.toLowerCase().includes("sesion")) return "Sesion";
  if (service.toLowerCase().includes("consulta")) return "Consulta";
  return "Cita";
}

export function getServiceName(service: string) {
  const separatorIndex = service.indexOf(":");
  if (separatorIndex === -1) {
    return service;
  }

  return service.slice(separatorIndex + 1).trim();
}

export function isBusinessSlot(date: Date) {
  const day = date.getDay();
  const hour = date.getHours();
  const minutes = date.getMinutes();

  return (
    day >= 1 &&
    day <= 5 &&
    minutes === 0 &&
    hour >= BUSINESS_HOURS.startHour &&
    hour < BUSINESS_HOURS.endHour
  );
}

export function buildSlotsForDate(dateValue: string, blockedStarts: Set<string>) {
  const slots: AvailableSlot[] = [];
  const [year, month, day] = dateValue.split("-").map(Number);

  if (!year || !month || !day) {
    return slots;
  }

  for (let hour = BUSINESS_HOURS.startHour; hour < BUSINESS_HOURS.endHour; hour += 1) {
    const startsAt = new Date(year, month - 1, day, hour, 0, 0, 0);
    if (!isBusinessSlot(startsAt)) {
      continue;
    }

    const iso = startsAt.toISOString();
    slots.push({
      startsAt: iso,
      label: new Intl.DateTimeFormat("es-CO", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: "America/Bogota"
      }).format(startsAt),
      available: !blockedStarts.has(iso)
    });
  }

  return slots;
}
