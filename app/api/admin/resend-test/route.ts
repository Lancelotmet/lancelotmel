import { NextRequest, NextResponse } from "next/server";
import { sendLancelotTestEmail } from "@/lib/resend";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const adminToken = process.env.ADMIN_ACCESS_TOKEN;
  const providedToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!adminToken || providedToken !== adminToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await sendLancelotTestEmail();
    return NextResponse.json({ id: result?.id ?? null });
  } catch (error) {
    console.error("Resend test email failed", error);
    return NextResponse.json({ error: "Unable to send the test email." }, { status: 500 });
  }
}
