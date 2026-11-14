import type { NextConfig } from "next";
import { resolveBackendUrl } from "./lib/config/backend-url";

const BACKEND_URL = resolveBackendUrl();

const nextConfig: NextConfig = {
  // /studio has no page of its own. Redirect before rendering: a redirect() thrown from a page
  // inside the client studio layout broke the App Router's state ("Rendered more hooks").
  async redirects() {
    return [{ source: "/studio", destination: "/studio/dashboard", permanent: false }];
  },
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
