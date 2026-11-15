"use client";

import * as React from "react";
import { Archive, ArrowRight, Eye, Hand, Sparkles } from "lucide-react";
import type { Anomaly, ExtractedField, Resolution, SheetStat } from "@/lib/types/studio";
import { cn } from "@/lib/utils";

/**
 * One vocabulary for data quality, used everywhere: four buckets that say what the owner has
 * to do, not how "severe" something is.
 */

export type Bucket = Resolution;

export const BUCKETS: Record<Bucket, { label: string; meaning: string; icon: typeof Hand; tile: string; dot: string; text: string }> = {
  needs_owner: {
    label: "Needs you",
    meaning: "Missing or doubtful values. Not counted until you confirm them.",
    icon: Hand,
    tile: "bg-warning-soft border-warning/25",
    dot: "bg-[var(--chart-b)]",
    text: "text-warning",
  },
  kept_flagged: {
    label: "Worth a look",
    meaning: "Counted, but unusual. Check it's right.",
    icon: Eye,
    tile: "bg-info-soft border-info/20",
    dot: "bg-info",
    text: "text-info",
  },
  excluded: {
    label: "Set aside",
    meaning: "Left out: duplicates, cancellations, impossible dates.",
    icon: Archive,
    tile: "bg-muted border-border",
    dot: "bg-[var(--chart-ref)]",
    text: "text-muted-foreground",
  },
  normalised: {
    label: "Tidied",
    meaning: "Same value, cleaner format. Nothing for you to do.",
    icon: Sparkles,
    tile: "bg-success-soft border-success/20",
    dot: "bg-[var(--chart-a)]",
    text: "text-success",
  },
};
export const BUCKET_ORDER: Bucket[] = ["needs_owner", "kept_flagged", "excluded", "normalised"];

/** rows (or values, for tidied groups) affected */
export const weight = (a: Anomaly) => (a.row === null ? (a.count ?? 1) : 1);

export function bucketCounts(anomalies: Anomaly[]) {
  const out = { needs_owner: 0, kept_flagged: 0, excluded: 0, normalised: 0 } as Record<Bucket, number>;
  for (const a of anomalies) out[a.resolution] += weight(a);
  return out;
}

/**
 * Where the rows of recognised sheets went. Sheet-level "not recognised" notes are about whole
 * tabs that were never read as data, so they don't count as set-aside rows here.
 */
export function rowsBreakdown(rowsRead: number, anomalies: Anomaly[]) {
  const rows = anomalies.filter((a) => a.kind !== "unrecognised");
  const setAside = rows.filter((a) => a.resolution === "excluded").reduce((s, a) => s + weight(a), 0);
  const waiting = rows.filter((a) => a.resolution === "needs_owner").reduce((s, a) => s + weight(a), 0);
  return { used: Math.max(0, rowsRead - setAside - waiting), waiting, setAside };
}

/* ------------------------------------------------------------- rows bar */

/** Where every row went: in your numbers / waiting for you / set aside. */
export function RowsBar({ rowsRead, anomalies }: { rowsRead: number; anomalies: Anomaly[] }) {
  const { used, waiting, setAside } = rowsBreakdown(rowsRead, anomalies);
  const parts = [
    { label: "In your numbers", n: used, color: "var(--chart-a)" },
    { label: "Waiting for you", n: waiting, color: "var(--chart-b)" },
    { label: "Set aside", n: setAside, color: "var(--chart-ref)" },
  ];
  const total = Math.max(1, rowsRead);
  return (
    <figure className="space-y-2">
      <div className="flex h-4 w-full gap-0.5 overflow-hidden rounded-full" role="img" aria-label={parts.map((p) => `${p.label}: ${p.n}`).join(", ")}>
        {parts.map((p) =>
          p.n ? (
            <span
              key={p.label}
              title={`${p.label}: ${p.n.toLocaleString("en-US")} rows`}
              style={{ width: `${Math.max(0.6, (p.n / total) * 100)}%`, background: p.color }}
              className="h-full first:rounded-l-full last:rounded-r-full"
            />
          ) : null
        )}
      </div>
      <figcaption className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {parts.map((p) => (
          <span key={p.label} className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: p.color }} />
            {p.label} <strong className="font-semibold tabular-nums text-foreground">{p.n.toLocaleString("en-US")}</strong>
            <span>({((p.n / total) * 100).toFixed(p.n / total < 0.01 && p.n ? 1 : 0)}%)</span>
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

/* --------------------------------------------------------- tidied table */

export function TidiedTable({ anomalies, limit }: { anomalies: Anomaly[]; limit?: number }) {
  const groups = anomalies.filter((a) => a.resolution === "normalised");
  const shown = limit ? groups.slice(0, limit) : groups;
  if (!groups.length) return <Empty>Nothing needed tidying yet.</Empty>;
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full min-w-[520px] text-[13px]">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <th className="px-3 py-2 font-semibold">What we tidied</th>
            <th className="px-3 py-2 font-semibold">In your file</th>
            <th className="w-6 px-0 py-2" />
            <th className="px-3 py-2 font-semibold">Read as</th>
            <th className="px-3 py-2 text-right font-semibold">Values</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((a) => {
            const ex = a.examples?.length ? a.examples : [{ before: "", after: "" }];
            return ex.map((e, i) => (
              <tr key={`${a.id}-${i}`} className={cn("align-top", i === ex.length - 1 && "border-b border-border last:border-0")}>
                {i === 0 ? (
                  <td className="px-3 py-2" rowSpan={ex.length}>
                    <p className="font-semibold">{a.title}</p>
                    <p className="text-[11px] text-muted-foreground">{[a.file, a.sheet && `sheet ${a.sheet}`].filter(Boolean).join(" · ")}</p>
                  </td>
                ) : null}
                <td className="px-3 py-1.5">{e.before ? <code className="rounded bg-muted px-1.5 py-0.5 text-[12px]">{e.before}</code> : <span className="text-muted-foreground">see note</span>}</td>
                <td className="px-0 py-1.5 text-muted-foreground">{e.before ? <ArrowRight className="size-3.5" /> : null}</td>
                <td className="px-3 py-1.5">{e.after ? <code className="rounded bg-success-soft px-1.5 py-0.5 text-[12px] text-success">{e.after}</code> : <span className="text-xs text-muted-foreground">{a.detail}</span>}</td>
                {i === 0 ? (
                  <td className="px-3 py-2 text-right font-semibold tabular-nums" rowSpan={ex.length}>
                    {(a.count ?? 1).toLocaleString("en-US")}
                  </td>
                ) : null}
              </tr>
            ));
          })}
        </tbody>
      </table>
    </div>
  );
}

/* -------------------------------------------------------- findings table */

export function FindingsTable({ anomalies, empty }: { anomalies: Anomaly[]; empty?: string }) {
  if (!anomalies.length) return <Empty>{empty ?? "Nothing here."}</Empty>;
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full min-w-[640px] text-[13px]">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <th className="px-3 py-2 font-semibold">What</th>
            <th className="px-3 py-2 font-semibold">Where</th>
            <th className="px-3 py-2 font-semibold">Value</th>
            <th className="px-3 py-2 font-semibold">What Yoonie did</th>
          </tr>
        </thead>
        <tbody>
          {anomalies.map((a) => (
            <tr key={a.id} className="border-b border-border align-top last:border-0">
              <td className="max-w-[340px] px-3 py-2">
                <p className="font-semibold">{a.title}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{a.detail}</p>
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-xs text-muted-foreground">
                {a.sheet ? <span className="block">Sheet {a.sheet}</span> : null}
                {a.row ? <span className="block font-medium text-foreground">Row {a.row}</span> : a.count ? <span className="block">{a.count.toLocaleString("en-US")} rows</span> : null}
              </td>
              <td className="px-3 py-2">{a.value ? <code className="rounded bg-muted px-1.5 py-0.5 text-[12px]">{a.value}</code> : <span className="text-muted-foreground">-</span>}</td>
              <td className="px-3 py-2">
                <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold", BUCKETS[a.resolution].text)}>
                  <span className={cn("size-1.5 rounded-full", BUCKETS[a.resolution].dot)} />
                  {BUCKETS[a.resolution].label}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------ per sheet */

export function SheetTable({ sheets }: { sheets: SheetStat[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full min-w-[640px] text-[13px]">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <th className="px-3 py-2 font-semibold">File · sheet</th>
            <th className="px-3 py-2 font-semibold">Read as</th>
            <th className="px-3 py-2 text-right font-semibold">Rows</th>
            <th className="px-3 py-2 font-semibold">Where they went</th>
            <th className="px-3 py-2 text-right font-semibold">Needs you</th>
            <th className="px-3 py-2 text-right font-semibold">Set aside</th>
            <th className="px-3 py-2 text-right font-semibold">Tidied</th>
          </tr>
        </thead>
        <tbody>
          {sheets.map((s) => {
            const used = Math.max(0, s.rows - s.setAside - s.needsYou);
            const pct = (n: number) => `${s.rows ? (n / s.rows) * 100 : 0}%`;
            return (
              <tr key={`${s.file}-${s.sheet}`} className="border-b border-border last:border-0">
                <td className="px-3 py-2">
                  <p className="font-medium">Sheet {s.sheet}</p>
                  <p className="max-w-[220px] truncate text-[11px] text-muted-foreground">{s.file}</p>
                </td>
                <td className="px-3 py-2">
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", s.kind === "unknown" ? "bg-muted text-muted-foreground" : "bg-secondary text-secondary-foreground")}>
                    {s.kind === "unknown" ? "skipped" : s.kind}
                  </span>
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{s.rows.toLocaleString("en-US")}</td>
                <td className="w-40 px-3 py-2">
                  <span className="flex h-2 w-full gap-px overflow-hidden rounded-full bg-muted">
                    <span style={{ width: pct(used), background: "var(--chart-a)" }} />
                    <span style={{ width: pct(s.needsYou), background: "var(--chart-b)" }} />
                    <span style={{ width: pct(s.setAside), background: "var(--chart-ref)" }} />
                  </span>
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{s.needsYou || "-"}</td>
                <td className="px-3 py-2 text-right tabular-nums">{s.setAside || "-"}</td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{s.tidied ? s.tidied.toLocaleString("en-US") : "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* --------------------------------------------------------------- fields */

export function FieldsTable({ fields, highlightLast }: { fields: ExtractedField[]; highlightLast?: boolean }) {
  if (!fields.length) return <Empty>Fields appear here as Yoonie builds them.</Empty>;
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full min-w-[560px] text-[13px]">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <th className="px-3 py-2 font-semibold">Field</th>
            <th className="px-3 py-2 font-semibold">Built from</th>
            <th className="px-3 py-2 font-semibold">Latest value</th>
            <th className="w-32 px-3 py-2 font-semibold">Coverage</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((f, i) => (
            <tr
              key={f.key}
              className={cn("border-b border-border last:border-0", highlightLast && i === fields.length - 1 && "animate-in fade-in slide-in-from-top-1 duration-300")}
            >
              <td className="px-3 py-2 font-semibold">{f.label}</td>
              <td className="px-3 py-2 text-xs text-muted-foreground">{f.source}</td>
              <td className="px-3 py-2 font-medium tabular-nums">{f.sample ?? "-"}</td>
              <td className="px-3 py-2">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <span className="block h-full rounded-full bg-[var(--chart-a)]" style={{ width: `${f.coverage * 100}%` }} />
                  </span>
                  <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">{Math.round(f.coverage * 100)}%</span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">{children}</p>;
}

/** CSV of the rows that need the owner, to fix in their own sheet and re-upload. */
export function fixListCsv(anomalies: Anomaly[]) {
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = anomalies
    .filter((a) => a.resolution === "needs_owner" || a.resolution === "kept_flagged")
    .map((a) => [BUCKETS[a.resolution].label, a.file, a.sheet ?? "", a.row ?? "", a.field ?? "", a.title, a.value ?? "", a.detail].map(esc).join(","));
  return ["Status,File,Sheet,Row,Column,Issue,Value in file,Details", ...rows].join("\n");
}
