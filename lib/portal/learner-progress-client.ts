"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { LearnerProgressKey } from "@/lib/portal/learner-progress";

export async function saveLearnerProgress(key: LearnerProgressKey, progress: unknown) {
  const { data: { session } } = await createSupabaseBrowserClient().auth.getSession();
  if (!session?.access_token) throw new Error("No active learner session.");
  const response = await fetch("/api/learner-progress", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ key, progress })
  });
  if (!response.ok) throw new Error("Could not save learner progress.");
}
