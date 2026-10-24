/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, CheckCircle2, Clock, LayoutGrid, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";

export function OpsNavbar() {
  const { user, logout } = useAuth();
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
      label: "Room Matrix & Tape Chart",
      href: "/ops/rooms",
      icon: LayoutGrid,
      isActive: pathname.startsWith("/ops/rooms"),
    },
    {
      label: "Dispatch Run-Sheet",
      href: "/ops/dispatch",
      icon: Clock,
      isActive:
        pathname.startsWith("/ops/dispatch") ||
        pathname === "/" ||
        pathname === "/ops",
    },
    {
      label: "Housekeeping Board",
      href: "/ops/housekeeping",
      icon: CheckCircle2,
      isActive: pathname.startsWith("/ops/housekeeping"),
    },
    {
      label: "Property CMS",
      href: "/admin",
      icon: Building2,
      isActive: pathname.startsWith("/admin"),
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#28594E]/15 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/ops/rooms" className="flex items-center gap-2.5">
            <img
              src="/brand/mascot/yoonie-calm.png"
              alt="Yoonie"
              className="size-8 object-contain shrink-0"
            />
            <span className="font-extrabold text-lg tracking-tight text-[#28594E]">
              yoonie<span className="text-[#E8A45B]">.ops</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#E8A45B]/15 text-[#303A36] text-[10px] font-bold uppercase tracking-wider">
              Hub
            </span>
          </Link>

          {/* Operator Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 pl-4 border-l border-zinc-200">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    tab.isActive
                      ? "bg-[#28594E] text-[#F5EBDD] shadow-xs"
                      : "text-[#6B7B74] hover:text-[#303A36] hover:bg-zinc-100"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Sign Out */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-[#28594E]">
                {user.displayName || "Operator"}
              </span>
              <span className="text-[10px] font-mono text-[#E8A45B] uppercase font-bold">
                {user.role}
              </span>
            </div>
          )}

          <Button
            size="sm"
            variant="outline"
            disabled={loggingOut}
            onClick={onLogout}
            className="h-8 text-xs font-bold border-zinc-200 text-[#6B7B74] hover:text-red-600 hover:border-red-200"
          >
            <LogOut className="size-3 mr-1" />
            {loggingOut ? "Signing Out..." : "Sign Out"}
          </Button>
        </div>
      </div>
    </header>
  );
}
