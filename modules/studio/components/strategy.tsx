"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUp, Calculator, FlaskConical, Minus, Search, Target, Wrench } from "lucide-react";
import type { Insight, Kpi, Recommendation } from "@/lib/types/studio";
import { change, money, pct } from "@/lib/domain/studio/format";
import type { RecStatus } from "@/providers/studio-provider";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------- KPIs */

const fmtKpi = (k: Kpi, v: number) => (k.format === "percent" ? pct(v, k.key === "margin" ? 1 : 0) : k.format === "currency" ? money(v) : v.toFixed(2));

export function KpiTiles({ kpis, window }: { kpis: Kpi[]; window: { current: string; previous: string } }) {
  return (
    <section aria-label="Key numbers" className="space-y-2">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((k) => {
          const delta = k.current !== null && k.previous !== null ? (k.format === "percent" ? k.current - k.previous : k.current / k.previous - 1) : null;
          const flat = delta !== null && Math.abs(delta) < 0.005;
          const Icon = delta === null || flat ? Minus : delta > 0 ? ArrowUp : ArrowDown;
          return (
            <div key={k.key} className="rounded-2xl border border-border bg-surface px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight">{k.current === null ? "n/a" : fmtKpi(k, k.current)}</p>
              {delta !== null ? (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Icon className="size-3" />
                  {k.format === "percent" ? `${delta >= 0 ? "+" : "−"}${Math.abs(delta * 100).toFixed(1)} pts` : k.format === "rating" ? `${delta >= 0 ? "+" : "−"}${Math.abs(k.current! - k.previous!).toFixed(2)}` : change(delta, 1)}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground">
        Last 12 months ({window.current}) compared with the 12 before ({window.previous}).
      </p>
    </section>
  );
}

/* --------------------------------------------------- recommendation card */

const AREA: Record<Recommendation["area"], { label: string; tone: string }> = {
  demand: { label: "Occupancy", tone: "bg-secondary text-secondary-foreground" },
  cost: { label: "Costs", tone: "bg-linen text-[#7a4a12] dark:text-amber" },
  guest: { label: "Guest experience", tone: "bg-info-soft text-info" },
};

const STATUS_LABEL: Record<RecStatus, string> = { suggested: "Suggested", trying: "Trying it", dismissed: "Not now" };

export function RecommendationCard({ r, status, wide }: { r: Recommendation; status?: RecStatus; wide?: boolean }) {
  const headline = r.numbers[0];
  return (
    <article
      className={cn(
        "group flex h-full flex-col rounded-2xl border bg-surface p-5 transition-shadow hover:shadow-md",
        r.rank === 1 ? "border-primary/40 ring-1 ring-primary/10" : "border-border",
        status === "dismissed" && "opacity-60"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{r.rank}</span>
          <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", AREA[r.area].tone)}>{AREA[r.area].label}</span>
        </span>
        {status && status !== "suggested" ? <span className="text-[11px] font-medium text-muted-foreground">{STATUS_LABEL[status]}</span> : null}
      </div>
      <h3 className="mt-3 text-lg font-bold leading-snug">{r.title}</h3>

      <ol className={cn("mt-3 flex-1 gap-x-6 gap-y-2.5 text-sm", wide ? "grid lg:grid-cols-3" : "space-y-2.5")}>
        <ChainStep icon={Search} label="Cause" text={r.cause.observation} />
        <ChainStep icon={Wrench} label="Action" text={r.action.summary} />
        <ChainStep icon={Target} label="Effect" text={r.effect.target} />
      </ol>

      {headline ? (
        <div className="mt-4 rounded-xl bg-muted/70 px-3 py-2">
          <p className="text-[11px] font-medium text-muted-foreground">{headline.label}</p>
          <p className="text-lg font-bold tabular-nums">{headline.value}</p>
          <p className="text-[11px] text-muted-foreground">{headline.basis}</p>
        </div>
      ) : null}

      <Link href={`/studio/actions/${r.id}`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
        See the numbers & how to measure it <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </article>
  );
}

function ChainStep({ icon: Icon, label, text }: { icon: typeof Search; label: string; text: string }) {
  return (
    <li className="flex gap-2.5">
      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
        <Icon className="size-3" />
      </span>
      <p className="leading-relaxed">
        <span className="font-semibold">{label}: </span>
        <span className="text-muted-foreground">{text}</span>
      </p>
    </li>
  );
}

/* ---------------------------------------------------------------- insight */

const KIND: Record<Insight["kind"], string> = {
  anomaly: "Anomaly",
  trend: "Trend",
  correlation: "Correlation, not proof of cause",
};

export function InsightCard({ insight }: { insight: Insight }) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
        <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">{KIND[insight.kind]}</span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">{insight.confidence} confidence</span>
      </div>
      <h3 className="mt-2 font-bold">{insight.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{insight.detail}</p>
      <dl className="mt-3 space-y-1 text-[13px]">
        {insight.evidence.map((e) => (
          <div key={e.label} className="flex flex-wrap justify-between gap-x-3 border-b border-border/60 pb-1 last:border-0">
            <dt className="text-muted-foreground">{e.label}</dt>
            <dd className="font-medium tabular-nums">{e.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 rounded-lg bg-linen/60 px-2.5 py-1.5 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">What this doesn&apos;t prove: </span>
        {insight.caveat}
      </p>
    </article>
  );
}

/* ------------------------------------------------- recommendation detail */

export function FormulaStrip() {
  const steps = [
    { icon: Search, label: "Cause" },
    { icon: Wrench, label: "Action" },
    { icon: Target, label: "Effect" },
    { icon: Calculator, label: "Numbers" },
    { icon: FlaskConical, label: "Evidence" },
  ];
  return (
    <ol className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-muted-foreground" aria-label="How every recommendation is built">
      {steps.map((s, i) => (
        <React.Fragment key={s.label}>
          <li className="flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1">
            <s.icon className="size-3 text-primary" /> {s.label}
          </li>
          {i < steps.length - 1 ? <span aria-hidden>{i === 3 ? "←" : "→"}</span> : null}
        </React.Fragment>
      ))}
    </ol>
  );
}
