import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LearnerProgressKey, readLearnerProgress } from "@/lib/portal/learner-progress";

export type AuthenticatedLearner = {
  learnerName: string;
  learnerEmail: string;
  savedProgress: unknown;
};

export async function authenticatedLearner(nextPath: string, progressKey: LearnerProgressKey = "grammar_play"): Promise<AuthenticatedLearner> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  const cookieStore = await cookies();
  const supabase = createServerClient(url, key, {
    cookies: { getAll: () => cookieStore.getAll(), setAll: () => undefined }
  });
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
    return {
      learnerName: String(user.user_metadata?.full_name || user.email?.split("@")[0] || "Aprendiz"),
      learnerEmail: user.email || "",
      savedProgress: await readLearnerProgress(user.id, progressKey)
    };
  } catch {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
}
