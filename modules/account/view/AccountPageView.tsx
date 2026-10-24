"use client";

import type { AccountPageVm } from "@/modules/account/viewModel/accountPageVm";
import { UserProfilePanel } from "@/modules/account/components/UserProfilePanel";

import { YoonieMascot } from "@/components/mascot/YoonieMascot";

export function AccountPageView({ vm }: { vm: AccountPageVm }) {
  const { user, syncError } = vm;

  if (!user) return null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="flex items-center gap-4 rounded-3xl bg-white dark:bg-[#202C27] border border-[#E5DBD0] dark:border-[#2D3D36] p-6 shadow-xs">
        <YoonieMascot mood="happy" size="md" message="Welcome to your Yoonie Guest Portal!" />
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8A45B]">
            Master Guest CDP
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#28594E] dark:text-[#F5EBDD]">
            Guest Profile & Loyalty
          </h1>
          <p className="mt-0.5 text-xs text-[#6B7B74] dark:text-[#8FA299]">
            Authenticated via Yoonie backend session.
          </p>
        </div>
      </div>

      {syncError ? (
        <p
          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
          role="status"
        >
          {syncError} — showing last known profile from this browser.
        </p>
      ) : null}

      <UserProfilePanel user={user} />
    </div>
  );
}
