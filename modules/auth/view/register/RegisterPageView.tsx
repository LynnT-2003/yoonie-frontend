/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/form";
import type { RegisterPageVm } from "@/modules/auth/viewModel/register/registerPageVm";

function PasswordHint({ vm }: { vm: RegisterPageVm }) {
  const { passwordFeedback } = vm;
  if (passwordFeedback.kind === "hidden") return null;
  if (passwordFeedback.kind === "invalid") {
    return (
      <span className="text-[11px] text-red-600 font-medium mt-1 block" role="status">
        {passwordFeedback.issues[0]}
      </span>
    );
  }
  return (
    <span className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1" role="status">
      <CheckCircle2 className="size-3" /> Password meets security requirements
    </span>
  );
}

function ConfirmHint({ vm }: { vm: RegisterPageVm }) {
  const { confirmFeedback } = vm;
  if (confirmFeedback.kind === "hidden") return null;
  if (confirmFeedback.kind === "mismatch") {
    return (
      <span className="text-[11px] text-red-600 font-medium mt-1 block" role="status">
        Passwords do not match.
      </span>
    );
  }
  return (
    <span className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1" role="status">
      <CheckCircle2 className="size-3" /> Passwords match
    </span>
  );
}

export function RegisterPageView({ vm }: { vm: RegisterPageVm }) {
  const confirmInvalid = vm.confirmFeedback.kind === "mismatch";

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
            Create your Yoonie Account
          </h1>
          <p className="text-xs text-[#7A8B84] font-medium max-w-sm mx-auto">
            Direct guest bookings, composite itinerary carts, and personal preferences.
          </p>
        </div>

        {/* Register Card */}
        <Card className="p-6 sm:p-8 bg-white border-[#28594E]/15 shadow-xl rounded-3xl space-y-5">
          {vm.error && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
              <ShieldAlert className="size-4 shrink-0" />
              {vm.error}
            </div>
          )}

          <form noValidate onSubmit={vm.onSubmit} className="space-y-4">
            <Field label="Full Name" htmlFor="register-name">
              <Input
                id="register-name"
                name="displayName"
                type="text"
                autoComplete="name"
                required
                maxLength={64}
                value={vm.displayName}
                onChange={(e) => vm.setDisplayName(e.target.value)}
                placeholder="Marcus Lindqvist"
              />
            </Field>

            <Field label="Email Address" htmlFor="register-email">
              <Input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={vm.email}
                onChange={(e) => vm.setEmail(e.target.value)}
                placeholder="marcus@example.com"
              />
            </Field>

            <div>
              <Field label="Password" htmlFor="register-password">
                <Input
                  id="register-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  maxLength={64}
                  value={vm.password}
                  onChange={(e) => vm.setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </Field>
              <PasswordHint vm={vm} />
            </div>

            <div>
              <Field label="Confirm Password" htmlFor="register-confirm">
                <Input
                  id="register-confirm"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  maxLength={64}
                  value={vm.confirmPassword}
                  onChange={(e) => vm.setConfirmPassword(e.target.value)}
                  aria-invalid={confirmInvalid}
                  placeholder="••••••••"
                />
              </Field>
              <ConfirmHint vm={vm} />
            </div>

            <Button
              type="submit"
              disabled={vm.pending || !vm.canSubmit}
              className="w-full h-11 rounded-xl bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold text-xs shadow-xs"
            >
              {vm.pending ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          {/* Links */}
          <div className="pt-2 text-center text-xs space-y-2 border-t border-[#28594E]/10">
            <p className="text-[#7A8B84]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-extrabold text-[#28594E] hover:underline"
              >
                Sign in
              </Link>
            </p>
            <p className="text-[#7A8B84]">
              Want to onboard a hotel?{" "}
              <Link
                href="/#workspaces"
                className="font-bold text-[#E8A45B] hover:underline"
              >
                Register Hotel Workspace
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
