"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, ClipboardList, BedDouble, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";

export function Navbar() {
  const { user, ready, logout } = useAuth();
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
    { href: "/", label: "Direct Booking", icon: BedDouble },
    { href: "/ops/housekeeping", label: "Housekeeping", icon: Sparkles },
    { href: "/ops/dispatch", label: "Daily Dispatch", icon: ClipboardList },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#E8DFD3] bg-[#F8F5EE]/90 backdrop-blur-md dark:border-[#2D3A35] dark:bg-[#18201D]/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Brand with natural calm mascot as the logo */}
        <Link href="/" className="flex items-center gap-3 group" id="nav-logo">
          <div className="relative size-10 rounded-full bg-[#D8E6DA]/60 dark:bg-[#28594E]/30 flex items-center justify-center p-1 border border-[#28594E]/20 shadow-xs transition-transform duration-300 group-hover:scale-105">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/mascot/yoonie-calm.png"
              alt="Yoonie Mascot"
              className="w-full h-full object-contain filter drop-shadow-xs"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-[#28594E] dark:text-[#D8E6DA] font-sans">
                yoonie
              </span>
              <span className="size-1.5 rounded-full bg-[#E8A45B]" />
            </div>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-[#303A36]/70 dark:text-[#D8E6DA]/70">
              BKK Riverside
            </span>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                  isActive
                    ? "bg-[#28594E] text-[#F5EBDD] shadow-xs"
                    : "text-[#303A36] hover:bg-[#D8E6DA]/50 dark:text-[#F5EBDD] dark:hover:bg-[#28594E]/40"
                }`}
              >
                <Icon className="size-3.5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Auth / Account Links */}
        <div className="flex items-center gap-3 text-sm">
          {!ready ? (
            <span className="text-zinc-400">…</span>
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/account"
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors ${
                  pathname === "/account"
                    ? "bg-[#28594E] text-[#F5EBDD]"
                    : "text-[#28594E] hover:bg-[#D8E6DA]/50 dark:text-[#D8E6DA]"
                }`}
              >
                <User className="size-3.5" />
                <span className="hidden sm:inline">{user.displayName || "My Profile"}</span>
              </Link>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void onLogout()}
                disabled={loggingOut}
                className="h-8 rounded-xl border-[#E8DFD3] text-xs font-medium hover:bg-[#E8DFD3]/40 text-[#303A36] dark:border-[#2D3A35] dark:text-[#F5EBDD]"
              >
                {loggingOut ? "…" : "Log out"}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-semibold text-[#28594E] px-3 py-1.5 rounded-xl hover:bg-[#D8E6DA]/50 transition dark:text-[#D8E6DA]"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="text-xs font-semibold bg-[#28594E] text-[#F5EBDD] px-3.5 py-1.5 rounded-xl hover:bg-[#1E433A] transition shadow-xs"
              >
                Guest Portal
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
