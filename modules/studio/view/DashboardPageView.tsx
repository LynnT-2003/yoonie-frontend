"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, CircleHelp, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStudio } from "@/providers/studio-provider";
import type { Dataset, ExpenseCategory, Insight, MonthMetric } from "@/lib/types/studio";
import { change, money, monthLabel, pct } from "@/lib/domain/studio/format";
import { CATEGORY_LABEL, THEME_LABEL } from "@/lib/domain/studio/labels";
import { ComplaintBars, CompareBars, OccupancyChart, RatingChart, RevenueCostChart, type CompareRow } from "../components/charts";
import { BaselineBars, CostPerNightTable, RatingSpread, SeasonHeatmap, StayLengthBars, WeekdayBars } from "../components/eda";
import { rowsBreakdown } from "../components/quality";
import { AREA, InsightCard, KpiStrip, type KpiItem } from "../components/strategy";
import { PipelinePanel, UploadPanel } from "./dashboard/PipelinePanel";
import { useTour } from "../components/StudioTour";
import { cn } from "@/lib/utils";

export function DashboardPageView() {
  const { dataset, ready, run, cancel } = useStudio();
  const [uploading, setUploading] = React.useState(false);

  React.useEffect(() => {
    if (run.status === "running") setUploading(false);
    // finished: go straight to the dashboard
    if (run.status === "done") {
      cancel();
      window.scrollTo({ top: 0 });
    }
  }, [run.status, cancel]);

  if (!ready) return <div className="mx-auto h-96 w-full max-w-6xl animate-pulse px-6 py-10" />;
  if (run.status === "running" || run.status === "error") return <PipelinePanel />;
  if (!dataset || uploading) return <UploadPanel onCancel={dataset ? () => setUploading(false) : undefined} />;
  return <Eda dataset={dataset} onUpload={() => setUploading(true)} />;
}

/* ===================================================================== EDA */

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "demand", label: "Demand" },
  { id: "money", label: "Money" },
  { id: "guests", label: "Guests" },
];

type Good = 1 | -1 | 0; // which direction is good news for the hotel

function Eda({ dataset, onUpload }: { dataset: Dataset; onUpload: () => void }) {
  const cur = dataset.months.slice(-12);
  const prev = dataset.months.slice(-24, -12);
  const a = aggregate(cur);
  const b = prev.length ? aggregate(prev) : null;
  const insight = (area: Insight["area"]) => dataset.insights.find((i) => i.area === area);
  const active = useActiveSection();
  const tour = useTour();

  /** change vs the year before, coloured by whether it's good news */
  const d = (now: number | null, before: number | null | undefined, kind: "rel" | "pts" | "abs", good: Good): KpiItem["delta"] => {
    if (now === null || before === null || before === undefined || !Number.isFinite(now) || !Number.isFinite(before) || (kind === "rel" && !before)) return null;
    const v = kind === "rel" ? now / before - 1 : now - before;
    const flat = Math.abs(kind === "abs" ? v : v) < (kind === "abs" ? 0.01 : 0.005);
    const text =
      kind === "rel" ? `${change(v, 1)} YoY` : kind === "pts" ? `${v >= 0 ? "+" : "−"}${Math.abs(v * 100).toFixed(1)} pts YoY` : `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(2)} YoY`;
    return { text, tone: flat || good === 0 ? "neutral" : Math.sign(v) === good ? "good" : "bad" };
  };
  const spark = (f: (m: MonthMetric) => number | null) => cur.map(f);

  return (
    <div className="w-full pb-24">
      {/* ---------------------------------------------------------- header */}
      <div className="z-20 border-b border-border bg-background/90 backdrop-blur-md md:sticky md:top-14">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 pb-0 pt-6 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <h1 className="truncate text-xl font-semibold tracking-tight">{dataset.property.name}</h1>
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted-foreground">
                <span>{dataset.property.rooms} rooms</span>
                <Dot />
                <span>
                  {monthLabel(dataset.property.from)} – {monthLabel(dataset.property.to)}
                </span>
                <Dot />
                <DataBadge dataset={dataset} />
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="ghost" size="sm" onClick={tour.start} aria-label="Take the tour">
                <CircleHelp /> <span className="hidden sm:inline">Tour</span>
              </Button>
              <Button variant="outline" size="sm" onClick={onUpload}>
                <UploadCloud /> Upload data
              </Button>
              {dataset.recommendations.length ? (
                <Button asChild size="sm">
                  <Link href="/studio/strategy">
                    View {dataset.recommendations.length} actions <ArrowRight />
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
          <nav aria-label="Sections" data-tour="sections" className="-mb-px flex gap-5 overflow-x-auto">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={cn(
                  "shrink-0 border-b-2 pb-2.5 text-sm transition-colors",
                  active === s.id ? "border-primary font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {s.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="mx-auto mt-8 w-full max-w-6xl space-y-16 px-4 sm:px-6">
        {/* -------------------------------------------------------- overview */}
        <Section id="overview" title="Last 12 months" sub={`${dataset.kpiWindow.current}, compared with the 12 months before.`}>
          <div data-tour="kpis">
          <KpiStrip
            items={[
              { label: "Occupancy", value: pct(a.occupancy), delta: d(a.occupancy, b?.occupancy, "pts", 1), spark: spark((m) => m.occupancy) },
              { label: "ADR", value: a.adr ? money(a.adr) : "n/a", delta: d(a.adr, b?.adr, "rel", 1), spark: spark((m) => m.adr || null) },
              { label: "RevPAR", value: money(a.revpar), delta: d(a.revpar, b?.revpar, "rel", 1), spark: spark((m) => m.revpar) },
              { label: "Room revenue", value: money(a.revenue, { compact: true }), delta: d(a.revenue, b?.revenue, "rel", 1), spark: spark((m) => m.roomRevenue) },
              { label: "Operating margin", value: a.margin !== null ? pct(a.margin, 1) : "n/a", delta: d(a.margin, b?.margin, "pts", 1), spark: spark((m) => m.margin) },
              { label: "Guest rating", value: a.rating !== null ? a.rating.toFixed(2) : "n/a", delta: d(a.rating, b?.rating, "abs", 1), spark: spark((m) => m.avgRating) },
            ]}
          />
          </div>
          <AttentionPanel dataset={dataset} />
        </Section>

        {/* ---------------------------------------------------------- demand */}
        <Section id="demand" label="Demand" title={headline(insight("demand"), "Are rooms filling?")} sub="Occupancy against the usual level, by season, night of the week and length of stay.">
          <KpiStrip
            cols={4}
            items={[
              { label: "Occupancy", value: pct(a.occupancy), delta: d(a.occupancy, b?.occupancy, "pts", 1), spark: spark((m) => m.occupancy) },
              { label: "Room nights sold", value: a.sold.toLocaleString("en-US"), delta: d(a.sold, b?.sold, "rel", 1), spark: spark((m) => m.roomNightsSold) },
              { label: "Bookings", value: a.bookings.toLocaleString("en-US"), delta: d(a.bookings, b?.bookings, "rel", 1), spark: spark((m) => m.bookings) },
              {
                label: "Average stay",
                value: a.bookings ? `${(a.sold / a.bookings).toFixed(1)} nights` : "n/a",
                delta: b && b.bookings && a.bookings ? d(a.sold / a.bookings, b.sold / b.bookings, "abs", 1) : null,
                spark: spark((m) => (m.bookings ? m.roomNightsSold / m.bookings : null)),
              },
            ]}
          />
          <Card title="Each month vs its baseline" sub="Last 12 months. Baseline is the same month in earlier years.">
            <BaselineBars months={dataset.months} highlight={insight("demand")?.focusMonth} />
          </Card>
          <Card title="Season by season" sub="Occupancy % for every month on record.">
            <SeasonHeatmap months={dataset.months} highlight={insight("demand")?.focusMonth} />
          </Card>
          <Card title="Full history" sub="Monthly occupancy against the usual level for each month.">
            <OccupancyChart months={dataset.months} highlight={insight("demand")?.focusMonth} />
          </Card>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card title="By night of the week" sub="Last 12 months vs the 12 before.">
              <WeekdayBars cur={cur} prev={prev} />
            </Card>
            <Card title="Length of stay" sub="Share of bookings.">
              <StayLengthBars cur={cur} prev={prev} />
            </Card>
          </div>
          {insight("demand") ? <InsightCard insight={insight("demand")!} /> : null}
        </Section>

        {/* ----------------------------------------------------------- money */}
        <Section id="money" label="Money" title={headline(insight("cost"), "Is anything leaking?")} sub="Room revenue, where it comes from, and what it costs to run the hotel.">
          <KpiStrip
            cols={4}
            items={[
              { label: "Room revenue", value: money(a.revenue, { compact: true }), delta: d(a.revenue, b?.revenue, "rel", 1), spark: spark((m) => m.roomRevenue) },
              { label: "Operating costs", value: a.costs !== null ? money(a.costs, { compact: true }) : "n/a", delta: d(a.costs, b?.costs, "rel", -1), spark: spark((m) => m.totalExpenses) },
              {
                label: "Operating profit",
                value: a.costs !== null ? money(a.revenue - a.costs, { compact: true }) : "n/a",
                delta: a.costs !== null && b && b.costs !== null ? d(a.revenue - a.costs, b.revenue - b.costs, "rel", 1) : null,
                spark: spark((m) => m.operatingProfit),
              },
              { label: "Operating margin", value: a.margin !== null ? pct(a.margin, 1) : "n/a", delta: d(a.margin, b?.margin, "pts", 1), spark: spark((m) => m.margin) },
            ]}
          />
          <Card title="Room revenue vs operating costs" sub="The gap between the lines is operating profit.">
            <RevenueCostChart months={dataset.months} />
          </Card>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card title="Operating costs by type" sub="Last 12 months vs the 12 before.">
              <CompareBars caption="" format={(n) => money(n, { compact: true })} rows={costRows(cur, prev)} />
            </Card>
            <Card title="Room revenue by channel" sub="Share of room revenue.">
              <CompareBars caption="" format={(n) => pct(n)} rows={channelRows(cur, prev)} />
            </Card>
          </div>
          <Card title="Cost per occupied room night" sub="Takes occupancy out of the picture: is each night getting more expensive to run?">
            <CostPerNightTable cur={cur} prev={prev} />
          </Card>
          {insight("cost") ? <InsightCard insight={insight("cost")!} /> : null}
        </Section>

        {/* ---------------------------------------------------------- guests */}
        <Section id="guests" label="Guests" title={headline(insight("guest"), "Are guests happy?")} sub="Ratings, how they spread, and what reviews complain about.">
          <KpiStrip
            items={[
              { label: "Average rating", value: a.rating !== null ? `${a.rating.toFixed(2)} / 5` : "n/a", delta: d(a.rating, b?.rating, "abs", 1), spark: spark((m) => m.avgRating) },
              { label: "Reviews", value: a.reviews.toLocaleString("en-US"), delta: d(a.reviews, b?.reviews, "rel", 0), spark: spark((m) => m.reviewCount) },
              {
                label: "Complaints per review",
                value: a.reviews ? (a.complaintMentions / a.reviews).toFixed(2) : "n/a",
                delta: b && b.reviews && a.reviews ? d(a.complaintMentions / a.reviews, b.complaintMentions / b.reviews, "abs", -1) : null,
                spark: spark((m) => (m.reviewCount ? Object.values(m.complaints).reduce<number>((x, y) => x + (y ?? 0), 0) / m.reviewCount : null)),
              },
            ]}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <Card title="Rating over time">
              <RatingChart months={dataset.months} />
            </Card>
            <Card title="Rating spread" sub="Reviews by star rating, last 12 months vs the 12 before.">
              <RatingSpread cur={cur} prev={prev} />
            </Card>
          </div>
          <Card title="Complaint themes" sub="Reviews mentioning a problem.">
            <ComplaintBars months={dataset.months} labels={THEME_LABEL} />
          </Card>
          {insight("guest") ? <InsightCard insight={insight("guest")!} /> : null}
        </Section>
      </div>
    </div>
  );
}

const headline = (i: Insight | undefined, fallback: string) => (i ? `${i.title}.` : fallback);

function Dot() {
  return <span aria-hidden className="size-0.5 rounded-full bg-muted-foreground/60" />;
}

/** "97% of rows used · 12 need review", linking to the Data tab. */
function DataBadge({ dataset }: { dataset: Dataset }) {
  const { used } = rowsBreakdown(dataset.stats.rowsRead, dataset.anomalies);
  const needs = dataset.anomalies.filter((x) => x.resolution === "needs_owner").length;
  return (
    <Link href="/studio/data" className="inline-flex items-center gap-1.5 hover:text-foreground">
      <span className="size-1.5 rounded-full bg-[var(--chart-a)]" aria-hidden />
      {Math.round((used / Math.max(1, dataset.stats.rowsRead)) * 100)}% of {dataset.stats.rowsRead.toLocaleString("en-US")} rows used
      {needs ? <span className="text-warning">· {needs} need review</span> : null}
      <ChevronRight className="size-3.5" />
    </Link>
  );
}

/** The conversion moment: what needs attention, each with its action, and one clear button. */
function AttentionPanel({ dataset }: { dataset: Dataset }) {
  const recs = dataset.recommendations;
  if (!recs.length) return null;
  return (
    <div data-tour="attention" className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold">
            {recs.length} thing{recs.length === 1 ? "" : "s"} need{recs.length === 1 ? "s" : ""} your attention
          </h3>
          <p className="text-[13px] text-muted-foreground">Each comes with an action, a target, and a way to check it worked.</p>
        </div>
        <Button asChild size="sm">
          <Link href="/studio/strategy">
            Open strategy <ArrowRight />
          </Link>
        </Button>
      </div>
      <ul className="divide-y divide-border">
        {recs.map((r) => {
          const ins = dataset.insights.find((i) => i.id === r.insightId);
          return (
            <li key={r.id}>
              <Link href={`/studio/strategy#${r.id}`} className="group grid grid-cols-[72px_1fr_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/40 sm:grid-cols-[96px_1fr_auto]">
                <span className="text-xl font-semibold tabular-nums tracking-tight sm:text-2xl">{ins?.headline.value ?? `#${r.rank}`}</span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-medium", AREA[r.area].tone)}>{AREA[r.area].label}</span>
                    <span className="truncate text-sm font-medium">{ins?.title ?? r.title}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-[13px] text-muted-foreground">Try: {r.strip.action}</span>
                </span>
                <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Which section is on screen, for the tab underline. */
function useActiveSection() {
  const [active, setActive] = React.useState("overview");
  React.useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => Boolean(e));
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((x, y) => x.boundingClientRect.top - y.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-200px 0px -55% 0px" }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
  return active;
}

/* --------------------------------------------------------------- pieces */

function Section({ id, label, title, sub, children }: { id: string; label?: string; title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-48 space-y-4" aria-labelledby={`${id}-title`}>
      <div className="space-y-1">
        {label ? <p className="text-[13px] font-medium text-primary">{label}</p> : null}
        <h2 id={`${id}-title`} className="max-w-3xl text-2xl font-semibold tracking-tight">
          {title}
        </h2>
        {sub ? <p className="text-sm text-muted-foreground">{sub}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Card({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="mb-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        {sub ? <p className="text-[13px] text-muted-foreground">{sub}</p> : null}
      </div>
      {children}
    </div>
  );
}

function aggregate(ms: MonthMetric[]) {
  const sum = (f: (m: MonthMetric) => number) => ms.reduce((s, m) => s + f(m), 0);
  const avail = sum((m) => m.roomsAvailable);
  const sold = sum((m) => m.roomNightsSold);
  const revenue = sum((m) => m.roomRevenue);
  const paid = sum((m) => m.roomNightsSold - m.unpricedNights);
  const withCost = ms.filter((m) => m.totalExpenses !== null);
  const costs = withCost.length ? withCost.reduce((s, m) => s + (m.totalExpenses ?? 0), 0) : null;
  const costRev = withCost.reduce((s, m) => s + m.roomRevenue, 0);
  const rated = ms.filter((m) => m.avgRating !== null);
  const ratedN = rated.reduce((s, m) => s + m.reviewCount, 0);
  return {
    occupancy: avail ? sold / avail : 0,
    sold,
    bookings: sum((m) => m.bookings),
    revenue,
    adr: paid ? revenue / paid : null,
    revpar: avail ? revenue / avail : 0,
    costs,
    margin: costRev && costs !== null ? (costRev - costs) / costRev : null,
    reviews: sum((m) => m.reviewCount),
    rating: ratedN ? rated.reduce((s, m) => s + (m.avgRating ?? 0) * m.reviewCount, 0) / ratedN : null,
    complaintMentions: sum((m) => Object.values(m.complaints).reduce<number>((x, y) => x + (y ?? 0), 0)),
  };
}

function channelRows(cur: MonthMetric[], prev: MonthMetric[]): CompareRow[] {
  const share = (ms: MonthMetric[]) => {
    const t: Record<string, number> = {};
    for (const m of ms) for (const [k, v] of Object.entries(m.channelRevenue)) t[k] = (t[k] ?? 0) + v;
    const total = Object.values(t).reduce((s, v) => s + v, 0) || 1;
    return Object.fromEntries(Object.entries(t).map(([k, v]) => [k, v / total]));
  };
  const now = share(cur);
  const before = prev.length ? share(prev) : null;
  return Object.entries(now)
    .sort((x, y) => y[1] - x[1])
    .map(([label, v]) => ({ label, now: v, before: before ? (before[label] ?? 0) : null }));
}

function costRows(cur: MonthMetric[], prev: MonthMetric[]): CompareRow[] {
  const tally = (ms: MonthMetric[]) => {
    const t: Partial<Record<ExpenseCategory, number>> = {};
    for (const m of ms) for (const [k, v] of Object.entries(m.expenses)) t[k as ExpenseCategory] = (t[k as ExpenseCategory] ?? 0) + (v ?? 0);
    return t;
  };
  const now = tally(cur);
  const before = prev.length ? tally(prev) : null;
  return (Object.entries(now) as [ExpenseCategory, number][])
    .sort((x, y) => y[1] - x[1])
    .map(([k, v]) => ({ label: CATEGORY_LABEL[k], now: v, before: before ? (before[k] ?? 0) : null }));
}
