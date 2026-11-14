import "server-only";
import { resolveBackendUrl } from "@/lib/config/backend-url";

/**
 * The studio routes run in Next.js, but sign-in lives in yoonie-backend. A request is allowed
 * when its Bearer token is accepted by the backend's `users/me`. This stops anonymous callers
 * from spending the OpenRouter budget.
 *
 * `STUDIO_AUTH=off` disables the check (local demos without the backend running).
 */

const cache = new Map<string, number>(); // token → expiry (ms)
const TTL = 5 * 60_000;

function backendBase() {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  // An absolute public API URL wins; otherwise use the same backend the /api rewrite targets.
  const base = (/^https?:\/\//.test(raw) ? raw : resolveBackendUrl()).replace(/\/+$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
}

export async function requireUser(req: Request): Promise<Response | null> {
  if (process.env.STUDIO_AUTH === "off") return null;
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return Response.json({ message: "Please sign in." }, { status: 401 });

  const hit = cache.get(token);
  if (hit && hit > Date.now()) return null;

  const base = backendBase();
  try {
    const res = await fetch(`${base}/users/me`, {
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return Response.json({ message: "Please sign in again." }, { status: 401 });
  } catch {
    return Response.json({ message: "Couldn't reach the sign-in service." }, { status: 503 });
  }
  if (cache.size > 500) cache.clear();
  cache.set(token, Date.now() + TTL);
  return null;
}
