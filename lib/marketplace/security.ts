import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, hasSupabaseAdminConfig, useMarketplaceDemoMode } from "@/lib/supabase/server";

export function hasAdminAccess(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("adminToken") || request.headers.get("x-admin-token");
  return Boolean(process.env.ADMIN_ACCESS_TOKEN && token === process.env.ADMIN_ACCESS_TOKEN);
}

export function requireAdmin(request: NextRequest) {
  if (!hasAdminAccess(request)) {
    return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  }

  return null;
}

export type AdminContext = {
  userId: string | null;
  role: "admin" | "super_admin";
  source: "supabase" | "admin_token";
};

export async function getAdminContext(request: NextRequest): Promise<AdminContext | null> {
  if (hasAdminAccess(request)) {
    return { userId: null, role: "super_admin", source: "admin_token" };
  }

  if (useMarketplaceDemoMode() || !hasSupabaseAdminConfig()) {
    return null;
  }

  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : null;
  if (!token) return null;

  const supabase = createSupabaseServerClient();
  const { data: userResult, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userResult.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", userResult.user.id)
    .maybeSingle();

  if (profile?.role === "admin" || profile?.role === "super_admin") {
    return { userId: profile.id, role: profile.role, source: "supabase" };
  }

  return null;
}

export async function requireAdminContext(request: NextRequest) {
  const admin = await getAdminContext(request);
  if (!admin) {
    return {
      admin: null,
      response: NextResponse.json({ error: "Admin or super_admin access required." }, { status: 401 })
    };
  }

  return { admin, response: null };
}

export function clientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
