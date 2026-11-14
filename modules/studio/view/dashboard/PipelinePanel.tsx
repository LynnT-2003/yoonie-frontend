"use client";

import * as React from "react";
import { ArrowRight, Check, Download, Loader2, RotateCcw, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { YoonieMascot } from "@/components/mascot/YoonieMascot";
import { useStudio } from "@/providers/studio-provider";
import { STAGES, type StageId } from "@/lib/types/studio";
import { Dropzone } from "../../components/pipeline";
import { cn } from "@/lib/utils";

const SAMPLES = [
  { href: "/demo/Sams-Garden-House-bookings-2024-2026.xlsx", label: "Bookings (.xlsx)" },
  { href: "/demo/Sams-Garden-House-expenses.csv", label: "Expenses (.csv)" },
  { href: "/demo/Sams-Garden-House-guest-reviews.xlsx", label: "Guest reviews (.xlsx)" },
];

/* ================================================================ upload */

export function UploadPanel({ onCancel }: { onCancel?: () => void }) {
  const { start } = useStudio();
  const [files, setFiles] = React.useState<File[]>([]);
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
      <header className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
        <div className="space-y-3">
          <p className="text-[13px] font-medium text-primary">Dashboard</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">Your hotel already has the data.</h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Drop in the spreadsheets you already keep. Yoonie cleans them, structures them, and shows you what&apos;s going on, then turns it into
            actions on the Strategy tab.
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/sam/sam-overwhelmed.png" alt="Sam, a hotel owner, holding a tall stack of papers" className="mx-auto hidden w-48 md:block lg:w-56" />
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="space-y-4">
          <Dropzone
            files={files}
            onFiles={(f) => setFiles((prev) => [...prev, ...f].slice(0, 10))}
            onRemove={(i) => setFiles((prev) => prev.filter((_, j) => j !== i))}
          />
          <div className="flex flex-wrap gap-2">
            <Button size="lg" disabled={!files.length} onClick={() => void start({ files })}>
              <Sparkles /> Analyse {files.length ? `${files.length} file${files.length > 1 ? "s" : ""}` : "files"}
            </Button>
            {onCancel ? (
              <Button size="lg" variant="ghost" onClick={onCancel}>
                <X /> Back to dashboard
              </Button>
            ) : null}
          </div>
        </section>

        <aside className="space-y-4 rounded-xl border border-border bg-linen/50 p-5">
          <div className="space-y-1">
            <h2 className="text-base font-bold">No data handy? Try Sam&apos;s hotel</h2>
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
    </div>
  );
}

/* ============================================================== pipeline */

/** A quiet progress card while the files are analysed. The dashboard opens when it's done. */
export function PipelinePanel() {
  const { run, cancel } = useStudio();
  const order: StageId[] = ["clean", "structure", "insights", "recommend"];
  const done = order.filter((k) => run.stages[k].status === "done").length;
  const progress = Math.min(1, (done + (run.stages.structure.status === "running" ? (run.stages.structure.pct ?? 0) : 0)) / order.length);

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-4">
          <YoonieMascot mood={run.status === "error" ? "worried" : "thinking"} size="sm" />
          <div>
            <h1 className="text-lg font-bold">{run.status === "error" ? "Something went wrong" : "Analysing your files"}</h1>
            <p className="text-sm text-muted-foreground">
              {run.status === "error" ? run.error : "This usually takes a few seconds."}
            </p>
          </div>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${progress * 100}%` }} />
        </div>

        <ol className="space-y-3">
          {STAGES.map((st) => {
            const state = run.stages[st.id];
            return (
              <li key={st.id} className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                    state.status === "done" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  {state.status === "done" ? <Check className="size-3" /> : state.status === "running" ? <Loader2 className="size-3 animate-spin" /> : null}
                </span>
                <div className="min-w-0">
                  <p className={cn("text-sm font-semibold", state.status === "waiting" && "text-muted-foreground")}>{st.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{state.summary ?? st.purpose}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={cancel}>
            {run.status === "error" ? (
              <>
                <RotateCcw /> Try again
              </>
            ) : (
              "Cancel"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
