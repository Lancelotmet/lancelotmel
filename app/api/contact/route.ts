import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendLancelotFormNotification } from "@/lib/resend";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().max(60).optional().default(""),
  occupation: z.string().trim().max(120).optional().default(""),
  portfolio: z.string().trim().min(2).max(80),
  service: z.string().trim().max(120).optional().default(""),
  message: z.string().trim().min(10).max(3000)
});

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const parsed = contactSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const contact = parsed.data;
  try {
    await sendLancelotFormNotification({
      source: "Formulario de contacto web",
      subject: `Nuevo contacto web: ${contact.name} · ${contact.portfolio}`,
      replyTo: contact.email,
      fields: [
        ["Nombre", contact.name],
        ["Correo", contact.email],
        ["Teléfono", contact.phone],
        ["Ocupación", contact.occupation],
        ["Portafolio", contact.portfolio],
        [contact.portfolio === "Idiomas" ? "Ruta de idiomas" : "Servicio", contact.service],
        ["Qué quiere transformar", contact.message]
      ]
    });
  } catch (error) {
    console.error("Unable to notify the Lancelot contact mailbox", error);
    return NextResponse.json({ error: "No fue posible enviar tu mensaje. Inténtalo nuevamente." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
