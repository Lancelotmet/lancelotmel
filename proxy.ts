import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const token = process.env.ADMIN_ACCESS_TOKEN;
  const isAdminPath =
    request.nextUrl.pathname.startsWith("/admin/marketplace") ||
    request.nextUrl.pathname.startsWith("/admin/products");

  if (!isAdminPath || !token) {
    return NextResponse.next();
  }

  const queryToken = request.nextUrl.searchParams.get("adminToken");
  const cookieToken = request.cookies.get("lancelot_admin_token")?.value;

  if (queryToken === token) {
    const response = NextResponse.next();
    response.cookies.set("lancelot_admin_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });
    return response;
  }

  if (cookieToken === token) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/login?admin=required", request.url));
}

export const config = {
  matcher: ["/admin/marketplace/:path*", "/admin/products/:path*", "/admin/products"]
};
