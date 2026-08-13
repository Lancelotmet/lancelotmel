import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LancelotLearningPortal } from "@/components/portal/LancelotLearningPortal";

export default async function PortalPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) redirect("/login?next=/portal");

  const cookieStore = await cookies();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => undefined
    }
  });

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login?next=/portal");
    const learnerName = String(user.user_metadata?.full_name || user.email?.split("@")[0] || "Aprendiz");
    return <LancelotLearningPortal learnerName={learnerName} learnerEmail={user.email || ""} />;
  } catch {
    redirect("/login?next=/portal");
  }
}
