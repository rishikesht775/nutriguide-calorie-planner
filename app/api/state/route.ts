import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../chatgpt-auth";

export const dynamic = "force-dynamic";

const emptyState = {};

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
  if (!user) return Response.json({ authenticated: false, state: emptyState }, { status: 401 });
  try {
    const row = await db().prepare("SELECT state_json FROM user_state WHERE user_id = ?1").bind(user.userId).first<{ state_json: string }>();
    const state = row?.state_json ? JSON.parse(row.state_json) : emptyState;
    return Response.json({ authenticated: true, state });
  } catch (error) {
    console.error("state read failed", error);
    return Response.json({ error: "Cloud storage is not ready yet." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ authenticated: false }, { status: 401 });
  let payload: { state?: unknown };
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!payload || typeof payload.state !== "object" || payload.state === null || Array.isArray(payload.state)) {
    return Response.json({ error: "State must be an object" }, { status: 400 });
  }
  const stateJson = JSON.stringify(payload.state);
  if (stateJson.length > 250_000) return Response.json({ error: "State is too large" }, { status: 413 });
  try {
    const database = db();
    const timestamp = now();
    await database.prepare(
      "INSERT INTO user_state (user_id, email, full_name, state_json, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?5) ON CONFLICT(user_id) DO UPDATE SET email=excluded.email, full_name=excluded.full_name, state_json=excluded.state_json, updated_at=excluded.updated_at",
    ).bind(user.userId, user.email, user.fullName ?? user.displayName, stateJson, timestamp).run();
    return Response.json({ saved: true, updatedAt: timestamp });
  } catch (error) {
    console.error("state write failed", error);
    return Response.json({ error: "Cloud storage is not ready yet." }, { status: 503 });
  }
}
