/**
 * Where the Nest backend lives, as seen from the Next.js server. Shared by next.config.ts
 * (the /api/* rewrite) and server code that calls the backend directly.
 */
export function resolveBackendUrl(env: NodeJS.ProcessEnv = process.env): string {
  const raw = env.BACKEND_URL || "";
  const isProd = env.NODE_ENV === "production" || Boolean(env.VERCEL) || Boolean(env.NEXT_PUBLIC_VERCEL_ENV);
  const url =
    !raw || (isProd && raw.includes("localhost"))
      ? isProd
        ? "https://yoonie-backend.vercel.app"
        : "http://localhost:8080"
      : raw;
  return url.replace(/\/+$/, "");
}
