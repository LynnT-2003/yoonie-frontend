"use client";

import * as React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthMetric, ReviewTheme } from "@/lib/types/studio";
import { money, monthLabel, monthShort, pct } from "@/lib/domain/studio/format";
import { cn } from "@/lib/utils";

/**
 * Chart colours come from validated CSS tokens (--chart-a / --chart-b / --chart-ref) so light
 * and dark each use their own checked steps. Text never uses the series colour.
 */
const A = "var(--chart-a)";
const B = "var(--chart-b)";
const REF = "var(--chart-ref)";
const GRID = "var(--chart-grid)";
const AXIS = { fontSize: 11, fill: "var(--muted-foreground)" };

function Legend({ items }: { items: { label: string; color: string; dashed?: boolean }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5">
          <svg width="18" height="8" aria-hidden>
            <line x1="1" y1="4" x2="17" y2="4" stroke={i.color} strokeWidth="2" strokeLinecap="round" strokeDasharray={i.dashed ? "3 3" : undefined} />
          </svg>
          {i.label}
        </li>
      ))}
    </ul>
  );
}

function TooltipBox({ title, rows }: { title: string; rows: { label: string; value: string; color?: string; dashed?: boolean }[] }) {
  return (
    <div className="min-w-44 rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-foreground">{title}</p>
      {rows.map((r) => (
        <p key={r.label} className="flex items-center justify-between gap-4 text-muted-foreground">
          <span className="flex items-center gap-1.5">
            {r.color ? (
              <svg width="12" height="6" aria-hidden>
                <line x1="1" y1="3" x2="11" y2="3" stroke={r.color} strokeWidth="2" strokeDasharray={r.dashed ? "2 2" : undefined} />
              </svg>
            ) : null}
            {r.label}
          </span>
          <span className="font-semibold tabular-nums text-foreground">{r.value}</span>
        </p>
      ))}
    </div>
  );
}

const tickMonth = (k: string) => (k.endsWith("-01") ? `${monthShort(k)} ${k.slice(2, 4)}` : monthShort(k));

/* ---------------------------------------------------------------- occupancy */

export function OccupancyChart({ months, highlight }: { months: MonthMetric[]; highlight?: string }) {
  const data = months.map((m) => {
    const same = months.filter((p) => p.month.slice(5) === m.month.slice(5) && p.month < m.month);
    return {
      month: m.month,
      occupancy: m.occupancy,
      usual: same.length ? same.reduce((s, p) => s + p.occupancy, 0) / same.length : null,
    };
  });
  const hi = data.find((d) => d.month === highlight);
  return (
    <figure className="space-y-3">
      <Legend items={[{ label: "Occupancy", color: A }, { label: "Usual for that month (earlier years)", color: REF, dashed: true }]} />
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 16, right: 12, bottom: 0, left: -12 }}>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis dataKey="month" tickFormatter={tickMonth} tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} interval="preserveStartEnd" minTickGap={16} />
            <YAxis domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1]} tickFormatter={(v) => pct(v)} tick={AXIS} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1, strokeOpacity: 0.4 }}
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <TooltipBox
                    title={monthLabel(String(label), true)}
                    rows={[
                      { label: "Occupancy", value: pct(Number(payload[0].payload.occupancy)), color: A },
                      ...(payload[0].payload.usual !== null ? [{ label: "Usual", value: pct(Number(payload[0].payload.usual)), color: REF, dashed: true }] : []),
                    ]}
                  />
                ) : null
              }
            />
            <Line dataKey="usual" stroke={REF} strokeWidth={2} strokeDasharray="4 4" dot={false} connectNulls={false} isAnimationActive={false} />
            <Line dataKey="occupancy" stroke={A} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dot={false} activeDot={{ r: 5, stroke: "var(--surface)", strokeWidth: 2 }} />
            {hi ? (
              <ReferenceDot
                x={hi.month}
                y={hi.occupancy}
                r={5}
                fill={B}
                stroke="var(--surface)"
                strokeWidth={2}
                label={{ value: `${monthShort(hi.month)}: ${pct(hi.occupancy)} vs ${hi.usual !== null ? pct(hi.usual) : "n/a"}`, position: "bottom", offset: 10, fontSize: 11, fontWeight: 600, fill: "var(--foreground)" }}
              />
            ) : null}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

/* ------------------------------------------------------ revenue vs costs */

export function RevenueCostChart({ months }: { months: MonthMetric[] }) {
  const data = months.map((m) => ({ month: m.month, revenue: m.roomRevenue, costs: m.totalExpenses }));
  const max = Math.max(...data.map((d) => Math.max(d.revenue, d.costs ?? 0)));
  const step = max > 1_200_000 ? 500_000 : 250_000;
  const ticks = Array.from({ length: Math.ceil(max / step) + 1 }, (_, i) => i * step);
  return (
    <figure className="space-y-3">
      <Legend items={[{ label: "Room revenue", color: A }, { label: "Operating costs", color: B }]} />
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -4 }}>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis dataKey="month" tickFormatter={tickMonth} tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} interval="preserveStartEnd" minTickGap={16} />
            <YAxis ticks={ticks} domain={[0, ticks[ticks.length - 1]]} tickFormatter={(v) => money(v, { compact: true })} tick={AXIS} tickLine={false} axisLine={false} width={56} />
            <Tooltip
              cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1, strokeOpacity: 0.4 }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as (typeof data)[number];
                return (
                  <TooltipBox
                    title={monthLabel(String(label), true)}
                    rows={[
                      { label: "Room revenue", value: money(p.revenue), color: A },
                      { label: "Operating costs", value: p.costs === null ? "no data" : money(p.costs), color: B },
                      ...(p.costs !== null ? [{ label: "Operating profit", value: money(p.revenue - p.costs) }] : []),
                    ]}
                  />
                );
              }}
            />
            <Line dataKey="revenue" stroke={A} strokeWidth={2} dot={false} activeDot={{ r: 5, stroke: "var(--surface)", strokeWidth: 2 }} />
            <Line dataKey="costs" stroke={B} strokeWidth={2} dot={false} activeDot={{ r: 5, stroke: "var(--surface)", strokeWidth: 2 }} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

/* ---------------------------------------------------------- complaints */

export function ComplaintBars({
  months,
  labels,
}: {
  months: MonthMetric[];
  labels: Record<ReviewTheme, string>;
}) {
  const now = months.slice(-6);
  const before = months.slice(-12, -6);
  const count = (ms: MonthMetric[], t: ReviewTheme) => ms.reduce((s, m) => s + (m.complaints[t] ?? 0), 0);
  const rows = (Object.keys(labels) as ReviewTheme[])
    .map((t) => ({ label: labels[t], now: count(now, t), before: count(before, t) }))
    .filter((r) => r.now || r.before)
    .sort((a, b) => b.now - a.now);
  if (!rows.length) return <p className="text-sm text-muted-foreground">No recurring complaints found in the reviews.</p>;
  return <CompareBars rows={rows} format={(n) => String(Math.round(n))} caption="Reviews mentioning a problem" nowLabel="Last 6 months" beforeLabel="6 months before" delta="absolute" />;
}

/* ------------------------------------------------------------- rating */

export function RatingChart({ months }: { months: MonthMetric[] }) {
  const data = months.map((m) => ({ month: m.month, rating: m.avgRating, reviews: m.reviewCount }));
  return (
    <figure className="space-y-3">
      <figcaption className="text-xs text-muted-foreground">Average guest rating per month, out of 5.</figcaption>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -24 }}>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis dataKey="month" tickFormatter={tickMonth} tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} interval="preserveStartEnd" minTickGap={16} />
            <YAxis domain={[3, 5]} ticks={[3, 3.5, 4, 4.5, 5]} tick={AXIS} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1, strokeOpacity: 0.4 }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as (typeof data)[number];
                return (
                  <TooltipBox
                    title={monthLabel(String(label), true)}
                    rows={[
                      { label: "Average rating", value: p.rating === null ? "no reviews" : p.rating.toFixed(2), color: A },
                      { label: "Reviews", value: String(p.reviews) },
                    ]}
                  />
                );
              }}
            />
            <Line dataKey="rating" stroke={A} strokeWidth={2} dot={false} connectNulls activeDot={{ r: 5, stroke: "var(--surface)", strokeWidth: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

/* ------------------------------------------------- this year vs before */

export type CompareRow = { label: string; now: number; before: number | null };

/**
 * Paired bars: the last 12 months (green) directly above the 12 before (beige), each with its
 * value, so the comparison reads without decoding a marker.
 */
export function CompareBars({
  rows,
  format,
  caption,
  nowLabel = "Last 12 months",
  beforeLabel = "12 months before",
  delta = "relative",
}: {
  rows: CompareRow[];
  format: (n: number) => string;
  caption: string;
  nowLabel?: string;
  beforeLabel?: string;
  /** "absolute" for small counts, where +1200% would mislead */
  delta?: "relative" | "absolute";
}) {
  const max = Math.max(1e-9, ...rows.map((r) => Math.max(r.now, r.before ?? 0)));
  const hasBefore = rows.some((r) => r.before !== null);
  return (
    <figure className="space-y-4">
      <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {caption ? <span>{caption}</span> : null}
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-3 rounded-sm bg-[var(--chart-a)]" /> {nowLabel}
        </span>
        {hasBefore ? (
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-3 rounded-sm bg-[var(--chart-base)]" /> {beforeLabel}
          </span>
        ) : null}
      </figcaption>
      <ul className="space-y-3.5">
        {rows.map((r) => {
          const ch = r.before ? r.now / r.before - 1 : null;
          const diff = r.before !== null ? r.now - r.before : null;
          const text =
            delta === "absolute"
              ? diff === null || diff === 0 ? "" : `${diff > 0 ? "+" : "−"}${format(Math.abs(diff))}`
              : ch === null || !Number.isFinite(ch) ? "" : `${ch >= 0 ? "+" : "−"}${Math.abs(ch * 100).toFixed(0)}%`;
          return (
            <li key={r.label} className="grid grid-cols-[minmax(84px,128px)_1fr_auto] items-center gap-x-3 text-sm">
              <span className="truncate text-muted-foreground" title={r.label}>
                {r.label}
              </span>
              <span className="space-y-1">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 rounded-r-[3px] bg-[var(--chart-a)]" style={{ width: `${r.now > 0 ? Math.max(0.6, (r.now / max) * 100) : 0}%` }} />
                  <span className="whitespace-nowrap text-xs font-semibold tabular-nums">{format(r.now)}</span>
                </span>
                {r.before !== null ? (
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 rounded-r-[3px] bg-[var(--chart-base)]" style={{ width: `${r.before > 0 ? Math.max(0.6, (r.before / max) * 100) : 0}%` }} />
                    <span className="whitespace-nowrap text-[11px] tabular-nums text-muted-foreground">{format(r.before)}</span>
                  </span>
                ) : null}
              </span>
              <span
                className={cn(
                  "w-12 text-right text-xs tabular-nums",
                  !text || text === "+0%" || text === "−0%" ? "text-muted-foreground" : "font-medium text-foreground"
                )}
              >
                {text}
              </span>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}
