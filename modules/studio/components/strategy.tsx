"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import type { Insight, NumberFormat, Recommendation } from "@/lib/types/studio";
import { money, pct } from "@/lib/domain/studio/format";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------- vocabulary */

export const AREA: Record<Recommendation["area"], { label: string; tone: string; section: string }> = {
  demand: { label: "Occupancy", tone: "bg-secondary text-secondary-foreground", section: "demand" },
  cost: { label: "Costs", tone: "bg-linen text-[#7a4a12] dark:text-amber", section: "money" },
  guest: { label: "Guest experience", tone: "bg-info-soft text-info", section: "guests" },
};


const KIND: Record<Insight["kind"], string> = {
  anomaly: "Anomaly",
  trend: "Trend",
  correlation: "Correlation, not proof of cause",
};

/* ------------------------------------------------------------- insights */

export function InsightCard({ insight }: { insight: Insight }) {
  const [open, setOpen] = React.useState(false);
  return (
    <article className="rounded-xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
          <span className="size-1.5 rounded-full bg-amber" aria-hidden /> Insight
        </span>
        <span>·</span>
        <span>{KIND[insight.kind]}</span>
        <span>·</span>
        <span>{insight.confidence} confidence</span>
      </div>
      <div className="mt-3 flex items-baseline gap-3">
        <p className="text-3xl font-semibold tabular-nums tracking-tight">{insight.headline.value}</p>
        <p className="text-xs text-muted-foreground">{insight.headline.label}</p>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{insight.detail}</p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
          {open ? "Hide evidence" : "Show evidence"} <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
        </button>
        <Link href="/studio/strategy" className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary">
          What to do about it <ArrowRight className="size-4" />
        </Link>
      </div>
      {open ? (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
          <dl className="mt-3 grid gap-x-6 text-[13px] sm:grid-cols-2">
            {insight.evidence.map((e) => (
              <div key={e.label} className="flex flex-wrap justify-between gap-x-3 border-b border-border/60 py-1">
                <dt className="text-muted-foreground">{e.label}</dt>
                <dd className="font-medium tabular-nums">{e.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 rounded-lg bg-linen/60 px-2.5 py-1.5 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">What this doesn&apos;t prove: </span>
            {insight.caveat}
          </p>
        </div>
      ) : null}
    </article>
  );
}

/* ---------------------------------------------------------- the brief */

export function fmtNumber(n: number, f: NumberFormat) {
  return f === "percent" ? pct(n) : f === "currency" ? money(n) : f === "decimal" ? n.toFixed(1) : Math.round(n).toLocaleString("en-US");
}

/** The comparison behind the finding: two labelled bars, now vs usual. */
function Noticed({ r }: { r: Recommendation }) {
  const { seen } = r;
  const max = Math.max(seen.now.value, seen.usual.value) || 1;
  return (
    <section className="space-y-4 rounded-xl bg-muted/50 p-5">
      <p className="text-[13px] font-medium text-muted-foreground">What we noticed</p>
      <p className="font-semibold">{seen.label}</p>
      <div className="space-y-3" role="img" aria-label={`${seen.now.label}: ${fmtNumber(seen.now.value, seen.format)}; ${seen.usual.label}: ${fmtNumber(seen.usual.value, seen.format)}`}>
        {[
          { ...seen.now, color: "var(--chart-b)" },
          { ...seen.usual, color: "var(--chart-base)" },
        ].map((row) => (
          <div key={row.label}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm text-muted-foreground">{row.label}</span>
              <span className="text-xl font-bold tabular-nums">{fmtNumber(row.value, seen.format)}</span>
            </div>
            <div className="mt-1.5 h-2.5 rounded-full bg-surface">
              <div className="h-full rounded-full" style={{ width: `${(row.value / max) * 100}%`, background: row.color }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Where the owner is today and where the target is. */
function AimFor({ r }: { r: Recommendation }) {
  const { goal } = r;
  const delta = goal.to - goal.from;
  return (
    <section className="space-y-4 rounded-xl bg-secondary/50 p-5">
      <p className="text-[13px] font-medium text-primary">What to aim for</p>
      <p className="font-semibold">{goal.metric}</p>
      <div role="img" aria-label={`From ${fmtNumber(goal.from, goal.format)} today to ${fmtNumber(goal.to, goal.format)}`}>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Today</p>
            <p className="text-3xl font-bold tabular-nums text-muted-foreground">{fmtNumber(goal.from, goal.format)}</p>
          </div>
          <span className="mb-1.5 rounded-full bg-surface px-2.5 py-0.5 text-sm font-semibold tabular-nums text-primary">
            {delta >= 0 ? "+" : "−"}
            {fmtNumber(Math.abs(delta), goal.format)}
          </span>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Target</p>
            <p className="text-3xl font-bold tabular-nums text-primary">{fmtNumber(goal.to, goal.format)}</p>
          </div>
        </div>
        <div className="relative mt-3 h-2.5 rounded-full bg-gradient-to-r from-[var(--chart-base)] to-[var(--chart-a)]">
          <span className="absolute -top-1 left-0 size-4.5 rounded-full border-2 border-surface bg-[var(--chart-base)]" />
          <span className="absolute -top-1 right-0 size-4.5 rounded-full border-2 border-surface bg-[var(--chart-a)]" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">A target to test, not a forecast.</p>
    </section>
  );
}

/* ---------------------------------------------------------- action card */

export function ActionCard({ r, insight, tour }: { r: Recommendation; insight?: Insight; tour?: boolean }) {
  const [open, setOpen] = React.useState(false);
  return (
    <article id={r.id} data-tour={tour ? "action" : undefined} className="scroll-mt-24 space-y-8 rounded-xl border border-border bg-surface p-6 sm:p-10">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{r.rank}</span>
          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", AREA[r.area].tone)}>{AREA[r.area].label}</span>
        </div>
        <h2 className="text-2xl font-semibold leading-tight tracking-tight">{r.title}</h2>
        <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">Try this: </span>
          {r.action.summary}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Noticed r={r} />
        <AimFor r={r} />
      </div>

      <section className="space-y-3">
        <h3 className="text-[13px] font-medium text-muted-foreground">How we&apos;ll measure it</h3>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
          {r.measurement.metrics.map((m) => (
            <div key={m.label}>
              <dt className="text-sm text-muted-foreground">{m.label}</dt>
              <dd className="text-lg font-bold tabular-nums">{m.baseline}</dd>
            </div>
          ))}
        </dl>
        <p className="text-sm text-muted-foreground">
          Over {r.measurement.window.charAt(0).toLowerCase() + r.measurement.window.slice(1)}, compared with {r.measurement.compareAgainst.charAt(0).toLowerCase() + r.measurement.compareAgainst.slice(1)}.
        </p>
      </section>

      <div className="border-t border-border pt-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          data-tour={tour ? "details" : undefined}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
        >
          {open ? "Hide details" : "Show details"}
          <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
        </button>

        {open ? (
          <div className="mt-6 grid gap-8 animate-in fade-in slide-in-from-top-1 duration-200 lg:grid-cols-2">
            <section className="space-y-3">
              <h3 className="font-bold">Steps</h3>
              <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed">
                {r.action.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <h3 className="pt-4 font-bold">Assumptions</h3>
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                {r.assumptions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
                {insight ? <li>{insight.caveat}</li> : null}
              </ul>
              <Link href={`/studio/dashboard#${AREA[r.area].section}`} className="inline-flex items-center gap-1 pt-2 text-sm font-semibold text-primary">
                See the evidence on the dashboard <ArrowRight className="size-4" />
              </Link>
            </section>
            <section className="space-y-3">
              <h3 className="font-bold">The numbers</h3>
              <table className="w-full text-sm">
                <tbody>
                  {r.numbers.map((n) => (
                    <tr key={n.label} className="border-b border-border last:border-0">
                      <td className="py-2.5 pr-4 align-top">
                        <p className="font-medium">{n.label}</p>
                        <p className="text-xs text-muted-foreground">{n.basis}</p>
                      </td>
                      <td className="whitespace-nowrap py-2.5 text-right align-top font-bold tabular-nums">{n.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        ) : null}
      </div>
    </article>
  );
}

/* ------------------------------------------------------------ KPI strip */

export type KpiItem = {
  label: string;
  value: string;
  /** change vs the year before; tone says whether that's good news for the hotel */
  delta?: { text: string; tone: "good" | "bad" | "neutral" } | null;
  spark?: (number | null)[];
};

const TONE = {
  good: "bg-success-soft text-success",
  bad: "bg-danger-soft text-destructive",
  neutral: "bg-muted text-muted-foreground",
};

/** One bordered strip of metrics with dividers, a change badge and a 12-month trend line. */
export function KpiStrip({ items, cols = 3 }: { items: KpiItem[]; cols?: 3 | 4 }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
        cols === 4 ? "lg:grid-cols-4" : "md:grid-cols-3"
      )}
    >
      {items.map((k) => (
        <div key={k.label} className="-mb-px -mr-px border-b border-r border-border px-5 py-4">
          <p className="text-[13px] text-muted-foreground">{k.label}</p>
          <div className="mt-1.5 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-2xl font-semibold tabular-nums tracking-tight">{k.value}</p>
              {k.delta ? (
                <span className={cn("mt-1.5 inline-flex whitespace-nowrap rounded-md px-1.5 py-0.5 text-[11px] font-medium tabular-nums", TONE[k.delta.tone])}>{k.delta.text}</span>
              ) : (
                <span className="mt-1.5 inline-block h-[22px]" />
              )}
            </div>
            {k.spark ? <span className="hidden sm:block"><Sparkline values={k.spark} /></span> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Sparkline({ values, width = 84, height = 28 }: { values: (number | null)[]; width?: number; height?: number }) {
  const pts = values.map((v, i) => ({ v, i })).filter((p): p is { v: number; i: number } => p.v !== null && Number.isFinite(p.v));
  if (pts.length < 2) return null;
  const min = Math.min(...pts.map((p) => p.v));
  const max = Math.max(...pts.map((p) => p.v));
  const x = (i: number) => (i / (values.length - 1)) * (width - 4) + 2;
  const y = (v: number) => (max === min ? height / 2 : height - 3 - ((v - min) / (max - min)) * (height - 6));
  const d = pts.map((p, j) => `${j ? "L" : "M"}${x(p.i).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0" aria-hidden>
      <path d={d} fill="none" stroke="var(--chart-a)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(last.i)} cy={y(last.v)} r={2.5} fill="var(--chart-a)" />
    </svg>
  );
}
