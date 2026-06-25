import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient, hasSupabaseAdminConfig, useMarketplaceDemoMode } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/marketplace/security";

const availabilitySchema = z.object({
  instructorId: z.string().min(1),
  startTimeUtc: z.string().datetime(),
  endTimeUtc: z.string().datetime(),
  timezone: z.string().default("America/Bogota")
});

export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const parsed = availabilitySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid availability." }, { status: 400 });
  }

  if (useMarketplaceDemoMode() || !hasSupabaseAdminConfig()) {
    return NextResponse.json({ ok: true, slot: { id: `demo-slot-${Date.now()}`, ...parsed.data } });
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("availability_slots")
    .insert({
      end_time_utc: parsed.data.endTimeUtc,
      instructor_id: parsed.data.instructorId,
      start_time_utc: parsed.data.startTimeUtc,
      timezone: parsed.data.timezone
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, slot: data });
}
