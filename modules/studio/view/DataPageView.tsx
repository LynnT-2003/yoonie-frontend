"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStudio } from "@/providers/studio-provider";
import { monthLabel } from "@/lib/domain/studio/format";
import { DataHealth } from "../components/health";
import { RowsBar, rowsBreakdown } from "../components/quality";

/** Data: what Yoonie did to the owner's files, and the structured table it built. */
export function DataPageView() {
  const { dataset, ready, run } = useStudio();
  if (!ready) return <div className="mx-auto h-96 w-full max-w-6xl animate-pulse px-6 py-10" />;
  if (!dataset || run.status === "running")
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-muted-foreground">
          {run.status === "running" ? "Yoonie is still reading your files." : "Upload your spreadsheets on the Dashboard to see what Yoonie found in them."}
        </p>
        <Button asChild className="mt-4">
          <Link href="/studio/dashboard">
            Go to Dashboard <ArrowRight />
          </Link>
        </Button>
      </div>
    );

  const { used } = rowsBreakdown(dataset.stats.rowsRead, dataset.anomalies);
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-20 pt-6 sm:px-6 sm:pt-10">
      <header className="space-y-3">
        <p className="text-[13px] font-medium text-primary">
          Data · {dataset.property.name} · {monthLabel(dataset.property.from)} – {monthLabel(dataset.property.to)}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {used.toLocaleString("en-US")} of {dataset.stats.rowsRead.toLocaleString("en-US")} rows are in your numbers.
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Yoonie cleaned your files, then structured them. Nothing was silently changed: tidied values keep the same meaning, and anything doubtful stays
          out of the totals until you confirm it.
        </p>
        <div className="pt-2">
          <RowsBar rowsRead={dataset.stats.rowsRead} anomalies={dataset.anomalies} />
        </div>
      </header>
      <DataHealth dataset={dataset} />
    </div>
  );
}
