"use client";

import * as React from "react";
import { Line, LineChart, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ChatChart as Chart } from "@/lib/domain/studio/chat-charts";
import { money, pct } from "@/lib/domain/studio/format";

/**
 * A small chart under a Yoonie answer. Colours come from the same validated tokens as the
 * Dashboard charts (--chart-a for the series, --chart-ref for the comparison).
 */

const A = "var(--chart-a)";
const REF = "var(--chart-ref)";

function fmt(v: number, f: Chart["format"]) {
  if (f === "percent") return pct(v);
  if (f === "currency") return money(v, { compact: true });
  if (f === "decimal") return v.toFixed(2);
  return Math.round(v).toLocaleString("en-US");
}

export function ChatChart({ chart }: { chart: Chart }) {
  return (
    <figure className="rounded-2xl border border-border bg-surface px-3 py-2.5">
      <figcaption className="mb-2 text-[11px] font-semibold leading-snug text-foreground">{chart.title}</figcaption>
      {chart.kind === "line" ? <LineView chart={chart} /> : <BarsView chart={chart} />}
    </figure>
  );
}

function BarsView({ chart }: { chart: Extract<Chart, { kind: "bars" }> }) {
  const max = Math.max(...chart.rows.flatMap((r) => [r.value, r.prev ?? 0]), 0) || 1;
  const two = chart.series.length === 2;
  const anyHighlight = chart.rows.some((r) => r.highlight);
  const w = (v: number) => `${Math.max(0, (v / max) * 100)}%`;
  return (
    <div className="space-y-1.5">
      {two ? (
        <ul className="mb-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
          {chart.series.map((s, i) => (
            <li key={s} className="flex items-center gap-1">
              <span className="inline-block size-2 rounded-sm" style={{ background: i === 0 ? A : REF }} aria-hidden />
              {s}
            </li>
          ))}
        </ul>
      ) : null}
      {chart.rows.map((r) => (
        <div key={r.label} className="grid grid-cols-[minmax(0,38%)_1fr] items-center gap-2 text-[11px]">
          <span className="line-clamp-2 leading-tight text-muted-foreground" title={r.label}>
            {r.label}
          </span>
          <div className="space-y-0.5">
            <Bar width={w(r.value)} color={!anyHighlight || r.highlight ? A : REF} value={fmt(r.value, chart.format)} strong={r.highlight} />
            {two && r.prev !== undefined ? <Bar width={w(r.prev)} color={REF} value={fmt(r.prev, chart.format)} /> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function Bar({ width, color, value, strong }: { width: string; color: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-2 min-w-0 flex-1">
        <div className="h-full rounded-sm" style={{ width, minWidth: 2, background: color }} />
      </div>
      <span className={`w-11 shrink-0 text-right tabular-nums ${strong ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{value}</span>
    </div>
  );
}

function LineView({ chart }: { chart: Extract<Chart, { kind: "line" }> }) {
  const data = chart.points;
  const hi = chart.highlight ? data.find((p) => p.label === chart.highlight) : undefined;
  // ratings are out of 5: never draw an axis above it
  const ceiling = chart.format === "decimal" && data.every((p) => p.value == null || p.value <= 5) ? 5 : Infinity;
  return (
    <div className="h-28 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 6, right: 6, bottom: 0, left: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--chart-grid)" }}
            interval="preserveStartEnd"
            minTickGap={18}
          />
          <YAxis
            domain={[(lo: number) => lo, (hi: number) => Math.min(hi, ceiling)]}
            allowDecimals={chart.format !== "count"}
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickFormatter={(v: number) => fmt(v, chart.format)}
            tickLine={false}
            axisLine={false}
            tickCount={3}
            width={40}
          />
          <Tooltip
            cursor={{ stroke: "var(--chart-grid)" }}
            content={({ active, payload }) => {
              const p = active ? (payload?.[0]?.payload as (typeof data)[number] | undefined) : undefined;
              return p && p.value != null ? (
                <div className="rounded-lg border border-border bg-popover px-2 py-1 text-[11px] shadow-md">
                  <span className="text-muted-foreground">{p.label}</span>{" "}
                  <span className="font-semibold tabular-nums text-foreground">{fmt(p.value, chart.format)}</span>
                </div>
              ) : null;
            }}
          />
          <Line type="monotone" dataKey="value" stroke={A} strokeWidth={2} dot={false} connectNulls isAnimationActive={false} />
          {hi && hi.value != null ? <ReferenceDot x={hi.label} y={hi.value} r={4} fill={A} stroke="var(--surface)" strokeWidth={2} /> : null}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
