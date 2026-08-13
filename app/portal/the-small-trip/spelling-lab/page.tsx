import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SpellingLab } from "@/components/spelling-lab/SpellingLab";

export default async function SpellingLabPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) redirect("/login?next=/portal/the-small-trip/spelling-lab");

  const cookieStore = await cookies();
  const supabase = createServerClient(url, key, { cookies: { getAll: () => cookieStore.getAll(), setAll: () => undefined } });
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login?next=/portal/the-small-trip/spelling-lab");
  } catch {
    redirect("/login?next=/portal/the-small-trip/spelling-lab");
  }
  return <SpellingLab />;
}
