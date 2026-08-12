import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (supabaseUrl && supabaseKey) {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        }
      }
    });
    await supabase.auth.getUser();
  }

  const token = process.env.ADMIN_ACCESS_TOKEN;
  const isAdminPath =
    request.nextUrl.pathname.startsWith("/admin/marketplace") ||
    request.nextUrl.pathname.startsWith("/admin/products");

  if (!isAdminPath || !token) {
    return response;
  }

  const queryToken = request.nextUrl.searchParams.get("adminToken");
  const cookieToken = request.cookies.get("lancelot_admin_token")?.value;

  if (queryToken === token) {
    response.cookies.set("lancelot_admin_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });
    return response;
  }

  if (cookieToken === token) {
    return response;
  }

  const redirect = NextResponse.redirect(new URL("/login?admin=required", request.url));
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export const config = {
  matcher: ["/filosofia", "/admin/marketplace/:path*", "/admin/products/:path*", "/admin/products"]
};
