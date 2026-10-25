/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, CircleHelp, Clock, Compass, LayoutGrid, LogOut, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { useOnboarding } from "@/providers/onboarding-provider";
import { Kbd, useYoonie } from "@/components/assistant/YooniePalette";
import { cn } from "@/lib/utils";

export function OpsNavbar() {
  const { user, logout } = useAuth();
  const { openTour } = useOnboarding();
  const yoonie = useYoonie();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const onLogout = React.useCallback(async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }, [logout]);

  const navTabs = [
    {
      label: "Rooms",
      href: "/ops/rooms",
      icon: LayoutGrid,
      isActive: pathname.startsWith("/ops/rooms") || pathname === "/" || pathname === "/ops",
    },
    {
      label: "Guests",
      href: "/ops/guests",
      icon: Users,
      isActive: pathname.startsWith("/ops/guests"),
    },
    {
      label: "Services",
      href: "/ops/services",
      icon: Compass,
      isActive: pathname.startsWith("/ops/services"),
    },
    {
      label: "Dispatch",
      href: "/ops/dispatch",
      icon: Clock,
      isActive: pathname.startsWith("/ops/dispatch") || pathname.startsWith("/ops/housekeeping"),
    },
    {
      label: "Property",
      href: "/admin",
      icon: Building2,
      isActive: pathname.startsWith("/admin"),
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-6">
          <Link href="/ops/rooms" className="flex shrink-0 items-center gap-2">
            <img
              src="/brand/mascot/yoonie-calm.png"
              alt="Yoonie"
              className="size-7 shrink-0 object-contain"
            />
            <span className="text-[15px] font-semibold tracking-tight text-foreground">
              yoonie<span className="text-muted-foreground">.ops</span>
            </span>
          </Link>

          <nav aria-label="Operations" className="hidden items-center gap-1 md:flex">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={tab.isActive ? "page" : undefined}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium transition-colors",
                    tab.isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="size-3.5" />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {user && (
            <div className="hidden flex-col text-right leading-tight sm:flex">
              <span className="text-[13px] font-medium text-foreground">
                {user.displayName || "Operator"}
              </span>
              <span className="text-xs text-muted-foreground">
                {user.role.replace(/_/g, " ").toLowerCase()}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => yoonie?.open()}
            className="hidden h-8 items-center gap-2 rounded-lg border border-border bg-surface pl-2.5 pr-1.5 text-[13px] text-muted-foreground shadow-xs transition-colors hover:border-primary/40 hover:text-foreground md:inline-flex"
          >
            <Sparkles className="size-3.5 text-primary" />
            Ask Yoonie
            <span className="ml-3 inline-flex gap-0.5">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </span>
          </button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openTour()}
            className="hidden text-muted-foreground md:inline-flex"
          >
            <CircleHelp /> Guide
          </Button>
          <Button size="sm" variant="ghost" disabled={loggingOut} onClick={onLogout}>
            <LogOut />
            {loggingOut ? "Signing out…" : "Sign out"}
          </Button>
        </div>
      </div>

      <nav
        aria-label="Operations"
        className="flex gap-1 overflow-x-auto border-t border-border px-4 py-1.5 md:hidden"
      >
        {navTabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={tab.isActive ? "page" : undefined}
            className={cn(
              "inline-flex h-7 shrink-0 items-center rounded-md px-2.5 text-[13px] font-medium",
              tab.isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
