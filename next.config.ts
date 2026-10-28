import type { NextConfig } from "next";

const rawBackendUrl = process.env.BACKEND_URL || "";
const isProd =
  process.env.NODE_ENV === "production" ||
  Boolean(process.env.VERCEL) ||
  Boolean(process.env.NEXT_PUBLIC_VERCEL_ENV);

const BACKEND_URL = (
  !rawBackendUrl || (isProd && rawBackendUrl.includes("localhost"))
    ? isProd
      ? "https://yoonie-backend.vercel.app"
      : "http://localhost:8080"
    : rawBackendUrl
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
