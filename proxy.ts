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
  if (host.startsWith("ops.")) {
    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/ops/dispatch", request.url));
    }
    return NextResponse.next();
  }

  // 2. Tenant Subdomain Direct Booking: [tenant].yoonie.si or [tenant].localhost:3000
  // Exclude root domains: yoonie.si, www.yoonie.si, localhost:3000, 127.0.0.1
  const cleanHost = host.split(":")[0];
  const parts = cleanHost.split(".");

  let subdomain: string | null = null;
  if (cleanHost.endsWith("localhost") && parts.length > 1) {
    subdomain = parts[0];
  } else if (cleanHost.endsWith("yoonie.si") && parts.length > 2) {
    subdomain = parts[0];
  } else if (cleanHost.endsWith("lvh.me") && parts.length > 2) {
    subdomain = parts[0];
  }

  if (subdomain && subdomain !== "www" && subdomain !== "ops" && !pathname.startsWith("/stay")) {
    if (pathname === "/") {
      return NextResponse.rewrite(new URL(`/stay/${subdomain}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
