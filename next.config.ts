import type { NextConfig } from "next";
import { resolveBackendUrl } from "./lib/config/backend-url";

const BACKEND_URL = resolveBackendUrl();

const nextConfig: NextConfig = {
  async rewrites() {
    // Filesystem routes (app/api/studio/*) are matched before this rewrite.
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
