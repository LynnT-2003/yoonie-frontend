"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download } from "lucide-react";
import type { ExpenseCategory, MonthMetric } from "@/lib/types/studio";
import { STAY_BUCKETS } from "@/lib/types/studio";
import { money, monthLabel, monthShort, pct } from "@/lib/domain/studio/format";
import { CATEGORY_LABEL } from "@/lib/domain/studio/labels";
import { CompareBars, type CompareRow } from "./charts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const A = "var(--chart-a)";
const BASE = "var(--chart-base)";
const GRID = "var(--chart-grid)";
const AXIS = { fontSize: 11, fill: "var(--muted-foreground)" };

const usualFor = (months: MonthMetric[], m: MonthMetric) => {
  const same = months.filter((p) => p.month.slice(5) === m.month.slice(5) && p.month < m.month);
  return same.length ? same.reduce((s, p) => s + p.occupancy, 0) / same.length : null;
};

/* ------------------------------------------ occupancy vs baseline (bars) */

/** The pitch-deck chart: each of the last 12 months against its usual level. */
export function BaselineBars({ months, highlight }: { months: MonthMetric[]; highlight?: string }) {
  const data = months.slice(-12).map((m) => ({ month: m.month, occupancy: m.occupancy, usual: usualFor(months, m) }));
  return (
    <figure className="space-y-3">
      <figcaption className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm" style={{ background: A }} /> Occupancy
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm" style={{ background: BASE }} /> Baseline (same month, earlier years)
        </span>
      </figcaption>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }} barGap={2} barCategoryGap="22%">
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis dataKey="month" tickFormatter={(k) => monthShort(String(k))} tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} />
            <YAxis domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1]} tickFormatter={(v) => pct(v)} tick={AXIS} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: "var(--muted)", opacity: 0.6 }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as (typeof data)[number];
                return (
                  <div className="rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-lg">
                    <p className="mb-1 font-semibold">{monthLabel(String(label), true)}</p>
                    <p className="flex justify-between gap-4 text-muted-foreground">
                      Occupancy <strong className="text-foreground">{pct(p.occupancy)}</strong>
                    </p>
                    <p className="flex justify-between gap-4 text-muted-foreground">
                      Baseline <strong className="text-foreground">{p.usual === null ? "n/a" : pct(p.usual)}</strong>
                    </p>
                    {p.usual !== null ? (
                      <p className="flex justify-between gap-4 text-muted-foreground">
                        Difference <strong className="text-foreground">{`${p.occupancy >= p.usual ? "+" : "−"}${Math.abs((p.occupancy / p.usual - 1) * 100).toFixed(0)}%`}</strong>
                      </p>
                    ) : null}
                  </div>
                );
              }}
            />
            <Bar dataKey="occupancy" fill={A} radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false}
              shape={(props: unknown) => {
                const p = props as { x: number; y: number; width: number; height: number; payload: { month: string } };
                return <rect x={p.x} y={p.y} width={p.width} height={p.height} rx={4} fill={p.payload.month === highlight ? "var(--chart-b)" : A} />;
              }}
            />
            <Bar dataKey="usual" fill={BASE} radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {highlight ? <p className="text-xs text-muted-foreground">The amber bar is the month Yoonie flagged.</p> : null}
    </figure>
  );
}

/* ------------------------------------------------------ season heatmap */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Five fixed occupancy bands: one hue, light → dark, so the same colour means the same thing everywhere. */
const BANDS = [
  { max: 0.6, label: "< 60%", mix: 14, dark: false },
  { max: 0.7, label: "60–70%", mix: 32, dark: false },
  { max: 0.8, label: "70–80%", mix: 55, dark: false },
  { max: 0.9, label: "80–90%", mix: 78, dark: true },
  { max: Infinity, label: "90%+", mix: 100, dark: true },
];
const bandOf = (v: number) => BANDS.find((b) => v < b.max) ?? BANDS[BANDS.length - 1];
const bandBg = (mix: number) => `color-mix(in oklab, var(--chart-a) ${mix}%, var(--surface))`;

/** Occupancy by year × month: seasonality at a glance. */
export function SeasonHeatmap({ months, highlight }: { months: MonthMetric[]; highlight?: string }) {
  const years = [...new Set(months.map((m) => m.month.slice(0, 4)))];
  const by = new Map(months.map((m) => [m.month, m]));
  const [hover, setHover] = React.useState<string | null>(null);
  const hm = hover ? by.get(hover) : undefined;
  const usual = hm ? usualFor(months, hm) : null;

  return (
    <figure className="space-y-4">
      <div className="overflow-x-auto">
        <div className="grid min-w-[620px] grid-cols-[44px_repeat(12,minmax(0,1fr))_56px] gap-1 text-xs" onMouseLeave={() => setHover(null)}>
          <span />
          {MONTHS.map((m) => (
            <span key={m} className="pb-1 text-center font-medium text-muted-foreground">
              {m}
            </span>
          ))}
          <span className="pb-1 text-center font-medium text-muted-foreground">Avg</span>

          {years.map((y) => {
            const ms = months.filter((m) => m.month.startsWith(y));
            const avg = ms.reduce((s, m) => s + m.roomNightsSold, 0) / Math.max(1, ms.reduce((s, m) => s + m.roomsAvailable, 0));
            return (
              <React.Fragment key={y}>
                <span className="flex items-center text-[13px] font-medium text-muted-foreground">{y}</span>
                {MONTHS.map((_, i) => {
                  const key = `${y}-${String(i + 1).padStart(2, "0")}`;
                  const m = by.get(key);
                  if (!m)
                    return (
                      <span key={key} className="flex h-10 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground/50">
                        –
                      </span>
                    );
                  const band = bandOf(m.occupancy);
                  return (
                    <button
                      key={key}
                      type="button"
                      onMouseEnter={() => setHover(key)}
                      onFocus={() => setHover(key)}
                      aria-label={`${monthLabel(key, true)}: ${pct(m.occupancy)} occupancy`}
                      className={cn(
                        "relative flex h-10 items-center justify-center rounded-md font-medium tabular-nums outline-none transition-shadow",
                        band.dark ? "text-white" : "text-foreground",
                        hover === key && "ring-2 ring-foreground/70 ring-offset-1 ring-offset-surface"
                      )}
                      style={{ background: bandBg(band.mix) }}
                    >
                      {Math.round(m.occupancy * 100)}
                      {key === highlight ? <span className="absolute right-1 top-1 size-1.5 rounded-full bg-[var(--chart-b)]" aria-label="flagged" /> : null}
                    </button>
                  );
                })}
                <span className="flex h-10 items-center justify-center rounded-md bg-muted text-[13px] font-semibold tabular-nums">{Math.round(avg * 100)}</span>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="flex min-h-[40px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {BANDS.map((b) => (
            <li key={b.label} className="flex items-center gap-1.5">
              <span className="size-3 rounded-sm" style={{ background: bandBg(b.mix) }} />
              {b.label}
            </li>
          ))}
          {highlight ? (
            <li className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[var(--chart-b)]" /> flagged
            </li>
          ) : null}
        </ul>
        <div className="text-xs text-muted-foreground" aria-live="polite">
          {hm ? (
            <span className="rounded-lg border border-border bg-popover px-3 py-1.5 shadow-sm">
              <strong className="font-semibold text-foreground">{monthLabel(hm.month, true)}</strong> · {pct(hm.occupancy)} occupancy
              {usual !== null ? ` · usual ${pct(usual)} (${hm.occupancy >= usual ? "+" : "−"}${Math.abs((hm.occupancy / usual - 1) * 100).toFixed(0)}%)` : ""}
            </span>
          ) : (
            <span>Hover a month for details. Avg = the year&apos;s occupancy.</span>
          )}
        </div>
      </div>
    </figure>
  );
}

/* --------------------------------------------------- by night of week */

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dowOccupancy(ms: MonthMetric[]) {
  const sold = [0, 0, 0, 0, 0, 0, 0];
  const avail = [0, 0, 0, 0, 0, 0, 0];
  for (const m of ms) {
    const [y, mo] = m.month.split("-").map(Number);
    const days = new Date(Date.UTC(y, mo, 0)).getUTCDate();
    const rooms = m.roomsAvailable / days;
    for (let d = 1; d <= days; d++) avail[new Date(Date.UTC(y, mo - 1, d)).getUTCDay()] += rooms;
    m.dowNights?.forEach((n, i) => (sold[i] += n));
  }
  return sold.map((s, i) => (avail[i] ? s / avail[i] : 0));
}

export function WeekdayBars({ cur, prev }: { cur: MonthMetric[]; prev: MonthMetric[] }) {
  const now = dowOccupancy(cur);
  const before = prev.length ? dowOccupancy(prev) : null;
  const order = [1, 2, 3, 4, 0, 5, 6]; // Mon … Thu, Sun, then Fri, Sat (the weekend nights)
  const rows: CompareRow[] = order.map((i) => ({ label: `${DOW[i]} night${i === 5 || i === 6 ? " (weekend)" : ""}`, now: now[i], before: before ? before[i] : null }));
  return <CompareBars rows={rows} format={(n) => pct(n)} caption="" />;
}

/* ------------------------------------------------------ stay length */

export function StayLengthBars({ cur, prev }: { cur: MonthMetric[]; prev: MonthMetric[] }) {
  const share = (ms: MonthMetric[]) => {
    const t = [0, 0, 0, 0, 0, 0];
    for (const m of ms) m.stayLengths?.forEach((n, i) => (t[i] += n));
    const sum = t.reduce((a, b) => a + b, 0) || 1;
    return t.map((n) => n / sum);
  };
  const now = share(cur);
  const before = prev.length ? share(prev) : null;
  return <CompareBars rows={STAY_BUCKETS.map((label, i) => ({ label, now: now[i], before: before ? before[i] : null }))} format={(n) => pct(n)} caption="Share of bookings" />;
}

/* ------------------------------------------------------ rating spread */

export function RatingSpread({ cur, prev }: { cur: MonthMetric[]; prev: MonthMetric[] }) {
  const count = (ms: MonthMetric[]) => {
    const t = [0, 0, 0, 0, 0];
    for (const m of ms) m.ratingCounts?.forEach((n, i) => (t[i] += n));
    return t;
  };
  const now = count(cur);
  const before = prev.length ? count(prev) : null;
  return (
    <CompareBars
      rows={[4, 3, 2, 1, 0].map((i) => ({ label: `${"★".repeat(i + 1)}`, now: now[i], before: before ? before[i] : null }))}
      format={(n) => String(Math.round(n))}
      caption="Number of reviews"
      delta="absolute"
    />
  );
}

/* --------------------------------------------- cost per occupied night */

export function CostPerNightTable({ cur, prev }: { cur: MonthMetric[]; prev: MonthMetric[] }) {
  const per = (ms: MonthMetric[]) => {
    const nights = ms.reduce((s, m) => s + m.roomNightsSold, 0) || 1;
    const t: Partial<Record<ExpenseCategory, number>> = {};
    for (const m of ms) for (const [k, v] of Object.entries(m.expenses)) t[k as ExpenseCategory] = (t[k as ExpenseCategory] ?? 0) + (v ?? 0);
    return Object.fromEntries(Object.entries(t).map(([k, v]) => [k, (v ?? 0) / nights])) as Partial<Record<ExpenseCategory, number>>;
  };
  const now = per(cur);
  const before = prev.length ? per(prev) : {};
  const rows = (Object.entries(now) as [ExpenseCategory, number][]).sort((a, b) => b[1] - a[1]);
  const total = rows.reduce((s, [, v]) => s + v, 0);
  const totalBefore = Object.values(before).reduce<number>((s, v) => s + (v ?? 0), 0);
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[420px] text-[13px]">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <th className="px-3 py-2 font-semibold">Cost type</th>
            <th className="px-3 py-2 text-right font-semibold">Per night, last 12 mo</th>
            <th className="px-3 py-2 text-right font-semibold">12 mo before</th>
            <th className="px-3 py-2 text-right font-semibold">Change</th>
          </tr>
        </thead>
        <tbody>
          {[...rows, ["total", total] as [string, number]].map(([k, v]) => {
            const b = k === "total" ? totalBefore : before[k as ExpenseCategory];
            const ch = b ? v / b - 1 : null;
            return (
              <tr key={k} className={cn("border-b border-border last:border-0", k === "total" && "bg-muted/40 font-semibold")}>
                <td className="px-3 py-2">{k === "total" ? "All operating costs" : CATEGORY_LABEL[k as ExpenseCategory]}</td>
                <td className="px-3 py-2 text-right tabular-nums">{money(v)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{b ? money(b) : "-"}</td>
                <td className={cn("px-3 py-2 text-right tabular-nums", ch !== null && ch > 0.1 ? "font-semibold text-warning" : "text-muted-foreground")}>
                  {ch === null ? "-" : `${ch >= 0 ? "+" : "−"}${Math.abs(ch * 100).toFixed(0)}%`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* --------------------------------------------------- full monthly table */

const COLUMNS: { key: string; label: string; get: (m: MonthMetric) => number | null; fmt: (n: number) => string }[] = [
  { key: "occupancy", label: "Occupancy", get: (m) => m.occupancy, fmt: (n) => pct(n) },
  { key: "sold", label: "Nights sold", get: (m) => m.roomNightsSold, fmt: (n) => n.toLocaleString("en-US") },
  { key: "bookings", label: "Bookings", get: (m) => m.bookings, fmt: (n) => n.toLocaleString("en-US") },
  { key: "adr", label: "ADR", get: (m) => m.adr, fmt: (n) => money(n) },
  { key: "revpar", label: "RevPAR", get: (m) => m.revpar, fmt: (n) => money(n) },
  { key: "revenue", label: "Room revenue", get: (m) => m.roomRevenue, fmt: (n) => money(n) },
  { key: "costs", label: "Op. costs", get: (m) => m.totalExpenses, fmt: (n) => money(n) },
  { key: "profit", label: "Op. profit", get: (m) => m.operatingProfit, fmt: (n) => money(n) },
  { key: "margin", label: "Margin", get: (m) => m.margin, fmt: (n) => pct(n) },
  { key: "rating", label: "Rating", get: (m) => m.avgRating, fmt: (n) => n.toFixed(2) },
  { key: "reviews", label: "Reviews", get: (m) => m.reviewCount, fmt: (n) => String(n) },
];

export function MonthlyTable({ months, propertyName }: { months: MonthMetric[]; propertyName: string }) {
  const download = () => {
    const header = ["Month", ...COLUMNS.map((c) => c.label)].join(",");
    const rows = months.map((m) => [m.month, ...COLUMNS.map((c) => c.get(m) ?? "")].join(","));
    const blob = new Blob(["﻿" + [header, ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${propertyName.replace(/[^\w]+/g, "-").toLowerCase()}-monthly.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={download}>
          <Download /> Download as CSV
        </Button>
      </div>
      <div className="max-h-[480px] overflow-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[960px] text-[13px]">
          <thead className="sticky top-0 z-10 bg-muted">
            <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="sticky left-0 bg-muted px-3 py-2 font-semibold">Month</th>
              {COLUMNS.map((c) => (
                <th key={c.key} className="px-3 py-2 text-right font-semibold">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...months].reverse().map((m) => (
              <tr key={m.month} className="border-b border-border last:border-0 hover:bg-muted/40">
                <td className="sticky left-0 bg-surface px-3 py-1.5 font-medium">{monthLabel(m.month)}</td>
                {COLUMNS.map((c) => {
                  const v = c.get(m);
                  return (
                    <td key={c.key} className="px-3 py-1.5 text-right tabular-nums">
                      {v === null ? <span className="text-muted-foreground">-</span> : c.fmt(v)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
