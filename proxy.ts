import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  // Skip static assets, internal next routes, and public files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/brand") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 1. Central Operator Portal: ops.yoonie.si or ops.localhost:3000
  // Rewrites root path / to the 05:30 operational dispatch run-sheet
  if (host.startsWith("ops.")) {
    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/ops/dispatch", request.url));
    }
    return NextResponse.next();
  }

  // 2. Tenant Direct Booking & Platform Root
  // Handled directly at / in app/page.tsx via host header inspection.
  // No artificial pathnames or internal folder rewrites.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
