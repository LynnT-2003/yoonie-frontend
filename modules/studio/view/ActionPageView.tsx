"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Calculator, Check, CircleDashed, FlaskConical, Search, Target, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStudio } from "@/providers/studio-provider";
import { FormulaStrip, InsightCard } from "../components/strategy";
import { cn } from "@/lib/utils";

export function ActionPageView({ id }: { id: string }) {
  const { dataset, ready, recStatus, setRecStatus } = useStudio();
  if (!ready) return <div className="mx-auto h-96 w-full max-w-4xl animate-pulse px-6 py-10" />;
  const r = dataset?.recommendations.find((x) => x.id === id);
  if (!dataset || !r)
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-muted-foreground">This action isn&apos;t in your latest analysis.</p>
        <Button asChild variant="link">
          <Link href="/studio/dashboard">Back to your strategy</Link>
        </Button>
      </div>
    );
  const insight = dataset.insights.find((i) => i.id === r.insightId);
  const status = recStatus[r.id] ?? "suggested";

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-6 sm:px-6 sm:py-10">
      <div className="space-y-4">
        <Link href="/studio/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Your strategy
        </Link>
        <div className="flex items-start gap-3">
          <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground">{r.rank}</span>
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-primary sm:text-3xl">{r.title}</h1>
            <FormulaStrip />
          </div>
        </div>
      </div>

      <ol className="relative space-y-4 before:absolute before:bottom-6 before:left-[17px] before:top-6 before:w-px before:bg-border">
        <Block icon={Search} label="Cause" title="What your data shows">
          <p>{r.cause.observation}</p>
          <dl className="mt-3 grid gap-x-6 gap-y-1 text-[13px] sm:grid-cols-2">
            {r.cause.evidence.map((e) => (
              <div key={e.label} className="flex justify-between gap-3 border-b border-border/60 py-1">
                <dt className="text-muted-foreground">{e.label}</dt>
                <dd className="font-semibold tabular-nums">{e.value}</dd>
              </div>
            ))}
          </dl>
        </Block>

        <Block icon={Wrench} label="Action" title="What to try">
          <p>{r.action.summary}</p>
          <ul className="mt-3 space-y-1.5">
            {r.action.steps.map((s) => (
              <li key={s} className="flex gap-2 text-[13px]">
                <CircleDashed className="mt-0.5 size-3.5 shrink-0 text-primary" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Block>

        <Block icon={Target} label="Effect" title="The target">
          <p className="text-base font-semibold">{r.effect.target}</p>
          <p className="mt-1 text-[13px] text-muted-foreground">Measured as: {r.effect.metric}. This is a target to test, not a forecast.</p>
        </Block>

        <Block icon={Calculator} label="Numbers" title="The arithmetic">
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-[13px]">
              <tbody>
                {r.numbers.map((n) => (
                  <tr key={n.label} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 align-top">
                      <p className="font-medium">{n.label}</p>
                      <p className="text-[11px] text-muted-foreground">{n.basis}</p>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right align-top font-bold tabular-nums">{n.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Block>

        <Block icon={FlaskConical} label="Evidence" title="Why we believe the cause">
          {insight ? <InsightCard insight={insight} /> : <p className="text-muted-foreground">See the cause above.</p>}
        </Block>
      </ol>

      <section className="space-y-3 rounded-2xl border border-primary/25 bg-secondary/30 p-5">
        <div>
          <h2 className="text-lg font-bold">How you&apos;ll know it worked</h2>
          <p className="text-sm text-muted-foreground">
            Run it, then upload the new months. Yoonie compares them with these baselines from your current data.
          </p>
        </div>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="rounded-xl bg-surface px-3 py-2">
            <dt className="text-[11px] font-medium text-muted-foreground">Measure over</dt>
            <dd>{r.measurement.window}</dd>
          </div>
          <div className="rounded-xl bg-surface px-3 py-2">
            <dt className="text-[11px] font-medium text-muted-foreground">Compare against</dt>
            <dd>{r.measurement.compareAgainst}</dd>
          </div>
        </dl>
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[420px] text-[13px]">
            <thead>
              <tr className="border-b border-border text-left text-[11px] text-muted-foreground">
                <th className="px-3 py-2 font-medium">Metric</th>
                <th className="px-3 py-2 text-right font-medium">Baseline (your data)</th>
                <th className="px-3 py-2 text-right font-medium">After the test</th>
              </tr>
            </thead>
            <tbody>
              {r.measurement.metrics.map((m) => (
                <tr key={m.label} className="border-b border-border last:border-0">
                  <td className="px-3 py-2">{m.label}</td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums">{m.baseline}</td>
                  <td className="px-3 py-2 text-right text-muted-foreground">waiting for data</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold">Assumptions to check</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {r.assumptions.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">You decide. Yoonie only suggests.</p>
        <div className="flex gap-2">
          <Button variant={status === "dismissed" ? "secondary" : "ghost"} onClick={() => setRecStatus(r.id, status === "dismissed" ? "suggested" : "dismissed")}>
            {status === "dismissed" ? "Dismissed: undo" : "Not now"}
          </Button>
          <Button
            onClick={() => setRecStatus(r.id, status === "trying" ? "suggested" : "trying")}
            className={cn(status === "trying" && "bg-success hover:bg-success/90")}
          >
            {status === "trying" ? (
              <>
                <Check /> Trying it
              </>
            ) : (
              "I'll try this"
            )}
          </Button>
        </div>
      </section>
    </div>
  );
}

function Block({
  icon: Icon,
  label,
  title,
  children,
}: {
  icon: typeof Search;
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="relative flex gap-4">
      <span className="z-10 flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1 rounded-2xl border border-border bg-surface p-4 text-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gold">{label}</p>
        <h2 className="mb-2 font-bold">{title}</h2>
        {children}
      </div>
    </li>
  );
}
