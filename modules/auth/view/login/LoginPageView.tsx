/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/form";
import type { LoginPageVm } from "@/modules/auth/viewModel/login/loginPageVm";

const DEMO_ACCOUNTS = [
  {
    name: "Kanya Srisuk",
    role: "Hotel Owner / Admin",
    email: "kanya@riverside-bkk.example",
    badgeColor: "bg-purple-500/15 text-purple-700",
  },
  {
    name: "Anan Boonmee",
    role: "General Manager",
    email: "anan@riverside-bkk.example",
    badgeColor: "bg-[#28594E]/15 text-[#28594E]",
  },
  {
    name: "Eleanor Whitfield",
    role: "Direct Guest (VIP)",
    email: "eleanor.whitfield@example.com",
    badgeColor: "bg-[#E8A45B]/20 text-[#303A36]",
  },
];

export function LoginPageView({
  vm,
  showSuspendedNotice = false,
}: {
  vm: LoginPageVm;
  showSuspendedNotice?: boolean;
}) {
  const handleQuickFill = (email: string) => {
    vm.setEmail(email);
    vm.setPassword("Password123!");
  };

  return (
    <div className="min-h-screen bg-[#F8F5EE] flex flex-col justify-center items-center px-4 py-12 selection:bg-[#E8A45B]/30 font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="size-14 rounded-2xl bg-[#28594E] flex items-center justify-center p-2 shadow-sm group-hover:scale-105 transition">
              <img
                src="/brand/mascot/yoonie-calm.png"
                alt="Yoonie"
                className="size-full object-contain"
              />
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#28594E]">
            Sign in to Yoonie
          </h1>
          <p className="text-xs text-[#7A8B84] font-medium max-w-sm mx-auto">
            Autonomous multi-tenant hospitality operating system & direct booking engine.
          </p>
        </div>

        {/* Main Sign-In Card */}
        <Card className="p-6 sm:p-8 bg-white border-[#28594E]/15 shadow-xl rounded-3xl space-y-6">
          {/* Quick 1-Click Demo Accounts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#E8A45B] flex items-center gap-1">
                <Sparkles className="size-3" /> Quick 1-Click Sign-In
              </span>
              <span className="text-[10px] text-[#7A8B84]">Demo Credentials</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {DEMO_ACCOUNTS.map((preset) => (
                <button
                  key={preset.email}
                  type="button"
                  disabled={vm.pending}
                  onClick={() => handleQuickFill(preset.email)}
                  className="p-3 rounded-2xl border border-[#28594E]/15 hover:border-[#28594E]/40 bg-[#F5EBDD]/40 hover:bg-[#F5EBDD] text-left transition flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <div className="font-bold text-xs text-[#28594E] group-hover:text-[#E8A45B] transition flex items-center gap-1.5">
                      {preset.name}
                      {vm.email === preset.email && (
                        <CheckCircle2 className="size-3 text-emerald-600 inline" />
                      )}
                    </div>
                    <div className="text-[10px] text-[#7A8B84] font-mono mt-0.5">
                      {preset.email}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${preset.badgeColor}`}
                  >
                    {preset.role}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#28594E]/10 w-full" />
            <span className="bg-white px-3 text-[10px] font-bold uppercase text-[#7A8B84] absolute">
              Or with work email
            </span>
          </div>

          {/* Suspended Notice */}
          {showSuspendedNotice && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900 flex items-start gap-2">
              <ShieldAlert className="size-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                Your account is currently suspended. Please contact your property administrator or support.
              </div>
            </div>
          )}

          {/* Error Message */}
          {vm.error && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
              <ShieldAlert className="size-4 shrink-0" />
              {vm.error}
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={vm.onSubmit} className="space-y-4">
            <Field label="Email Address" htmlFor="login-email">
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={vm.email}
                onChange={(e) => vm.setEmail(e.target.value)}
                placeholder="name@riverside-bkk.example"
              />
            </Field>

            <Field label="Password" htmlFor="login-password">
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={vm.password}
                onChange={(e) => vm.setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </Field>

            <Button
              type="submit"
              disabled={vm.pending}
              className="w-full h-11 rounded-xl bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold text-xs shadow-xs"
            >
              {vm.pending ? "Authenticating..." : "Sign in to Yoonie"}
            </Button>
          </form>

          {/* Social Single Sign-On */}
          <div className="pt-2 border-t border-[#28594E]/10">
            <a
              href="/api/auth/google"
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-[#28594E]/15 hover:border-[#28594E]/40 hover:bg-zinc-50 text-xs font-bold text-[#303A36] transition shadow-2xs"
            >
              <svg className="size-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </a>
          </div>

          {/* Direct Workspace Register Link */}
          <div className="pt-2 text-center text-xs space-y-2">
            <p className="text-[#7A8B84]">
              New property owner?{" "}
              <Link
                href="/#workspaces"
                className="font-extrabold text-[#28594E] hover:text-[#E8A45B] transition underline-offset-4 hover:underline"
              >
                Register Hotel Workspace
              </Link>
            </p>
            <p className="text-[#7A8B84]">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-bold text-[#28594E] hover:underline"
              >
                Create guest account
              </Link>
            </p>
          </div>
        </Card>

        {/* Return to Platform */}
        <p className="text-center text-xs text-[#7A8B84]">
          <Link href="/" className="hover:text-[#28594E] hover:underline">
            ← Return to Yoonie Platform
          </Link>
        </p>
      </div>
    </div>
  );
}
