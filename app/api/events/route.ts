import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, hasSupabaseAdminConfig, useMarketplaceDemoMode } from "@/lib/supabase/server";
import { eventSchema } from "@/lib/marketplace/validators";

export async function POST(request: NextRequest) {
  const parsed = eventSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid event." }, { status: 400 });
  }

  if (!useMarketplaceDemoMode() && hasSupabaseAdminConfig()) {
    const supabase = createSupabaseServerClient();
    await supabase.from("user_events").insert({
      anonymous_id: parsed.data.anonymousId,
      event_type: parsed.data.eventType,
      metadata: parsed.data.metadata ?? {},
      product_id: parsed.data.productId,
      user_id: parsed.data.userId
    });
  }

  return NextResponse.json({ ok: true });
}
