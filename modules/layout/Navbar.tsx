"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";

export function Navbar() {
  const { user, ready, logout } = useAuth();
  const [loggingOut, setLoggingOut] = React.useState(false);

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

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 group" id="nav-logo">
          <img
            src="/brand/logos/yoonie-app-icon.svg"
            alt="Yoonie"
            className="w-8 h-8 rounded-lg shadow-sm transition-transform duration-200 group-hover:scale-105"
          />
          <span className="font-semibold text-lg tracking-tight text-zinc-900 dark:text-zinc-50">
            Yoonie
          </span>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          {!ready ? (
            <span className="text-zinc-400">…</span>
          ) : user ? (
            <>
              <Link
                href="/account"
                className="text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Account
              </Link>
              <Button
                type="button"
                size="sm"
                onClick={() => void onLogout()}
                disabled={loggingOut}
                className="h-auto py-1.5"
              >
                {loggingOut ? "Logging out…" : "Log out"}
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-zinc-900 px-3 py-1.5 font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
