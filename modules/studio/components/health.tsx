"use client";

import * as React from "react";
import { Download } from "lucide-react";
import type { AnomalyKind, Dataset } from "@/lib/types/studio";
import { money, pct } from "@/lib/domain/studio/format";
import { Button } from "@/components/ui/button";
import { MonthlyTable } from "./eda";
import {
  BUCKETS,
  FieldsTable,
  FindingsTable,
  SheetTable,
  TidiedTable,
  fixListCsv,
  rowsBreakdown,
  weight,
  type Bucket,
} from "./quality";
import { cn } from "@/lib/utils";

/** What Yoonie did with each kind of problem, in the owner's words (pitch slide 8). */
const HANDLED: { kind: AnomalyKind; label: string; did: string }[] = [
  { kind: "duplicate", label: "Duplicate rows", did: "counted once, the copy set aside" },
  { kind: "missing_value", label: "Missing values", did: "owner confirmation requested" },
  { kind: "outlier", label: "Unusual amounts", did: "flagged, not overwritten" },
  { kind: "invalid", label: "Unusable rows", did: "held back from analysis" },
  { kind: "format", label: "Messy formats", did: "tidied, values unchanged" },
  { kind: "unrecognised", label: "Unrecognised tabs & labels", did: "skipped or grouped as Other" },
];

type Tab = Bucket | "files" | "fields" | "table";

export function DataHealth({ dataset }: { dataset: Dataset }) {
  const [tab, setTab] = React.useState<Tab>("needs_owner");
  const of = (b: Bucket) => dataset.anomalies.filter((a) => a.resolution === b);
  const rows = rowsBreakdown(dataset.stats.rowsRead, dataset.anomalies);
  const last12 = dataset.months.slice(-12);
  const nights = last12.reduce((s, m) => s + m.roomNightsSold, 0);
  const avail = last12.reduce((s, m) => s + m.roomsAvailable, 0);
  const revenue = last12.reduce((s, m) => s + m.roomRevenue, 0);
  const paid = last12.reduce((s, m) => s + m.roomNightsSold - m.unpricedNights, 0);
  const costs = last12.reduce((s, m) => s + (m.totalExpenses ?? 0), 0);

  const downloadFixList = () => {
    const blob = new Blob(["﻿" + fixListCsv(dataset.anomalies)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "yoonie-fix-list.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs: { id: Tab; label: string; n?: number }[] = [
    // same counting as the rows bar above: rows (values, for Tidied), not number of findings
    { id: "needs_owner", label: BUCKETS.needs_owner.label, n: rows.waiting },
    { id: "kept_flagged", label: BUCKETS.kept_flagged.label, n: of("kept_flagged").length },
    { id: "normalised", label: BUCKETS.normalised.label, n: of("normalised").reduce((n, x) => n + weight(x), 0) },
    { id: "excluded", label: BUCKETS.excluded.label, n: rows.setAside },
    { id: "files", label: "Files", n: dataset.sheets.length },
    { id: "fields", label: "Fields", n: dataset.fields.length },
    { id: "table", label: "Monthly table", n: dataset.months.length },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {/* cleaning */}
        <div className="flex flex-col rounded-xl border border-border bg-surface p-5">
          <p className="text-sm font-semibold">Cleaning</p>
          <ul className="mt-3 flex-1 divide-y divide-border">
            {HANDLED.map((h) => {
              const list = dataset.anomalies.filter((a) => a.kind === h.kind);
              if (!list.length) return null;
              const n = list.reduce((s, a) => s + weight(a), 0);
              return (
                <li key={h.kind} className="grid grid-cols-[1fr_auto] items-baseline gap-x-4 py-2 text-sm sm:grid-cols-[180px_1fr_auto]">
                  <span className="font-semibold">{h.label}</span>
                  <span className="order-3 col-span-2 text-muted-foreground sm:order-none sm:col-span-1">{h.did}</span>
                  <span className="text-right text-xs tabular-nums text-muted-foreground">{n.toLocaleString("en-US")}</span>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-[13px] text-muted-foreground">Nothing is silently fabricated.</p>
        </div>

        {/* structuring */}
        <div className="flex flex-col rounded-xl bg-primary p-5 text-primary-foreground">
          <p className="text-sm font-semibold">Structuring <span className="font-normal opacity-70">· last 12 months</span></p>
          <dl className="mt-3 flex-1 divide-y divide-white/10">
            {[
              ["Occupancy rate", avail ? pct(nights / avail) : "n/a"],
              ["ADR", paid ? money(revenue / paid) : "n/a"],
              ["RevPAR", avail ? money(revenue / avail) : "n/a"],
              ["Operating expenses", costs ? money(costs, { compact: true }) : "n/a"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between py-2 text-sm">
                <dt className="opacity-80">{k}</dt>
                <dd className="text-lg font-bold tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[13px] opacity-80">
            A usable business data model: {dataset.fields.length} fields × {dataset.months.length} months.
          </p>
        </div>
      </div>

      <div className="space-y-3 pt-4">
        <div className="flex flex-col gap-2 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div role="tablist" aria-label="Data details" className="-mb-3 flex gap-5 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "shrink-0 border-b-2 pb-3 text-sm transition-colors",
                  tab === t.id ? "border-primary font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
                {t.n !== undefined ? <span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 text-[11px] tabular-nums text-muted-foreground">{t.n.toLocaleString("en-US")}</span> : null}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={downloadFixList}>
            <Download /> Download fix list (.csv)
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {tab === "files"
            ? "How each sheet was read and where its rows went."
            : tab === "fields"
              ? "The structured fields every chart and action is calculated from."
              : tab === "table"
                ? "Every number, month by month, newest first. This is the table behind every chart."
                : BUCKETS[tab].meaning}
        </p>
        {tab === "table" ? (
          <MonthlyTable months={dataset.months} propertyName={dataset.property.name} />
        ) : tab === "files" ? (
          <SheetTable sheets={dataset.sheets} />
        ) : tab === "fields" ? (
          <FieldsTable fields={dataset.fields} />
        ) : tab === "normalised" ? (
          <TidiedTable anomalies={dataset.anomalies} />
        ) : (
          <FindingsTable anomalies={of(tab)} empty="Nothing here." />
        )}
      </div>
    </div>
  );
}
