import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, hasSupabaseAdminConfig, useMarketplaceDemoMode } from "@/lib/supabase/server";
import { supportTicketSchema } from "@/lib/marketplace/validators";

export async function POST(request: NextRequest) {
  const parsed = supportTicketSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid support ticket." }, { status: 400 });
  }

  if (!useMarketplaceDemoMode() && hasSupabaseAdminConfig()) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from("support_tickets").insert({
      booking_id: parsed.data.bookingId,
      message: parsed.data.message,
      order_id: parsed.data.orderId,
      product_id: parsed.data.productId,
      subject: parsed.data.subject
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: "Support request received." });
}
