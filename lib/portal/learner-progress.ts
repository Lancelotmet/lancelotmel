export type LearnerProgressKey = "grammar_play" | "spelling_lab";

const BUCKET = "learner-progress";

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && secret ? { url, secret } : null;
}

function objectPath(userId: string, key: LearnerProgressKey) { return `${userId}/${key}.json`; }
function headers(secret: string, extra: HeadersInit = {}) { return { apikey: secret, authorization: `Bearer ${secret}`, ...extra }; }

export async function readLearnerProgress(userId: string, key: LearnerProgressKey): Promise<unknown> {
  const settings = config();
  if (!settings) return null;
  try {
    const response = await fetch(`${settings.url}/storage/v1/object/${BUCKET}/${objectPath(userId, key)}`, { headers: headers(settings.secret) });
    if (response.status === 404) return null;
    if (!response.ok) return null;
    const payload = await response.json() as { progress?: unknown };
    return payload.progress ?? null;
  } catch { return null; }
}

export async function saveLearnerProgress(userId: string, key: LearnerProgressKey, progress: unknown) {
  const settings = config();
  if (!settings) throw new Error("Progress persistence is not configured.");
  const response = await fetch(`${settings.url}/storage/v1/object/${BUCKET}/${objectPath(userId, key)}`, {
    method: "POST",
    headers: headers(settings.secret, { "content-type": "application/json", "x-upsert": "true" }),
    body: JSON.stringify({ progress, version: 1, saved_at: new Date().toISOString() })
  });
  if (!response.ok) throw new Error("Could not save learner progress.");
}
