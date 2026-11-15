"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { YoonieMascot } from "@/components/mascot/YoonieMascot";
import { useStudio } from "@/providers/studio-provider";
import { ActionCard } from "../components/strategy";

/** Strategy: the recommendations as an action plan. Nothing else. */
export function StrategyPageView() {
  const { dataset, ready, run, cancel } = useStudio();

  // arriving here after a finished run: the run view has done its job
  React.useEffect(() => {
    if (run.status === "done") cancel();
  }, [run.status, cancel]);

  if (!ready) return <div className="mx-auto h-96 w-full max-w-5xl animate-pulse px-6 py-10" />;

  if (!dataset || run.status === "running") {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-5 px-4 py-20 text-center">
        {run.status === "running" ? <YoonieMascot mood="thinking" size="xl" /> : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/brand/sam/sam-thinking.png" alt="Sam, wondering what to do next" className="w-40" />
        )}
        <h1 className="text-2xl font-semibold tracking-tight">{run.status === "running" ? "Yoonie is still working on it" : "No actions yet"}</h1>
        <p className="text-muted-foreground">
          {run.status === "running"
            ? "Your action plan appears here as soon as the analysis finishes."
            : "Upload your spreadsheets on the Dashboard. Yoonie turns what it finds into actions here."}
        </p>
        <Button asChild size="lg">
          <Link href="/studio/dashboard">
            Go to Dashboard <ArrowRight />
          </Link>
        </Button>
      </div>
    );
  }

  const recs = dataset.recommendations;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 pb-20 pt-6 sm:px-6 sm:pt-10">
      <header className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
        <div className="space-y-3">
          <p className="text-[13px] font-medium text-primary">Strategy · {dataset.property.name}</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            {recs.length ? `${recs.length} things to do next.` : "Nothing urgent right now."}
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            What Yoonie noticed in your data, what to try, and how you&apos;ll know it worked.
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/sam/sam-happy.png" alt="Sam, smiling at his phone with Yoonie" className="mx-auto hidden w-44 md:block" />
      </header>

      {recs.length ? null : (
        <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-5">
          <YoonieMascot mood="calm" size="sm" />
          <p className="text-sm text-muted-foreground">Nothing stands out in this data. More months, or adding expenses and reviews, gives Yoonie more to compare.</p>
        </div>
      )}

      <div className="space-y-10">
        {recs.map((r) => (
          <ActionCard
            key={r.id}
            r={r}
            insight={dataset.insights.find((i) => i.id === r.insightId)}
          />
        ))}
      </div>
    </div>
  );
}
