import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../chatgpt-auth";

export const dynamic = "force-dynamic";

const emptyState = {};
const privateHeaders = { "Cache-Control": "private, no-store, max-age=0", "X-Content-Type-Options": "nosniff" };
function json(value: unknown, status = 200) {
  return Response.json(value, { status, headers: privateHeaders });
}

function db() {
  const database = (env as Cloudflare.Env & { DB?: D1Database }).DB;
  if (!database) throw new Error("D1 database is not configured");
  return database;
}

function now() {
  return new Date().toISOString();
}

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return json({ authenticated: false, state: emptyState }, 401);
  try {
    const row = await db().prepare("SELECT state_json FROM user_state WHERE user_id = ?1").bind(user.userId).first<{ state_json: string }>();
    const state = row?.state_json ? JSON.parse(row.state_json) : emptyState;
    if (!state || typeof state !== "object" || Array.isArray(state)) throw new Error("Stored state is invalid");
    return json({ authenticated: true, state });
  } catch (error) {
    console.error("state read failed", error);
    return json({ error: "Cloud storage is not ready yet." }, 503);
  }
}

const MAX_REQUEST_BYTES = 1_048_576;
class RequestBodyTooLarge extends Error {}

async function readBoundedJson(request: Request): Promise<{ state?: unknown }> {
  const declaredLength = request.headers.get("content-length");
  if (declaredLength !== null && /^\d+$/.test(declaredLength) && Number(declaredLength) > MAX_REQUEST_BYTES) {
    throw new RequestBodyTooLarge();
  }
  if (!request.body) throw new SyntaxError("Empty request body");
  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let bytes = 0;
  const parts: string[] = [];
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_REQUEST_BYTES) {
        // Do not wait on an untrusted stream's cancellation callback.
        void reader.cancel().catch(() => {});
        throw new RequestBodyTooLarge();
      }
      parts.push(decoder.decode(value, { stream: true }));
    }
    parts.push(decoder.decode());
    return JSON.parse(parts.join(""));
  } finally {
    reader.releaseLock();
  }
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return json({ authenticated: false }, 401);
  let payload: { state?: unknown };
  try {
    payload = await readBoundedJson(request);
  } catch (error) {
    if (error instanceof RequestBodyTooLarge) return json({ error: "Request body is too large" }, 413);
    return json({ error: "Invalid JSON" }, 400);
  }
  if (!payload || typeof payload.state !== "object" || payload.state === null || Array.isArray(payload.state)) {
    return json({ error: "State must be an object" }, 400);
  }
  const stateJson = JSON.stringify(payload.state);
  if (stateJson.length > 250_000) return json({ error: "State is too large" }, 413);
  try {
    const database = db();
    const timestamp = now();
    await database.prepare(
      "INSERT INTO user_state (user_id, email, full_name, state_json, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?5) ON CONFLICT(user_id) DO UPDATE SET email=excluded.email, full_name=excluded.full_name, state_json=excluded.state_json, updated_at=excluded.updated_at",
    ).bind(user.userId, user.email, user.fullName ?? user.displayName, stateJson, timestamp).run();
    return json({ saved: true, updatedAt: timestamp });
  } catch (error) {
    console.error("state write failed", error);
    return json({ error: "Cloud storage is not ready yet." }, 503);
  }
}
