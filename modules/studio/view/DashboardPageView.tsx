"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { YoonieMascot } from "@/components/mascot/YoonieMascot";
import { useStudio } from "@/providers/studio-provider";
import { monthLabel } from "@/lib/domain/studio/format";
import { THEME_LABEL } from "@/lib/domain/studio/labels";
import { ComplaintBars, OccupancyChart, RevenueCostChart } from "../components/charts";
import { FormulaStrip, InsightCard, KpiTiles, RecommendationCard } from "../components/strategy";
import { ChatPanel, ChatSheet } from "../components/ChatPanel";

export function DashboardPageView() {
  const { dataset, ready, recStatus, run } = useStudio();

  if (!ready) return <div className="mx-auto h-96 w-full max-w-7xl animate-pulse px-6 py-10" />;
  if (!dataset) return <EmptyState running={run.status === "running"} />;

  const highlight = dataset.insights.find((i) => i.area === "demand")?.focusMonth;
  const pending = dataset.anomalies.filter((a) => a.resolution === "needs_owner").length;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-6 sm:px-6 sm:py-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-8">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-gold">Your strategy</p>
              <h1 className="text-2xl font-extrabold tracking-tight text-primary sm:text-3xl">{dataset.property.name}</h1>
              <p className="text-sm text-muted-foreground">
                {dataset.property.rooms} rooms · {monthLabel(dataset.property.from)} – {monthLabel(dataset.property.to)} · {dataset.files.length} file
                {dataset.files.length === 1 ? "" : "s"}
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/studio">
                <UploadCloud /> Upload new data
              </Link>
            </Button>
          </header>

          {pending ? (
            <Link
              href="/studio/data"
              className="flex items-center gap-3 rounded-2xl border border-warning/30 bg-warning-soft px-4 py-3 text-sm text-warning transition-colors hover:bg-warning-soft/70"
            >
              <AlertTriangle className="size-4 shrink-0" />
              <span className="flex-1">
                <strong className="font-semibold">{pending} values need your confirmation</strong> before they count in the numbers below.
              </span>
              <ArrowRight className="size-4" />
            </Link>
          ) : null}

          <section className="space-y-3" aria-labelledby="top-actions">
            <div className="space-y-2">
              <h2 id="top-actions" className="text-xl font-bold">
                Top {dataset.recommendations.length} things to do next
              </h2>
              <p className="text-sm text-muted-foreground">Every number is calculated from your own data. Targets are things to test, not promises.</p>
              <FormulaStrip />
            </div>
            {dataset.recommendations.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {dataset.recommendations.map((r, i) => (
                  <div key={r.id} className={i === 0 && dataset.recommendations.length !== 2 ? "md:col-span-2" : undefined}>
                    <RecommendationCard r={r} status={recStatus[r.id]} wide={i === 0 && dataset.recommendations.length !== 2} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5">
                <YoonieMascot mood="calm" size="sm" />
                <p className="text-sm text-muted-foreground">
                  Nothing stands out yet. That&apos;s usually good news. More months of data, or adding expenses and reviews, gives Yoonie more to compare.
                </p>
              </div>
            )}
          </section>

          <KpiTiles kpis={dataset.kpis} window={dataset.kpiWindow} />

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="font-bold">Occupancy, month by month</h2>
              <p className="mb-3 text-sm text-muted-foreground">Compared with what&apos;s usual for the same month in earlier years.</p>
              <OccupancyChart months={dataset.months} highlight={highlight} />
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="font-bold">Room revenue vs operating costs</h2>
              <p className="mb-3 text-sm text-muted-foreground">The gap between the lines is operating profit.</p>
              <RevenueCostChart months={dataset.months} />
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
            <div className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="mb-3 font-bold">What guests complain about</h2>
              <ComplaintBars months={dataset.months} labels={THEME_LABEL} />
            </div>
            <div className="space-y-3">
              <h2 className="font-bold">What Yoonie noticed</h2>
              {dataset.insights.map((i) => (
                <InsightCard key={i.id} insight={i} />
              ))}
            </div>
          </section>
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-20 h-[calc(100vh-10rem)] min-h-[480px]">
            <ChatPanel dataset={dataset} className="h-full" />
          </div>
        </aside>
      </div>
      <ChatSheet dataset={dataset} />
    </div>
  );
}

function EmptyState({ running }: { running: boolean }) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-5 px-4 py-20 text-center">
      <YoonieMascot mood={running ? "thinking" : "sleeping"} size="xl" />
      <h1 className="text-2xl font-extrabold text-primary">{running ? "Yoonie is still reading your files" : "No data yet"}</h1>
      <p className="text-muted-foreground">
        {running
          ? "Follow along on the upload page. Your strategy appears here when it's done."
          : "Upload your bookings, expenses and reviews, or try the sample hotel, and your strategy will appear here."}
      </p>
      <Button asChild size="lg">
        <Link href="/studio">
          {running ? "Watch progress" : "Upload spreadsheets"} <ArrowRight />
        </Link>
      </Button>
    </div>
  );
}
