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

  // Clean up legacy/stale ?next=%2F query parameter
  if (pathname === "/login" && request.nextUrl.searchParams.get("next") === "/") {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.searchParams.delete("next");
    return NextResponse.redirect(cleanUrl);
  }

  // 1. Central Operator Portal: ops.yoonie.app or ops.localhost:3000
  // Rewrites root path / to the live rooms overview
  if (host.startsWith("ops.")) {
    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/ops/rooms", request.url));
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
