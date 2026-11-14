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
    .map((t) => ({ t, now: count(now, t), before: count(before, t) }))
    .filter((r) => r.now || r.before)
    .sort((a, b) => b.now - a.now);
  const max = Math.max(1, ...rows.map((r) => Math.max(r.now, r.before)));
  if (!rows.length) return <p className="text-sm text-muted-foreground">No recurring complaints found in the reviews.</p>;
  return (
    <figure className="space-y-3">
      <figcaption className="text-xs text-muted-foreground">
        Reviews mentioning a problem, last 6 months. Grey tick = the 6 months before.
      </figcaption>
      <ul className="space-y-2.5">
        {rows.map((r) => (
          <li key={r.t} className="group grid grid-cols-[88px_1fr_64px] items-center gap-3 text-sm" title={`${labels[r.t]}: ${r.now} (was ${r.before})`}>
            <span className="truncate text-muted-foreground">{labels[r.t]}</span>
            <span className="relative h-3">
              <span className="absolute inset-y-0 left-0 rounded-r-[4px] bg-[var(--chart-a)] transition-opacity group-hover:opacity-80" style={{ width: `${(r.now / max) * 100}%` }} />
              <span className="absolute -inset-y-0.5 w-0.5 rounded bg-[var(--chart-ref)]" style={{ left: `calc(${(r.before / max) * 100}% - 1px)` }} />
            </span>
            <span className="text-right text-xs tabular-nums">
              <strong className="font-semibold text-foreground">{r.now}</strong> <span className="text-muted-foreground">(was {r.before})</span>
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
