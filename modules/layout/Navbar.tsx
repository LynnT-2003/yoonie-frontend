"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAssistantDock } from "@/providers/assistant-dock";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

const STUDIO_LINKS = [
  { href: "/studio/dashboard", label: "Dashboard" },
  { href: "/studio/strategy", label: "Strategy" },
  { href: "/studio/data", label: "Data" },
];

export function Navbar() {
  const { user, ready, logout } = useAuth();
  const [loggingOut, setLoggingOut] = React.useState(false);
  const pathname = usePathname();
  const dock = useAssistantDock();
  const inStudio = pathname.startsWith("/studio");

  if (pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/auth")) return null;

  const onLogout = () => {
    setLoggingOut(true);
    void logout().finally(() => setLoggingOut(false));
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-6">
          <Link href={user ? "/studio/dashboard" : "/"} className="flex shrink-0 items-center gap-2" id="nav-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/mascot/yoonie-calm.png" alt="" className="size-8 object-contain" />
            <span className={cn("text-[15px] font-bold tracking-tight text-primary", user && "hidden sm:inline")}>yoonie</span>
          </Link>

          {user ? (
            <nav className="flex h-14 items-center gap-0.5 overflow-x-auto" aria-label="Studio">
              {STUDIO_LINKS.map((link) => {
                const active = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    data-tour={`nav-${link.label.toLowerCase()}`}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex h-14 shrink-0 items-center px-2 text-sm transition-colors sm:px-3",
                      active
                        ? "font-semibold text-foreground after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {!ready ? (
            <span className="h-8 w-20 animate-pulse rounded-md bg-subtle" />
          ) : user ? (
            <>
              {inStudio && dock.available ? (
                <button
                  type="button"
                  onClick={dock.toggle}
                  aria-pressed={dock.open}
                  aria-label="Ask Yoonie"
                  title="Ask Yoonie (⌘K)"
                  data-tour="ask"
                  className={cn(
                    "mr-1 inline-flex h-8 items-center gap-1.5 rounded-full border px-2 text-sm font-medium transition-colors sm:gap-2 sm:px-3",
                    dock.open ? "border-primary/30 bg-secondary text-secondary-foreground" : "border-border bg-surface text-foreground hover:bg-muted"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/brand/mascot/yoonie-calm.png" alt="" className="size-5 object-contain" />
                  <span className="hidden sm:inline">Ask Yoonie</span>
                  <kbd className="hidden rounded border border-border bg-background px-1 font-sans text-[10px] font-medium text-muted-foreground sm:inline">⌘K</kbd>
                </button>
              ) : null}
              <Link
                href="/account"
                aria-label="Account"
                className="flex h-8 items-center gap-2 rounded-md px-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-secondary-foreground">
                  {(user.displayName || "U").charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-32 truncate lg:inline">{user.displayName || "Account"}</span>
              </Link>
              <Button type="button" variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={onLogout} disabled={loggingOut}>
                {loggingOut ? "Signing out…" : "Sign out"}
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/login?next=/studio/dashboard">Try the demo</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
