import { NextRequest, NextResponse } from "next/server";
import { AppointmentStatus } from "@/lib/appointments";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const allowedStatuses: AppointmentStatus[] = ["pending", "confirmed", "cancelled"];

function hasAdminAccess(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("adminToken") || request.headers.get("x-admin-token");
  return Boolean(process.env.ADMIN_ACCESS_TOKEN && token === process.env.ADMIN_ACCESS_TOKEN);
}

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  if (!hasAdminAccess(request)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as { status?: AppointmentStatus };

  if (!body.status || !allowedStatuses.includes(body.status)) {
    return NextResponse.json({ error: "Estado invalido." }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("appointments")
    .update({ status: body.status })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ appointment: data });
}

export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  if (!hasAdminAccess(request)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await context.params;
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("appointments").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
