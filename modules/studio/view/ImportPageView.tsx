"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Download, Lightbulb, RotateCcw, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { YoonieMascot, type MascotMood } from "@/components/mascot/YoonieMascot";
import { useStudio } from "@/providers/studio-provider";
import { AnomalyFeed, Dropzone, FieldList, SeverityCounts, StageTracker } from "../components/pipeline";
import { cn } from "@/lib/utils";

const SAMPLES = [
  { href: "/demo/Sams-Garden-House-bookings-2024-2026.xlsx", label: "Bookings (.xlsx)" },
  { href: "/demo/Sams-Garden-House-expenses.csv", label: "Expenses (.csv)" },
  { href: "/demo/Sams-Garden-House-guest-reviews.xlsx", label: "Guest reviews (.xlsx)" },
];

export function ImportPageView() {
  const { run, start, cancel, dataset } = useStudio();
  const [files, setFiles] = React.useState<File[]>([]);
  const running = run.status === "running";
  const started = run.status !== "idle";

  const critical = run.anomalies.some((a) => a.severity === "critical");
  const mood: MascotMood =
    run.status === "done" ? "happy" : run.status === "error" ? "worried" : running ? (run.stages.clean.status === "running" && critical ? "checking" : "thinking") : "calm";
  const speech =
    run.status === "done"
      ? "Done! Here's what I'd do first."
      : run.status === "error"
        ? run.error
        : running
          ? run.stages.recommend.status === "running"
            ? "Turning findings into actions…"
            : run.stages.insights.status === "running"
              ? "Looking for what changed…"
              : run.stages.structure.status === "running"
                ? "Organising it month by month…"
                : "Reading your files. I'll flag anything that doesn't add up."
          : "Drop in your spreadsheets and I'll take it from there.";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-gold">Upload</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">Your hotel already has the data.</h1>
          <p className="text-base text-muted-foreground">
            Yoonie cleans it, organises it, finds what changed, and suggests what to do next, with the numbers to back each step.
          </p>
        </div>
        <YoonieMascot mood={mood} size="lg" message={speech} className="self-center sm:self-end" />
      </header>

      {!started ? (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section className="space-y-4">
            <Dropzone
              files={files}
              onFiles={(f) => setFiles((prev) => [...prev, ...f].slice(0, 10))}
              onRemove={(i) => setFiles((prev) => prev.filter((_, j) => j !== i))}
            />
            <Button size="lg" className="w-full sm:w-auto" disabled={!files.length} onClick={() => void start({ files })}>
              <Sparkles /> Analyse {files.length ? `${files.length} file${files.length > 1 ? "s" : ""}` : "files"}
            </Button>
          </section>

          <aside className="space-y-4 rounded-2xl border border-border bg-linen/50 p-5">
            <div className="space-y-1">
              <h2 className="text-base font-bold">No data handy? Try a sample hotel</h2>
              <p className="text-sm text-muted-foreground">
                <strong className="font-semibold text-foreground">Sam&apos;s Garden House</strong> is a made-up 20-room boutique hotel in Chiang Mai: 34 months of
                bookings, expenses and reviews, kept messy on purpose, the way an inherited spreadsheet usually is.
              </p>
            </div>
            <Button variant="secondary" className="w-full" onClick={() => void start({ demo: true })}>
              Run with sample data <ArrowRight />
            </Button>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Or download the files and drop them in yourself:</p>
              <ul className="flex flex-wrap gap-1.5">
                {SAMPLES.map((s) => (
                  <li key={s.href}>
                    <a href={s.href} download className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-xs hover:border-primary/50">
                      <Download className="size-3" /> {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-[11px] text-muted-foreground">Sample data is hypothetical. It isn&apos;t a real hotel or real guests.</p>
          </aside>
        </div>
      ) : (
        <>
          <StageTracker stages={run.stages} active={running} />

          {run.status === "error" ? (
            <div className="flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-danger-soft p-4 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between">
              <span>{run.error}</span>
              <Button variant="outline" size="sm" onClick={cancel}>
                <RotateCcw /> Start again
              </Button>
            </div>
          ) : null}

          {run.status === "done" ? (
            <div className="flex flex-col gap-3 rounded-2xl bg-primary p-5 text-primary-foreground sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-bold">Your strategy is ready</p>
                <p className="text-sm opacity-85">
                  {run.recommendations.length} recommended action{run.recommendations.length === 1 ? "" : "s"}, each with the evidence behind it and how to measure it.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground" onClick={cancel}>
                  Upload more
                </Button>
                <Button asChild className="bg-amber text-[#303a36] hover:bg-amber/90">
                  <Link href="/studio/dashboard">
                    See the strategy <ArrowRight />
                  </Link>
                </Button>
              </div>
            </div>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-bold">1 · Cleaning: what doesn&apos;t add up</h2>
                <SeverityCounts anomalies={run.anomalies} />
              </div>
              {run.logs.length ? (
                <div className="rounded-xl bg-muted/70 px-3 py-2 font-mono text-[11px] leading-relaxed text-muted-foreground">
                  {run.logs.slice(-4).map((l, i) => (
                    <p key={i} className="truncate">
                      {l}
                    </p>
                  ))}
                </div>
              ) : null}
              <div className="max-h-[560px] overflow-y-auto pr-1">
                <AnomalyFeed anomalies={run.anomalies} />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Yoonie never fills in or overwrites a value it isn&apos;t sure about. Doubtful amounts stay out of the totals until you confirm them.
              </p>
            </section>

            <section className="space-y-6">
              <div className="space-y-3">
                <h2 className="text-base font-bold">2 · Structuring: what matters</h2>
                {run.fields.length ? (
                  <FieldList fields={run.fields} />
                ) : (
                  <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">Waiting for cleaning to finish…</p>
                )}
              </div>

              {run.insights.length ? (
                <div className="space-y-3">
                  <h2 className="text-base font-bold">3 · Insights: what changed</h2>
                  <ul className="space-y-2">
                    {run.insights.map((i) => (
                      <li key={i.id} className="flex gap-3 rounded-xl border border-border bg-surface px-3 py-2.5 animate-in fade-in slide-in-from-bottom-1 duration-300">
                        <Lightbulb className="mt-0.5 size-4 shrink-0 text-gold" />
                        <div>
                          <p className="text-sm font-semibold">{i.title}</p>
                          <p className="text-[13px] text-muted-foreground">{i.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {run.recommendations.length ? (
                <div className="space-y-3">
                  <h2 className="text-base font-bold">4 · Recommendations: what to do next</h2>
                  <ol className="space-y-2">
                    {run.recommendations.map((r) => (
                      <li key={r.id} className="flex gap-3 rounded-xl border border-primary/25 bg-secondary/40 px-3 py-2.5 animate-in fade-in slide-in-from-bottom-1 duration-300">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{r.rank}</span>
                        <div>
                          <p className="text-sm font-semibold">{r.title}</p>
                          <p className="flex items-center gap-1 text-[13px] text-muted-foreground">
                            <Target className="size-3.5 shrink-0" /> {r.effect.target}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </section>
          </div>

          {running ? (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={cancel}>
                Stop
              </Button>
            </div>
          ) : null}
        </>
      )}

      {!started && dataset ? (
        <p className={cn("text-sm text-muted-foreground")}>
          Last analysis: <strong className="font-semibold text-foreground">{dataset.property.name}</strong>.{" "}
          <Link href="/studio/dashboard" className="font-medium text-primary underline-offset-2 hover:underline">
            Open its strategy
          </Link>
        </p>
      ) : null}
    </div>
  );
}
