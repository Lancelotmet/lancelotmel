import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, hasSupabaseAdminConfig, useMarketplaceDemoMode } from "@/lib/supabase/server";
import { createDemoBookingHold, listAvailability, listExperiences } from "@/lib/marketplace/repository";
import { bookingHoldSchema } from "@/lib/marketplace/validators";

export async function POST(request: NextRequest) {
  const parsed = bookingHoldSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid booking payload." }, { status: 400 });
  }

  const payload = parsed.data;

  if (useMarketplaceDemoMode() || !hasSupabaseAdminConfig()) {
    const booking = await createDemoBookingHold(payload);
    if (!booking) return NextResponse.json({ error: "Slot is not available." }, { status: 409 });
    return NextResponse.json({ booking });
  }

  const [slots, experiences] = await Promise.all([listAvailability(payload.experienceId), listExperiences(payload.productId)]);
  const slot = slots.find((candidate) => candidate.id === payload.slotId);
  const experience = experiences.find((candidate) => candidate.id === payload.experienceId);
  if (!slot || !experience || slot.isBooked || !slot.isAvailable) {
    return NextResponse.json({ error: "Slot is not available." }, { status: 409 });
  }

  const supabase = createSupabaseServerClient();
  const { data: overlap } = await supabase
    .from("bookings")
    .select("id")
    .eq("instructor_id", experience.instructorId)
    .in("status", ["pending_payment", "confirmed"])
    .lt("start_time_utc", slot.endTimeUtc)
    .gt("end_time_utc", slot.startTimeUtc)
    .maybeSingle();

  if (overlap) {
    return NextResponse.json({ error: "This instructor already has a booking in that slot." }, { status: 409 });
  }

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      experience_id: experience.id,
      hold_expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      instructor_id: experience.instructorId,
      instructor_timezone: slot.timezone,
      product_id: payload.productId,
      start_time_utc: slot.startTimeUtc,
      end_time_utc: slot.endTimeUtc,
      status: "pending_payment",
      student_notes: payload.studentNotes ?? null,
      student_timezone: payload.studentTimezone
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ booking });
}
