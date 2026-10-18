"use client";

import {
  CalendarCheck,
  Compass,
  Sparkles,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import type { HomePageVm } from "@/modules/home/viewModel/homePageVm";

function PillarCard({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative flex flex-col gap-3 rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm transition-all duration-200 hover:border-emerald-500/35 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-500/30">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/15 dark:bg-emerald-500/15 dark:text-emerald-400 dark:ring-emerald-500/20">
          <Icon className="size-5" aria-hidden />
        </span>
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
          {eyebrow}
        </p>
      </div>
      <div>
        <p className="font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {title}
        </p>
        <p className="mt-1 text-sm leading-snug text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      </div>
    </div>
  );
}

export function HomePageView({ vm }: { vm: HomePageVm }) {
  const { user, ready } = vm;

  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
          Yoonie Hospitality OS
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
          Unified hospitality operating system
        </h1>
        <p className="max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
          Replaces fragmented legacy PMS, POS, and messaging clipboards by bridging direct online booking with on-the-ground resource dispatch.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {!ready ? null : user ? (
          <Link
            href="/account"
            className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            View your profile ({user.displayName})
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-900 transition-all duration-200 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-900/50"
            >
              Register
            </Link>
          </>
        )}
        <Link
          href="/auth/oauth-import"
          className="rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-900 transition-all duration-200 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-900/50"
        >
          OAuth JSON import
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PillarCard
          icon={CalendarCheck}
          eyebrow="Direct-Channel Booking Engine"
          title="Composite Multi-Service Cart"
          description="Book room nights, dining seatings, tours, and airport transfers in a single atomic checkout with conditional inventory hold."
        />
        <PillarCard
          icon={Users}
          eyebrow="Guest CDP & Attribution"
          title="Attribution & Guest Profile"
          description="Track direct-booking ROI against OTA commissions with UTM attribution, guest lifetime spend, and VIP tiers."
        />
        <PillarCard
          icon={Sparkles}
          eyebrow="Frontline Operations"
          title="Front-Desk Zero Housekeeping"
          description="Prioritize room cleaning dynamically by arrival ETA and VIP status rather than static room numbers."
        />
        <PillarCard
          icon={Compass}
          eyebrow="Fleet & Logistics Hub"
          title="Tour Yield & Airport Transit"
          description="Consolidate low-occupancy tours before departure and generate bilingual pickup cards for drivers."
        />
      </div>
    </section>
  );
}
