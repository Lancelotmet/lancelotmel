import { NextRequest, NextResponse } from "next/server";
import { buildSlotsForDate } from "@/lib/appointments";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Fecha invalida." }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const start = new Date(`${date}T00:00:00`);
  const end = new Date(`${date}T23:59:59`);

  const { data, error } = await supabase
    .from("appointments")
    .select("starts_at")
    .neq("status", "cancelled")
    .gte("starts_at", start.toISOString())
    .lte("starts_at", end.toISOString());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const blockedStarts = new Set(
    (data || []).map((row) => new Date(row.starts_at).toISOString())
  );

  return NextResponse.json({ slots: buildSlotsForDate(date, blockedStarts) });
}
