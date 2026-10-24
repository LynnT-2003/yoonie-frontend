/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Compass,
  LayoutDashboard,
  Lock,
  LogOut,
  Plane,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/form";
import { useAuth } from "@/providers/auth-provider";
import { YoonieMascot } from "@/components/mascot/YoonieMascot";

interface OpsPortalShellProps {
  children: React.ReactNode;
}

const PRESET_ACCOUNTS = [
  {
    name: "Kanya Srisuk",
    role: "ADMIN",
    roleLabel: "Hotel Owner / Admin",
    email: "kanya@riverside-bkk.example",
    badgeColor: "bg-purple-500/15 text-purple-700",
  },
  {
    name: "Anan Boonmee",
    role: "BRANCH_MGR",
    roleLabel: "General Manager",
    email: "anan@riverside-bkk.example",
    badgeColor: "bg-[#28594E]/15 text-[#28594E]",
  },
  {
    name: "Mali Chaiyo",
    role: "DISPATCHER",
    roleLabel: "Operations Dispatcher",
    email: "mali@riverside-bkk.example",
    badgeColor: "bg-[#E8A45B]/20 text-[#E8A45B]",
  },
];

export function OpsPortalShell({ children }: OpsPortalShellProps) {
  const { user, ready, login, logout } = useAuth();
  const pathname = usePathname();

  const [email, setEmail] = React.useState("kanya@riverside-bkk.example");
  const [password, setPassword] = React.useState("Password123!");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleQuickLogin = async (presetEmail: string) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await login(presetEmail, "Password123!", null);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await login(email.trim(), password, null);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Loading State
  if (!ready) {
    return (
      <div className="min-h-screen bg-[#F8F5EE] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <YoonieMascot mood="thinking" size="md" />
          <p className="text-xs font-bold text-[#6B7B74]">Loading Operations Session...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated: Render Ops Sign-In Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5EBDD] flex flex-col justify-center items-center px-4 py-12 selection:bg-[#E8A45B]/30">
        <div className="w-full max-w-md space-y-6">
          {/* Brand Heading */}
          <div className="text-center space-y-2">
            <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-[#28594E] shadow-sm mb-1 overflow-hidden p-1.5">
              <img
                src="/brand/mascot/yoonie-calm.png"
                alt="Yoonie"
                className="size-full object-contain"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#28594E]">
              Hotel Owner & Management Hub
            </h1>
            <p className="text-xs text-[#7A8B84] font-medium max-w-sm mx-auto">
              Welcome to <code className="font-mono text-[#28594E] font-bold">ops.yoonie.si</code>.
              Sign in to manage your property CMS, pricing, room turnaround, and 05:30 dispatch run-sheet.
            </p>
          </div>

          <Card className="p-6 sm:p-8 bg-white/95 border-[#28594E]/15 shadow-xl rounded-3xl space-y-6">
            {/* Quick 1-Click Dev / Demo Presets */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#E8A45B] flex items-center gap-1">
                  <Sparkles className="size-3" /> Quick 1-Click Sign-In
                </span>
                <span className="text-[10px] text-[#7A8B84]">Owner & GM Accounts</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {PRESET_ACCOUNTS.map((preset) => (
                  <button
                    key={preset.email}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleQuickLogin(preset.email)}
                    className="p-3 rounded-xl border border-[#28594E]/15 hover:border-[#28594E]/40 bg-[#F5EBDD]/40 hover:bg-[#F5EBDD] text-left transition flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-xs text-[#28594E] group-hover:text-[#E8A45B] transition">
                        {preset.name}
                      </div>
                      <div className="text-[10px] text-[#7A8B84] font-mono mt-0.5">
                        {preset.email}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${preset.badgeColor}`}
                    >
                      {preset.roleLabel}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-[#28594E]/10 w-full" />
              <span className="bg-white px-3 text-[10px] font-bold uppercase text-[#7A8B84] absolute">
                Or enter credentials
              </span>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
                <ShieldAlert className="size-4 shrink-0" />
                {errorMessage}
              </div>
            )}

            {/* Manual Form */}
            <form onSubmit={handleManualLogin} className="space-y-4">
              <Field label="Work Email" htmlFor="ops-email">
                <Input
                  id="ops-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@riverside-bkk.example"
                  required
                />
              </Field>

              <Field label="Password" htmlFor="ops-password">
                <Input
                  id="ops-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </Field>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold text-xs shadow-xs"
              >
                {isSubmitting ? "Authenticating..." : "Sign In to Operations"}
              </Button>
            </form>
          </Card>

          <div className="p-3.5 rounded-2xl bg-[#E8A45B]/10 border border-[#E8A45B]/25 text-center">
            <p className="text-[11px] font-medium text-[#28594E]">
              📱 <strong>Frontline Staff:</strong> Drivers and Housekeepers access tasks via the{" "}
              <span className="font-bold">Yoonie Staff Mobile App</span>.
            </p>
          </div>

          <p className="text-center text-xs text-[#7A8B84]">
            Looking for guest booking?{" "}
            <a href="http://localhost:3000" className="font-bold text-[#28594E] hover:underline">
              Return to Yoonie Platform
            </a>
          </p>
        </div>
      </div>
    );
  }

  // 3. Authenticated: Render Full Operator Navigation Shell
  const navTabs = [
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
    <div className="min-h-screen bg-[#F8F5EE] text-[#303A36] flex flex-col font-sans">
      {/* ─── Top Operator Navigation Shell ─────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-[#28594E]/15 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/ops/dispatch" className="flex items-center gap-2.5">
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
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-[#28594E]">
                {user.displayName || "Operator"}
              </span>
              <span className="text-[10px] font-mono text-[#E8A45B] uppercase font-bold">
                {user.role}
              </span>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => logout()}
              className="h-8 text-xs font-bold border-zinc-200 text-[#6B7B74] hover:text-red-600 hover:border-red-200"
            >
              <LogOut className="size-3 mr-1" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* ─── Page Content ─────────────────────────────────────────────────── */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
