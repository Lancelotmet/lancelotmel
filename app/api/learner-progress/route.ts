import { NextRequest, NextResponse } from "next/server";
import { LearnerProgressKey, saveLearnerProgress } from "@/lib/portal/learner-progress";

const validKeys = new Set<LearnerProgressKey>(["grammar_play", "spelling_lab"]);

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!authorization || !url || !key) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json() as { key?: LearnerProgressKey; progress?: unknown };
    if (!body.key || !validKeys.has(body.key) || JSON.stringify(body.progress ?? null).length > 150_000) return NextResponse.json({ error: "Invalid progress payload" }, { status: 400 });
    const userResponse = await fetch(`${url}/auth/v1/user`, { headers: { apikey: key, authorization } });
    if (!userResponse.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await userResponse.json() as { id?: string };
    if (!user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await saveLearnerProgress(user.id, body.key, body.progress);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not save progress" }, { status: 500 });
  }
}
