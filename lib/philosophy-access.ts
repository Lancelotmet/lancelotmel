import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function authorizedEmails() {
  return new Set(
    (process.env.PHILOSOPHY_AUTHORIZED_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

export async function getPhilosophyAccess() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const allowed = authorizedEmails();

  if (!url || !key) return { isSignedIn: false, canReadRestrictedVolumes: false };

  const cookieStore = await cookies();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // This Server Component only reads an existing session. The browser client manages session renewal.
      }
    }
  });
  const { data: { user } } = await supabase.auth.getUser();
  const email = user?.email?.trim().toLowerCase();

  return {
    isSignedIn: Boolean(user),
    canReadRestrictedVolumes: Boolean(email && allowed.has(email))
  };
}
