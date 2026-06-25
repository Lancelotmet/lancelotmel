import { createSupabaseServerClient, hasSupabaseAdminConfig, useMarketplaceDemoMode } from "@/lib/supabase/server";

type PaymentResult = {
  orderId: string;
  status: "paid" | "failed";
};

export async function markOrderPaid(orderId: string, provider = "demo", eventId = `demo-${Date.now()}`): Promise<PaymentResult> {
  if (useMarketplaceDemoMode() || !hasSupabaseAdminConfig()) {
    return { orderId, status: "paid" };
  }

  const supabase = createSupabaseServerClient();

  const { data: existingEvent } = await supabase
    .from("payment_events")
    .select("id")
    .eq("event_id", eventId)
    .maybeSingle();

  if (existingEvent) {
    return { orderId, status: "paid" };
  }

  await supabase.from("payment_events").insert({
    event_id: eventId,
    event_type: "checkout.session.completed",
    payload: { orderId },
    processed_at: new Date().toISOString(),
    provider
  });

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) {
    throw new Error(orderError?.message ?? "Order not found.");
  }

  if (order.status === "paid") {
    return { orderId, status: "paid" };
  }

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  if (itemsError) throw new Error(itemsError.message);

  await supabase
    .from("orders")
    .update({
      payment_provider: provider,
      status: "paid",
      updated_at: new Date().toISOString()
    })
    .eq("id", orderId);

  for (const item of items ?? []) {
    if (item.product_id) {
      const { data: file } = await supabase
        .from("product_files")
        .select("id")
        .eq("product_id", item.product_id)
        .eq("is_active", true)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();

      await supabase.from("download_access").upsert(
        {
          download_limit: 5,
          downloads_used: 0,
          is_active: true,
          order_id: orderId,
          product_file_id: file?.id ?? null,
          product_id: item.product_id,
          user_id: order.user_id
        },
        { onConflict: "order_id,product_id" }
      );
    }

    if (item.booking_id) {
      await supabase
        .from("bookings")
        .update({
          meeting_url: `https://meet.google.com/lancelot-${String(item.booking_id).slice(0, 8)}`,
          status: "confirmed",
          updated_at: new Date().toISOString()
        })
        .eq("id", item.booking_id);

      await supabase
        .from("availability_slots")
        .update({ is_booked: true })
        .eq("id", item.metadata?.slot_id ?? "00000000-0000-0000-0000-000000000000");
    }
  }

  await supabase.from("audit_logs").insert({
    action: "order_paid",
    entity_id: orderId,
    entity_type: "order",
    metadata: { provider }
  });

  return { orderId, status: "paid" };
}
