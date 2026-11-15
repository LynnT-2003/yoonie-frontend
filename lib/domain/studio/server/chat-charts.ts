import "server-only";
import { z } from "zod";
import type { Dataset, MonthMetric } from "@/lib/types/studio";
import { chatChartSchema, type ChatChart, type PromptId } from "../chat-charts";
import { monthLabel, monthName, monthShort } from "../format";

/**
 * Builds chat charts from the owner's dataset. Every value here is read or computed from
 * `ds.months` / `ds.recommendations`; the model only ever picks a chart kind and a range.
 */

const r = (n: number, d = 4) => Math.round(n * 10 ** d) / 10 ** d;
const lastN = (ds: Dataset, n: number) => ds.months.slice(-n);
const shortLabel = (key: string) => `${monthShort(key)} ${key.slice(2, 4)}`;
const range = (ms: MonthMetric[]) => {
  if (!ms.length) return "";
  const a = ms[0].month;
  const b = ms[ms.length - 1].month;
  return `${a.slice(0, 4) === b.slice(0, 4) ? monthShort(a) : monthLabel(a)} – ${monthLabel(b)}`;
};

const THEME_LABEL: Record<string, string> = {
  cleanliness: "Cleanliness",
  bathroom: "Bathroom",
  noise: "Noise",
  staff: "Staff",
  breakfast: "Breakfast",
  wifi: "Wi-Fi",
  aircon: "Air-con",
  location: "Location",
};
const EXPENSE_LABEL: Record<string, string> = {
  staff: "Staff",
  utilities: "Utilities",
  housekeeping: "Housekeeping",
  maintenance: "Maintenance",
  commissions: "Commissions",
  food: "Food",
  marketing: "Marketing",
  other: "Other",
};

export const METRICS = {
  occupancy: { title: "Occupancy", format: "percent", get: (m: MonthMetric) => m.occupancy },
  adr: { title: "Average room rate", format: "currency", get: (m: MonthMetric) => m.adr },
  revpar: { title: "Revenue per available room", format: "currency", get: (m: MonthMetric) => m.revpar },
  roomRevenue: { title: "Room revenue", format: "currency", get: (m: MonthMetric) => m.roomRevenue },
  operatingCosts: { title: "Operating costs", format: "currency", get: (m: MonthMetric) => m.totalExpenses },
  operatingProfit: { title: "Operating profit", format: "currency", get: (m: MonthMetric) => m.operatingProfit },
  margin: { title: "Operating margin", format: "percent", get: (m: MonthMetric) => m.margin },
  rating: { title: "Average guest rating (out of 5)", format: "decimal", get: (m: MonthMetric) => m.avgRating },
  utilitiesPerNight: {
    title: "Utilities per occupied room night",
    format: "currency",
    get: (m: MonthMetric) => (m.expenses.utilities != null && m.roomNightsSold ? m.expenses.utilities / m.roomNightsSold : null),
  },
  complaints: {
    title: "Reviews with complaints, mentions per month",
    format: "count",
    get: (m: MonthMetric) => Object.values(m.complaints).reduce<number>((s, v) => s + (v ?? 0), 0),
  },
} as const satisfies Record<string, { title: string; format: ChatChart["format"]; get: (m: MonthMetric) => number | null }>;

export type MetricKey = keyof typeof METRICS;

function trend(ms: MonthMetric[], key: MetricKey, highlight?: string): ChatChart | null {
  const m = METRICS[key];
  const points = ms.map((x) => {
    const v = m.get(x);
    return { label: shortLabel(x.month), value: v == null ? null : r(v) };
  });
  if (points.filter((p) => p.value != null).length < 2) return null;
  return {
    kind: "line",
    title: `${m.title}, ${range(ms)}`,
    format: m.format,
    points,
    highlight: highlight && ms.some((x) => x.month === highlight) ? shortLabel(highlight) : undefined,
  };
}

function sumBy(ms: MonthMetric[], pick: (m: MonthMetric) => Partial<Record<string, number>>) {
  const out: Record<string, number> = {};
  for (const m of ms) for (const [k, v] of Object.entries(pick(m))) out[k] = (out[k] ?? 0) + (v ?? 0);
  return out;
}

/** two windows side by side, largest first */
function compareBars(
  title: string,
  format: ChatChart["format"],
  now: MonthMetric[],
  before: MonthMetric[] | null,
  pick: (m: MonthMetric) => Partial<Record<string, number>>,
  labels: Record<string, string>,
  limit = 8
): ChatChart | null {
  const a = sumBy(now, pick);
  const b = before ? sumBy(before, pick) : {};
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])]
    .filter((k) => (a[k] ?? 0) > 0 || (b[k] ?? 0) > 0)
    .sort((x, y) => (a[y] ?? 0) - (a[x] ?? 0) || (b[y] ?? 0) - (b[x] ?? 0))
    .slice(0, limit);
  if (!keys.length) return null;
  return {
    kind: "bars",
    title,
    format,
    series: before?.length ? [range(now), range(before)] : [range(now)],
    rows: keys.map((k) => ({
      label: labels[k] ?? k,
      value: Math.round(a[k] ?? 0),
      ...(before?.length ? { prev: Math.round(b[k] ?? 0) } : {}),
    })),
  };
}

/** a recommendation's own "now vs usual" comparison, exactly as the Strategy tab shows it */
function seenPair(rec: Dataset["recommendations"][number] | undefined): ChatChart | null {
  if (!rec) return null;
  const s = rec.seen;
  return {
    kind: "bars",
    title: s.label,
    format: s.format,
    series: ["Value"],
    rows: [
      { label: s.now.label, value: r(s.now.value), highlight: true },
      { label: s.usual.label, value: r(s.usual.value) },
    ],
  };
}

/** the same calendar month in every year of data, e.g. each July */
function sameMonthByYear(ds: Dataset, month: string): ChatChart | null {
  const mm = month.slice(5);
  const rows = ds.months
    .filter((m) => m.month.slice(5) === mm)
    .map((m) => ({ label: m.month.slice(0, 4), value: r(m.occupancy), highlight: m.month === month }));
  if (rows.length < 2) return null;
  return { kind: "bars", title: `${monthName(month)} occupancy, year by year`, format: "percent", series: ["Occupancy"], rows };
}

/* ---------------------------------------------------------- tool charts */

export const chartRequest = z.object({
  kind: z
    .enum(["monthly_trend", "complaint_themes", "expense_breakdown", "channel_mix", "occupancy_by_night", "same_month_by_year"])
    .describe(
      "monthly_trend: one metric month by month. complaint_themes / expense_breakdown: by category, the range vs the same-length range before it. channel_mix: room revenue by channel. occupancy_by_night: Sun–Sat. same_month_by_year: one calendar month's occupancy across years (pass `to` as that month)."
    ),
  metric: z.enum(Object.keys(METRICS) as [MetricKey, ...MetricKey[]]).optional().describe("for monthly_trend"),
  from: z.string().regex(/^\d{4}-\d{2}$/).optional().describe("YYYY-MM"),
  to: z.string().regex(/^\d{4}-\d{2}$/).optional().describe("YYYY-MM"),
  highlight: z.string().regex(/^\d{4}-\d{2}$/).optional().describe("a month to mark on a monthly_trend, YYYY-MM"),
});
export type ChartRequest = z.infer<typeof chartRequest>;

export function buildChart(ds: Dataset, req: ChartRequest): ChatChart | null {
  const inRange = ds.months.filter((m) => (!req.from || m.month >= req.from) && (!req.to || m.month <= req.to));
  // default window: the last 12 months; never more than 24 points
  const ms = (req.from || req.to ? inRange : lastN(ds, 12)).slice(-24);
  if (!ms.length) return null;
  const prevWindow = () => {
    const i = ds.months.indexOf(ms[0]);
    const prev = ds.months.slice(Math.max(0, i - ms.length), i);
    return prev.length === ms.length ? prev : null;
  };
  let chart: ChatChart | null = null;
  switch (req.kind) {
    case "monthly_trend":
      chart = trend(ms, req.metric ?? "occupancy", req.highlight);
      break;
    case "complaint_themes":
      chart = compareBars("Complaint mentions by theme", "count", ms, prevWindow(), (m) => m.complaints, THEME_LABEL);
      break;
    case "expense_breakdown":
      chart = compareBars("Operating costs by type", "currency", ms, prevWindow(), (m) => m.expenses, EXPENSE_LABEL);
      break;
    case "channel_mix":
      chart = compareBars("Room revenue by booking channel", "currency", ms, null, (m) => m.channelRevenue, {});
      break;
    case "occupancy_by_night": {
      const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const sold = [0, 0, 0, 0, 0, 0, 0];
      const avail = [0, 0, 0, 0, 0, 0, 0];
      for (const m of ms) {
        const [y, mo] = m.month.split("-").map(Number);
        const days = new Date(Date.UTC(y, mo, 0)).getUTCDate();
        for (let d = 1; d <= days; d++) avail[new Date(Date.UTC(y, mo - 1, d)).getUTCDay()] += m.roomsAvailable / days;
        m.dowNights?.forEach((n, i) => (sold[i] += n));
      }
      if (sold.every((n) => !n)) return null;
      chart = {
        kind: "bars",
        title: `Occupancy by night of the week, ${range(ms)}`,
        format: "percent",
        series: ["Occupancy"],
        rows: DOW.map((d, i) => ({ label: d, value: r(avail[i] ? sold[i] / avail[i] : 0) })),
      };
      break;
    }
    case "same_month_by_year":
      chart = sameMonthByYear(ds, ms[ms.length - 1].month);
      break;
  }
  // belt and braces: anything that doesn't fit the wire contract is dropped, not sent
  return chart && chatChartSchema.safeParse(chart).success ? chart : null;
}

/* ----------------------------------------------- charts for suggested prompts */

/** Fixed, data-driven charts for the suggested prompts. The model has no say in these. */
export function chartsForPrompt(ds: Dataset, id: PromptId): ChatChart[] {
  const last12 = lastN(ds, 12);
  const last6 = lastN(ds, 6);
  const prev6 = ds.months.slice(-12, -6);
  const demand = ds.insights.find((i) => i.area === "demand");
  const out: (ChatChart | null)[] = [];
  switch (id) {
    case "quiet":
      out.push(demand?.focusMonth ? sameMonthByYear(ds, demand.focusMonth) : null);
      out.push(trend(last12, "occupancy", demand?.focusMonth));
      break;
    case "occupancy":
      out.push(trend(last12, "occupancy"));
      break;
    case "fix":
      for (const rec of [...ds.recommendations].sort((a, b) => a.rank - b.rank).slice(0, 3)) out.push(seenPair(rec));
      break;
    case "costs": {
      out.push(seenPair(ds.recommendations.find((x) => x.area === "cost")));
      const util = trend(last12, "utilitiesPerNight");
      out.push(util ?? trend(last12, "margin"));
      break;
    }
    case "complaints":
      out.push(
        compareBars("Complaint mentions by theme", "count", last6, prev6.length === 6 ? prev6 : null, (m) => m.complaints, THEME_LABEL, 6)
      );
      out.push(trend(last12, "rating"));
      break;
  }
  return out.filter((c): c is ChatChart => !!c && chatChartSchema.safeParse(c).success).slice(0, 3);
}
