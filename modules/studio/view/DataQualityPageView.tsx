"use client";

import * as React from "react";
import Link from "next/link";
import { FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStudio } from "@/providers/studio-provider";
import type { Resolution, Severity } from "@/lib/types/studio";
import { AnomalyRow, FieldList, RESOLUTION, SEVERITY } from "../components/pipeline";
import { cn } from "@/lib/utils";

type Filter = "all" | Severity | "needs_owner";

export function DataQualityPageView() {
  const { dataset, ready } = useStudio();
  const [filter, setFilter] = React.useState<Filter>("all");
  if (!ready) return <div className="mx-auto h-96 w-full max-w-5xl animate-pulse px-6 py-10" />;
  if (!dataset)
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-muted-foreground">Upload data to see what Yoonie found in it.</p>
        <Button asChild className="mt-4">
          <Link href="/studio">Upload spreadsheets</Link>
        </Button>
      </div>
    );

  const list = dataset.anomalies.filter((a) =>
    filter === "all" ? true : filter === "needs_owner" ? a.resolution === "needs_owner" : a.severity === filter
  );
  const counts: Record<Filter, number> = {
    all: dataset.anomalies.length,
    needs_owner: dataset.anomalies.filter((a) => a.resolution === "needs_owner").length,
    critical: dataset.anomalies.filter((a) => a.severity === "critical").length,
    review: dataset.anomalies.filter((a) => a.severity === "review").length,
    info: dataset.anomalies.filter((a) => a.severity === "info").length,
  };
  const byRes = (r: Resolution) => dataset.anomalies.filter((a) => a.resolution === r).length;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-6 sm:px-6 sm:py-10">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-gold">Data quality</p>
        <h1 className="text-2xl font-extrabold tracking-tight text-primary sm:text-3xl">What Yoonie found in your files</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Every recommendation rests on this. Nothing was silently changed: format fixes keep the same value, and anything doubtful is left out of the
          totals until you confirm it.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: "Rows read", value: dataset.stats.rowsRead.toLocaleString("en-US") },
          { label: "Rows used", value: dataset.stats.rowsUsed.toLocaleString("en-US") },
          { label: "Set aside", value: dataset.stats.rowsExcluded.toLocaleString("en-US"), hint: "duplicates, cancellations, impossible dates" },
          { label: "Waiting for you", value: String(dataset.stats.needsOwner), hint: "missing or doubtful amounts" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-surface px-4 py-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold tabular-nums">{s.value}</p>
            {s.hint ? <p className="text-[11px] text-muted-foreground">{s.hint}</p> : null}
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-bold">Files</h2>
        <ul className="grid gap-2 sm:grid-cols-3">
          {dataset.files.map((f) => (
            <li key={f.name} className="rounded-2xl border border-border bg-surface p-3">
              <p className="flex items-center gap-2 truncate text-sm font-semibold">
                <FileSpreadsheet className="size-4 shrink-0 text-primary" /> <span className="truncate">{f.name}</span>
              </p>
              <ul className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
                {f.sheets.map((s) => (
                  <li key={s.name} className="flex justify-between gap-2">
                    <span className="truncate">{s.name}</span>
                    <span className={cn(s.kind === "unknown" && "text-warning")}>{s.kind === "unknown" ? "skipped" : `${s.kind} · ${s.rows.toLocaleString("en-US")}`}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-bold">Findings</h2>
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter findings">
            {(["all", "needs_owner", "critical", "review", "info"] as Filter[]).map((f) => (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={filter === f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-muted-foreground hover:text-foreground"
                )}
              >
                {f === "all" ? "All" : f === "needs_owner" ? "Needs you" : SEVERITY[f].label} ({counts[f]})
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {(Object.keys(RESOLUTION) as Resolution[]).map((r) => `${RESOLUTION[r]}: ${byRes(r)}`).join(" · ")}
        </p>
        <ul className="space-y-2">
          {list.map((a) => (
            <AnomalyRow key={a.id} a={a} />
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-bold">Business fields Yoonie built</h2>
        <FieldList fields={dataset.fields} />
      </section>
    </div>
  );
}
