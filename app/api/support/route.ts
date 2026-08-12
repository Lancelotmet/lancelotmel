import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, hasSupabaseAdminConfig, useMarketplaceDemoMode } from "@/lib/supabase/server";
import { supportTicketSchema } from "@/lib/marketplace/validators";
import { sendLancelotFormNotification } from "@/lib/resend";

export async function POST(request: NextRequest) {
  const parsed = supportTicketSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid support ticket." }, { status: 400 });
  }

  try {
    await sendLancelotFormNotification({
      source: "Formulario de contacto web",
      subject: parsed.data.subject,
      replyTo: parsed.data.email,
      fields: [
        ["Correo de respuesta", parsed.data.email],
        ["Mensaje", parsed.data.message],
        ["Pedido", parsed.data.orderId],
        ["Producto", parsed.data.productId],
        ["Reserva", parsed.data.bookingId]
      ]
    });
  } catch (error) {
    console.error("Unable to notify the Lancelot contact mailbox", error);
    return NextResponse.json({ error: "No fue posible enviar tu mensaje. Inténtalo nuevamente." }, { status: 502 });
  }

  if (!useMarketplaceDemoMode() && hasSupabaseAdminConfig()) {
    try {
      const supabase = createSupabaseServerClient();
      const { error } = await supabase.from("support_tickets").insert({
        booking_id: parsed.data.bookingId,
        message: parsed.data.message,
        order_id: parsed.data.orderId,
        product_id: parsed.data.productId,
        subject: parsed.data.subject
      });
      if (error) console.error("Unable to archive the contact ticket in Supabase", error);
    } catch (error) {
      // Email delivery is the contact form's primary commitment. Do not reject a valid message if archival is unavailable.
      console.error("Unable to archive the contact ticket in Supabase", error);
    }
  }

  return NextResponse.json({ ok: true, message: "Mensaje recibido." });
}
