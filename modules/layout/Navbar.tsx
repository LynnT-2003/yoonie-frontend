"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { useOnboarding } from "@/providers/onboarding-provider";

export function Navbar() {
  const { user, ready, logout } = useAuth();
  const { openTour } = useOnboarding();
  const [loggingOut, setLoggingOut] = React.useState(false);
  const pathname = usePathname();

  const onLogout = React.useCallback(() => {
    setLoggingOut(true);
    void (async () => {
      try {
        await logout();
      } finally {
        setLoggingOut(false);
      }
    })();
  }, [logout]);

  const navLinks = [
    { href: "/", label: "Booking engine" },
    { href: "/ops/housekeeping", label: "Housekeeping" },
    { href: "/ops/dispatch", label: "Dispatch" },
    { href: "/admin", label: "Content" },
  ];

  if (
    pathname === "/" ||
    pathname.startsWith("/ops") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/stay") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register")
  ) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-8">
          <Link href="/" className="flex shrink-0 items-center gap-2.5" id="nav-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/mascot/yoonie-calm.png" alt="" className="size-7 rounded-md object-contain" />
            <span className="text-[15px] font-semibold tracking-tight text-foreground">yoonie</span>
          </Link>

          <nav className="hidden h-14 items-center gap-1 md:flex" aria-label="Primary">
            {navLinks.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative flex h-14 items-center px-3 text-sm transition-colors ${
                    isActive
                      ? "font-medium text-foreground after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => openTour()}
            className="hidden text-muted-foreground md:inline-flex"
          >
            <CircleHelp /> Guide
          </Button>

          {!ready ? (
            <span className="h-8 w-20 animate-pulse rounded-md bg-subtle" />
          ) : user ? (
            <>
              <Link
                href="/account"
                className={`flex h-8 items-center gap-2 rounded-md px-2 text-sm transition-colors hover:bg-muted ${
                  pathname === "/account" ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-secondary-foreground">
                  {(user.displayName || "U").charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-32 truncate sm:inline">{user.displayName || "Account"}</span>
              </Link>
              <Button type="button" variant="ghost" size="sm" onClick={() => void onLogout()} disabled={loggingOut}>
                {loggingOut ? "Signing out…" : "Sign out"}
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Create account</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
