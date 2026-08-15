import fs from "node:fs";
import path from "node:path";

function envFromFile(file) {
  const values = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !match[1].startsWith("#")) values[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
  return values;
}

const env = { ...envFromFile(path.join(process.cwd(), ".env.local")), ...process.env };
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const secret = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !secret) throw new Error("Missing Supabase server credentials.");
const authHeaders = { apikey: secret, authorization: `Bearer ${secret}` };
const bucket = "learner-progress";
const keys = [["lancelot_grammar_play_v1", "grammar_play"], ["lancelot_spelling_lab_v1", "spelling_lab"]];

async function request(pathname, options = {}, accepted = [200, 201, 204]) {
  const response = await fetch(`${url}${pathname}`, { ...options, headers: { ...authHeaders, ...(options.headers ?? {}) } });
  if (!accepted.includes(response.status)) throw new Error(`Supabase migration request failed: ${response.status}`);
  return response.status === 204 ? null : response.json().catch(() => null);
}

await request("/storage/v1/bucket", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: bucket, name: bucket, public: false }) }, [200, 201, 400, 409]);
let migratedProfiles = 0;
let migratedRecords = 0;
for (let page = 1; ; page += 1) {
  const users = await request(`/auth/v1/admin/users?page=${page}&per_page=100`);
  for (const user of users.users) {
    const metadata = user.user_metadata ?? {};
    const entries = keys.filter(([metadataKey]) => metadata[metadataKey] && typeof metadata[metadataKey] === "object");
    if (!entries.length) continue;
    for (const [metadataKey, progressKey] of entries) {
      await request(`/storage/v1/object/${bucket}/${user.id}/${progressKey}.json`, { method: "POST", headers: { "content-type": "application/json", "x-upsert": "true" }, body: JSON.stringify({ progress: metadata[metadataKey], version: 1, migrated_at: new Date().toISOString() }) });
      migratedRecords += 1;
    }
    const cleaned = { ...metadata };
    for (const [metadataKey] of entries) delete cleaned[metadataKey];
    await request(`/auth/v1/admin/users/${user.id}`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ user_metadata: cleaned }) });
    migratedProfiles += 1;
  }
  if (users.users.length < 100) break;
}
console.log(JSON.stringify({ migratedProfiles, migratedRecords }));
