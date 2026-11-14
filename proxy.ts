import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Clean up legacy/stale ?next=%2F query parameter
  if (request.nextUrl.pathname === "/login" && request.nextUrl.searchParams.get("next") === "/") {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.searchParams.delete("next");
    return NextResponse.redirect(cleanUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/login"],
};
