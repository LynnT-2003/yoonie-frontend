import type { ExpenseCategory, Insight, MonthMetric, ReviewTheme } from "@/lib/types/studio";
import type { ExpenseRec } from "./clean";
import { CATEGORY_LABEL } from "./clean";
import { THEME_LABEL } from "./structure";
import { monthKey } from "./parse";
import { change, money, monthLabel, monthName, pct } from "../format";

/**
 * Stage 3 — Insights: what is happening and why it matters.
 *
 * Each detector reports what the data shows, labelled as an anomaly, a trend or a correlation,
 * with the evidence and a caveat about what it does not prove. The raw numbers are kept as
 * "signals" so Stage 4 can do its arithmetic from the same figures.
 */

export interface DemandGapSignal {
  month: MonthMetric;
  baseline: number;
  baselineYears: string[];
  baselineWeekday: number;
  baselineWeekend: number;
  relative: number;
}

export interface CostSignal {
  window: string;
  priorWindow: string;
  revenueGrowth: number;
  expenseGrowth: number;
  driver: ExpenseCategory;
  driverGrowth: number;
  driverNow: number;
  driverBefore: number;
  perNightNow: number;
  perNightBefore: number;
  nightsNow: number;
  profitGrowth: number | null;
  flagged: { amount: number; typical: number; month: string; label: string } | null;
  driverGrowthExFlagged: number | null;
}

export interface GuestSignal {
  themes: ReviewTheme[];
  now: number;
  before: number;
  reviewsNow: number;
  ratingNow: number | null;
  ratingBefore: number | null;
  correlation: number | null;
  window: string;
  priorWindow: string;
}

export interface Signals {
  demand?: DemandGapSignal;
  cost?: CostSignal;
  guest?: GuestSignal;
  rooms: number;
  months: MonthMetric[];
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const span = (ms: MonthMetric[]) => `${monthLabel(ms[0].month)} – ${monthLabel(ms[ms.length - 1].month)}`;

function pearson(xs: number[], ys: number[]) {
  const n = xs.length;
  if (n < 6) return null;
  const mx = sum(xs) / n;
  const my = sum(ys) / n;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    dx += (xs[i] - mx) ** 2;
    dy += (ys[i] - my) ** 2;
  }
  return dx && dy ? num / Math.sqrt(dx * dy) : null;
}

/* ---------------------------------------------------- demand vs seasonality */

function demandGap(months: MonthMetric[]): { insight: Insight; signal: DemandGapSignal } | null {
  const recent = months.slice(-12);
  let worst: DemandGapSignal | null = null;
  for (const m of recent) {
    const same = months.filter((p) => p.month.slice(5) === m.month.slice(5) && p.month < m.month);
    if (!same.length) continue;
    const baseline = sum(same.map((p) => p.occupancy)) / same.length;
    const relative = m.occupancy / baseline - 1;
    if (relative <= -0.1 && (!worst || relative < worst.relative))
      worst = {
        month: m,
        baseline,
        baselineYears: same.map((p) => p.month.slice(0, 4)),
        baselineWeekday: sum(same.map((p) => p.weekdayOccupancy)) / same.length,
        baselineWeekend: sum(same.map((p) => p.weekendOccupancy)) / same.length,
        relative,
      };
  }
  if (!worst) return null;
  const m = worst.month;
  const name = monthName(m.month);
  const years = worst.baselineYears.join(" & ");
  const lostNights = Math.round((worst.baseline - m.occupancy) * m.roomsAvailable);
  const wkdDrop = m.weekdayOccupancy / worst.baselineWeekday - 1;
  const wkndDrop = m.weekendOccupancy / worst.baselineWeekend - 1;
  const weekdayLed = wkdDrop < wkndDrop - 0.05;

  const neighbours = months
    .filter((p) => p.month !== m.month && Math.abs(months.indexOf(p) - months.indexOf(m)) === 1)
    .map((p) => {
      const same = months.filter((q) => q.month.slice(5) === p.month.slice(5) && q.month < p.month);
      if (!same.length) return null;
      const base = sum(same.map((q) => q.occupancy)) / same.length;
      return `${monthName(p.month).slice(0, 3)} ${change(p.occupancy / base - 1)}`;
    })
    .filter(Boolean);

  return {
    signal: worst,
    insight: {
      id: "demand-gap",
      kind: "anomaly",
      focusMonth: m.month,
      headline: { value: change(worst.relative), label: `${name} occupancy vs usual` },
      area: "demand",
      title: `${name} occupancy was ${Math.abs(Math.round(worst.relative * 100))}% below its usual level`,
      detail: `${pct(m.occupancy)} of room nights sold in ${monthLabel(m.month, true)}, against ${pct(worst.baseline)} on average for ${name} in ${years}. That's about ${lostNights} empty room nights${weekdayLed ? ", mostly on weekdays" : ""}.`,
      evidence: [
        { label: `${monthLabel(m.month)} occupancy`, value: pct(m.occupancy) },
        { label: `${name} baseline (${years})`, value: pct(worst.baseline) },
        { label: "Relative change", value: `${change(worst.relative)}  (${pct(m.occupancy)} ÷ ${pct(worst.baseline)} − 1)` },
        { label: "Weekday nights (Sun–Thu)", value: `${pct(m.weekdayOccupancy)} vs ${pct(worst.baselineWeekday)} usual` },
        { label: "Weekend nights (Fri–Sat)", value: `${pct(m.weekendOccupancy)} vs ${pct(worst.baselineWeekend)} usual` },
        ...(neighbours.length ? [{ label: "Neighbouring months vs their baseline", value: neighbours.join(" · ") }] : []),
      ],
      confidence: worst.baselineYears.length >= 2 ? "high" : "medium",
      caveat: `This shows that ${name} fell, not why. Causes outside your data (local events, competitor prices, flights, weather) could explain it.`,
    },
  };
}

/* ------------------------------------------------- costs outgrowing revenue */

function costSqueeze(months: MonthMetric[], expenses: ExpenseRec[]): { insight: Insight; signal: CostSignal } | null {
  const withCost = months.filter((m) => m.totalExpenses !== null);
  if (withCost.length < 18) return null;
  const now = withCost.slice(-6);
  const keys = new Set(now.map((m) => `${Number(m.month.slice(0, 4)) - 1}${m.month.slice(4)}`));
  const before = withCost.filter((m) => keys.has(m.month));
  if (before.length < 6) return null;

  const rev = (ms: MonthMetric[]) => sum(ms.map((m) => m.roomRevenue));
  const exp = (ms: MonthMetric[]) => sum(ms.map((m) => m.totalExpenses ?? 0));
  const cat = (ms: MonthMetric[], c: ExpenseCategory) => sum(ms.map((m) => m.expenses[c] ?? 0));
  const revenueGrowth = rev(now) / rev(before) - 1;
  const expenseGrowth = exp(now) / exp(before) - 1;

  // A cost line that grows ≥15 points faster than revenue and is big enough to matter (≥3% of
  // costs). Ranked by the money above "growing in step with revenue".
  const totalBefore = exp(before);
  const excess = (c: ExpenseCategory) => cat(now, c) - cat(before, c) * (1 + revenueGrowth);
  const driver = (Object.keys(CATEGORY_LABEL) as ExpenseCategory[])
    .filter((c) => cat(before, c) >= totalBefore * 0.03 && cat(now, c) / cat(before, c) - 1 - revenueGrowth >= 0.15)
    .sort((a, b) => excess(b) - excess(a))[0];
  if (!driver) return null;
  const driverNow = cat(now, driver);
  const driverBefore = cat(before, driver);
  const nightsNow = sum(now.map((m) => m.roomNightsSold));
  const nightsBefore = sum(before.map((m) => m.roomNightsSold));
  const profitNow = sum(now.map((m) => m.operatingProfit ?? 0));
  const profitBefore = sum(before.map((m) => m.operatingProfit ?? 0));

  // did Cleaning flag one of these bills? show the trend with and without it
  const nowKeys = new Set(now.map((m) => m.month));
  const flaggedRec = expenses.find((e) => e.flagged && e.category === driver && nowKeys.has(monthKey(e.date)));
  let flagged: CostSignal["flagged"] = null;
  let driverGrowthExFlagged: number | null = null;
  if (flaggedRec?.amount) {
    const same = expenses
      .filter((e) => e.category === driver && e.description === flaggedRec.description && !e.flagged && e.amount)
      .map((e) => e.amount!);
    const typical = same.length ? same.sort((a, b) => a - b)[Math.floor(same.length / 2)] : 0;
    flagged = { amount: flaggedRec.amount, typical, month: monthKey(flaggedRec.date), label: flaggedRec.label };
    driverGrowthExFlagged = (driverNow - flaggedRec.amount + typical) / driverBefore - 1;
  }

  const signal: CostSignal = {
    window: span(now),
    priorWindow: span(before),
    revenueGrowth,
    expenseGrowth,
    driver,
    driverGrowth: driverNow / driverBefore - 1,
    driverNow,
    driverBefore,
    perNightNow: driverNow / nightsNow,
    perNightBefore: driverBefore / nightsBefore,
    nightsNow,
    profitGrowth: profitBefore > 0 ? profitNow / profitBefore - 1 : null,
    flagged,
    driverGrowthExFlagged,
  };
  const label = CATEGORY_LABEL[driver];
  return {
    signal,
    insight: {
      id: "cost-squeeze",
      kind: "trend",
      area: "cost",
      headline: { value: change(signal.driverGrowth), label: `${label} vs last year` },
      title: `${label} spending is rising faster than revenue`,
      detail: `${signal.window}: ${label.toLowerCase()} ${change(signal.driverGrowth)} on the same months last year, while room revenue moved ${change(revenueGrowth)}. Total operating costs ${change(expenseGrowth)}.`,
      evidence: [
        { label: "Room revenue vs last year", value: change(revenueGrowth) },
        { label: "Operating costs vs last year", value: change(expenseGrowth) },
        { label: `${label} vs last year`, value: `${change(signal.driverGrowth)}  (${money(driverBefore, { compact: true })} → ${money(driverNow, { compact: true })})` },
        { label: `${label} per occupied room night`, value: `${money(signal.perNightNow)} vs ${money(signal.perNightBefore)}` },
        ...(signal.profitGrowth !== null ? [{ label: "Operating profit vs last year", value: change(signal.profitGrowth) }] : []),
        ...(flagged && driverGrowthExFlagged !== null
          ? [{ label: `Without the flagged ${monthLabel(flagged.month)} bill`, value: `${label} still ${change(driverGrowthExFlagged)}` }]
          : []),
      ],
      confidence: flagged ? "medium" : "high",
      caveat: `Higher tariffs or a hotter season could explain part of the ${label.toLowerCase()} rise. Your expense log doesn't show meter readings.`,
    },
  };
}

/* ------------------------------------------------- recurring guest complaints */

function guestComplaints(months: MonthMetric[]): { insight: Insight; signal: GuestSignal } | null {
  const reviewed = months.filter((m) => m.reviewCount > 0);
  if (reviewed.length < 9) return null;
  const now = reviewed.slice(-6);
  const before = reviewed.slice(-12, -6);
  const count = (ms: MonthMetric[], t: ReviewTheme) => sum(ms.map((m) => m.complaints[t] ?? 0));
  const themes = (Object.keys(THEME_LABEL) as ReviewTheme[])
    .map((t) => ({ t, now: count(now, t), before: count(before, t) }))
    .filter((x) => x.now >= 3)
    .sort((a, b) => b.now - b.before - (a.now - a.before));
  if (!themes.length) return null;
  // group the leading theme with any theme that rose alongside it (e.g. bathroom + cleanliness)
  const top = themes.filter((x, i) => i === 0 || (x.now >= 3 && x.now >= x.before * 1.5)).slice(0, 2);
  const nowN = sum(top.map((x) => x.now));
  const beforeN = sum(top.map((x) => x.before));
  if (nowN < 4 || nowN < beforeN * 1.5) return null;

  const avg = (ms: MonthMetric[]) => {
    const n = sum(ms.map((m) => (m.avgRating !== null ? m.reviewCount : 0)));
    return n ? sum(ms.map((m) => (m.avgRating ?? 0) * (m.avgRating !== null ? m.reviewCount : 0))) / n : null;
  };
  const series = reviewed.filter((m) => m.avgRating !== null);
  const correlation = pearson(
    series.map((m) => sum(top.map((x) => m.complaints[x.t] ?? 0)) / m.reviewCount),
    series.map((m) => m.avgRating!)
  );
  const reviewsNow = sum(now.map((m) => m.reviewCount));
  const signal: GuestSignal = {
    themes: top.map((x) => x.t),
    now: nowN,
    before: beforeN,
    reviewsNow,
    ratingNow: avg(now),
    ratingBefore: avg(before),
    correlation,
    window: span(now),
    priorWindow: span(before),
  };
  const names = top.map((x) => THEME_LABEL[x.t].toLowerCase()).join(" & ");
  const rating =
    signal.ratingNow !== null && signal.ratingBefore !== null
      ? `, while the average rating went from ${signal.ratingBefore.toFixed(1)} to ${signal.ratingNow.toFixed(1)}`
      : "";
  return {
    signal,
    insight: {
      id: "guest-complaints",
      kind: "correlation",
      area: "guest",
      headline: { value: `${nowN} vs ${beforeN}`, label: "complaints, last 6 months vs the 6 before" },
      title: `${names[0].toUpperCase()}${names.slice(1)} complaints are rising`,
      detail: `${nowN} reviews mentioned ${names} problems in ${signal.window}, up from ${beforeN} in the six months before${rating}.`,
      evidence: [
        ...top.map((x) => ({ label: `${THEME_LABEL[x.t]} complaints`, value: `${x.now} vs ${x.before} (previous 6 months)` })),
        { label: "Share of recent reviews", value: pct(nowN / reviewsNow) },
        ...(signal.ratingNow !== null && signal.ratingBefore !== null
          ? [{ label: "Average rating (out of 5)", value: `${signal.ratingBefore.toFixed(2)} → ${signal.ratingNow.toFixed(2)}` }]
          : []),
        ...(correlation !== null
          ? [{ label: "Months with more of these complaints rate lower", value: `correlation r = ${correlation.toFixed(2)}` }]
          : []),
      ],
      confidence: nowN >= 8 ? "high" : "medium",
      caveat: "A correlation, not proof. The rating fell at the same time as the complaints rose, but other things may also have pulled it down.",
    },
  };
}

export function findInsights(months: MonthMetric[], expenses: ExpenseRec[], rooms: number) {
  const signals: Signals = { rooms, months };
  const insights: Insight[] = [];
  const d = demandGap(months);
  if (d) {
    insights.push(d.insight);
    signals.demand = d.signal;
  }
  const c = costSqueeze(months, expenses);
  if (c) {
    insights.push(c.insight);
    signals.cost = c.signal;
  }
  const g = guestComplaints(months);
  if (g) {
    insights.push(g.insight);
    signals.guest = g.signal;
  }
  return { insights, signals };
}
