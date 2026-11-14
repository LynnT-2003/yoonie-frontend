import "server-only";
import { tool } from "ai";
import { z } from "zod";
import type { Dataset, MonthMetric } from "@/lib/types/studio";
import { change, money, monthLabel, pct } from "../format";

/**
 * Yoonie chat is grounded: the model reads numbers only through these tools, which compute
 * from the owner's structured dataset. The instructions forbid inventing figures.
 */

const r = (n: number | null, d = 3) => (n === null ? null : Math.round(n * 10 ** d) / 10 ** d);

function slim(m: MonthMetric) {
  return {
    month: m.month,
    occupancy: r(m.occupancy),
    weekdayOccupancy: r(m.weekdayOccupancy),
    weekendOccupancy: r(m.weekendOccupancy),
    roomNightsSold: m.roomNightsSold,
    roomsAvailable: m.roomsAvailable,
    roomRevenue: Math.round(m.roomRevenue),
    adr: Math.round(m.adr),
    revpar: Math.round(m.revpar),
    bookings: m.bookings,
    totalExpenses: m.totalExpenses === null ? null : Math.round(m.totalExpenses),
    operatingProfit: m.operatingProfit === null ? null : Math.round(m.operatingProfit),
    margin: r(m.margin),
    avgRating: r(m.avgRating, 2),
    reviewCount: m.reviewCount,
    complaints: m.complaints,
  };
}

function inRange(ds: Dataset, from?: string, to?: string) {
  return ds.months.filter((m) => (!from || m.month >= from) && (!to || m.month <= to));
}

function aggregate(ms: MonthMetric[]) {
  const sum = (f: (m: MonthMetric) => number) => ms.reduce((s, m) => s + f(m), 0);
  const avail = sum((m) => m.roomsAvailable);
  const sold = sum((m) => m.roomNightsSold);
  const rev = sum((m) => m.roomRevenue);
  const paid = sum((m) => m.roomNightsSold - m.unpricedNights);
  const withCost = ms.filter((m) => m.totalExpenses !== null);
  const cost = withCost.reduce((s, m) => s + (m.totalExpenses ?? 0), 0);
  const costRev = withCost.reduce((s, m) => s + m.roomRevenue, 0);
  const rated = ms.filter((m) => m.avgRating !== null);
  const n = rated.reduce((s, m) => s + m.reviewCount, 0);
  return {
    months: ms.length,
    occupancy: r(avail ? sold / avail : null),
    roomNightsSold: sold,
    roomRevenue: Math.round(rev),
    adr: paid ? Math.round(rev / paid) : null,
    revpar: avail ? Math.round(rev / avail) : null,
    operatingExpenses: withCost.length ? Math.round(cost) : null,
    operatingMargin: costRev ? r((costRev - cost) / costRev) : null,
    avgRating: n ? r(rated.reduce((s, m) => s + (m.avgRating ?? 0) * m.reviewCount, 0) / n, 2) : null,
  };
}

const monthRe = z.string().regex(/^\d{4}-\d{2}$/).describe("YYYY-MM");

export function studioTools(ds: Dataset) {
  return {
    get_monthly_metrics: tool({
      description:
        "Monthly occupancy, weekday/weekend occupancy, room nights, room revenue, ADR, RevPAR, expenses, profit, margin, rating and complaint counts. Ratios are 0–1, money in THB.",
      inputSchema: z.object({ from: monthRe.optional(), to: monthRe.optional() }),
      execute: async ({ from, to }) => inRange(ds, from, to).map(slim),
    }),
    compare_periods: tool({
      description: "Aggregate two month ranges (inclusive) and return both, e.g. this July vs last July, or a quarter vs the same quarter last year.",
      inputSchema: z.object({ aFrom: monthRe, aTo: monthRe, bFrom: monthRe, bTo: monthRe }),
      execute: async ({ aFrom, aTo, bFrom, bTo }) => ({
        a: { range: `${aFrom}..${aTo}`, ...aggregate(inRange(ds, aFrom, aTo)) },
        b: { range: `${bFrom}..${bTo}`, ...aggregate(inRange(ds, bFrom, bTo)) },
      }),
    }),
    expense_breakdown: tool({
      description: "Operating expenses by category (staff, utilities, housekeeping, maintenance, commissions, food, marketing, other) for a month range.",
      inputSchema: z.object({ from: monthRe.optional(), to: monthRe.optional() }),
      execute: async ({ from, to }) => {
        const out: Record<string, number> = {};
        for (const m of inRange(ds, from, to))
          for (const [k, v] of Object.entries(m.expenses)) out[k] = Math.round((out[k] ?? 0) + (v ?? 0));
        return out;
      },
    }),
    channel_mix: tool({
      description: "Room revenue by booking channel for a month range.",
      inputSchema: z.object({ from: monthRe.optional(), to: monthRe.optional() }),
      execute: async ({ from, to }) => {
        const out: Record<string, number> = {};
        for (const m of inRange(ds, from, to))
          for (const [k, v] of Object.entries(m.channelRevenue)) out[k] = Math.round((out[k] ?? 0) + v);
        return out;
      },
    }),
    get_patterns: tool({
      description:
        "Patterns for a month range: occupancy by night of the week (Sun–Sat), bookings by length of stay, reviews by star rating, and complaint mentions by theme. Use for questions like 'which night is quietest', 'how long do guests stay', 'what do guests complain about'.",
      inputSchema: z.object({ from: monthRe.optional(), to: monthRe.optional() }),
      execute: async ({ from, to }) => {
        const ms = inRange(ds, from, to);
        const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const sold = [0, 0, 0, 0, 0, 0, 0];
        const avail = [0, 0, 0, 0, 0, 0, 0];
        const stays = [0, 0, 0, 0, 0, 0];
        const stars = [0, 0, 0, 0, 0];
        const themes: Record<string, number> = {};
        for (const m of ms) {
          const [y, mo] = m.month.split("-").map(Number);
          const days = new Date(Date.UTC(y, mo, 0)).getUTCDate();
          const rooms = m.roomsAvailable / days;
          for (let d = 1; d <= days; d++) avail[new Date(Date.UTC(y, mo - 1, d)).getUTCDay()] += rooms;
          m.dowNights?.forEach((n, i) => (sold[i] += n));
          m.stayLengths?.forEach((n, i) => (stays[i] += n));
          m.ratingCounts?.forEach((n, i) => (stars[i] += n));
          for (const [k, v] of Object.entries(m.complaints)) themes[k] = (themes[k] ?? 0) + (v ?? 0);
        }
        return {
          range: `${ms[0]?.month ?? "?"}..${ms[ms.length - 1]?.month ?? "?"}`,
          occupancyByNight: Object.fromEntries(DOW.map((d, i) => [d, r(avail[i] ? sold[i] / avail[i] : null)])),
          bookingsByLengthOfStay: Object.fromEntries(["1 night", "2 nights", "3 nights", "4 nights", "5-6 nights", "7+ nights"].map((l, i) => [l, stays[i]])),
          reviewsByStars: Object.fromEntries([1, 2, 3, 4, 5].map((s, i) => [`${s} star`, stars[i]])),
          complaintMentionsByTheme: themes,
        };
      },
    }),
    get_yearly_summary: tool({
      description: "One row per calendar year: occupancy, room nights, revenue, ADR, RevPAR, operating costs, margin, average rating. Note the latest year may be partial.",
      inputSchema: z.object({}),
      execute: async () => {
        const years = [...new Set(ds.months.map((m) => m.month.slice(0, 4)))];
        return years.map((y) => {
          const ms = ds.months.filter((m) => m.month.startsWith(y));
          return { year: y, monthsWithData: ms.length, ...aggregate(ms) };
        });
      },
    }),
    get_insights: tool({
      description: "The findings Yoonie detected, with evidence, confidence and caveats (what each does NOT prove).",
      inputSchema: z.object({}),
      execute: async () => ds.insights,
    }),
    get_recommendations: tool({
      description: "The top recommended actions: cause, action, target, the arithmetic behind the numbers, how to measure, and assumptions.",
      inputSchema: z.object({}),
      execute: async () => ds.recommendations,
    }),
    get_data_issues: tool({
      description: "Data-quality findings from cleaning (duplicates, missing values, odd amounts) and what Yoonie did with each.",
      inputSchema: z.object({ severity: z.enum(["critical", "review", "info"]).optional() }),
      execute: async ({ severity }) =>
        ds.anomalies
          .filter((a) => !severity || a.severity === severity)
          .slice(0, 40)
          .map(({ title, detail, severity, resolution, sheet, row }) => ({ title, detail, severity, resolution, sheet, row })),
    }),
  };
}

export function instructions(ds: Dataset) {
  const k = Object.fromEntries(ds.kpis.map((x) => [x.key, x]));
  return `You are Yoonie, a pocket strategist for the owner of ${ds.property.name}, a ${ds.property.rooms}-room independent hotel.
You help them understand their own data and decide what to do next. Today is ${new Date().toISOString().slice(0, 10)}.

Data available: ${monthLabel(ds.property.from)} to ${monthLabel(ds.property.to)}, money in Thai baht (฿).
Last 12 months (${ds.kpiWindow.current}): occupancy ${k.occupancy?.current != null ? pct(k.occupancy.current) : "n/a"}, ADR ${k.adr?.current != null ? money(k.adr.current) : "n/a"}, operating margin ${k.margin?.current != null ? pct(k.margin.current) : "n/a"}.
Findings: ${ds.insights.map((i) => i.title).join("; ") || "none"}.
Top actions: ${ds.recommendations.map((x) => `#${x.rank} ${x.title}`).join("; ") || "none"}.
Data quality: ${ds.stats.rowsRead} rows read, ${ds.stats.rowsExcluded} set aside, ${ds.stats.needsOwner} values waiting for the owner to confirm.
What you can see: the cleaned and structured monthly data built from the owner's files (occupancy, revenue, costs by type, channels, reviews, patterns), the findings and the actions. You cannot see individual bookings, guest names or single rows. If asked for those, say so and suggest the Data tab.

Rules:
- Every number you state must come from a tool result in this conversation. Call a tool before answering any question about numbers. Never estimate, round up or invent figures, customers or results.
- If the data can't answer the question, say so plainly and say what data would answer it.
- Say whether something is a correlation or a confirmed cause. Don't present a guess as a cause.
- Targets (like "+10% bookings") are things to test, not forecasts or results.
- The owner decides; you suggest. When useful, end with one concrete next step.
- Write for a busy hotel owner, not an analyst: short (under 120 words unless asked for detail), plain words, no tables, no headings. Use **bold** for the one or two key numbers. Percentages like 56%, money like ฿12,400.
- The app has two tabs: Dashboard (charts, data health, monthly table) and Strategy (the action plan). Point the owner to the right one when useful.
- If asked about anything unrelated to running this hotel, briefly steer back.`;
}

/** Answers without a language model (no OPENROUTER_API_KEY): same data, fixed phrasing. */
export function scriptedAnswer(ds: Dataset, question: string): string {
  const q = question.toLowerCase();
  const find = (area: string) => ds.insights.find((i) => i.area === area);
  const say = (i: ReturnType<typeof find>) =>
    i
      ? `**${i.title}.** ${i.detail}\n\n${i.evidence.slice(0, 4).map((e) => `• ${e.label}: ${e.value}`).join("\n")}\n\n${i.caveat}`
      : "I didn't find anything unusual there in your data.";

  if (/(what|which).*(do|should|first|next)|recommend|action|priorit|focus/.test(q))
    return ds.recommendations.length
      ? `Here's where I'd start:\n\n${ds.recommendations.map((x) => `**${x.rank}. ${x.title}**: ${x.effect.target}.`).join("\n")}\n\nEach one is on the Strategy tab, with the numbers behind it and how to measure it.`
      : "Nothing stands out yet. Add a few more months of data and I'll look again.";
  if (/occup|july|demand|booking|empty|busy|season/.test(q)) return say(find("demand"));
  if (/cost|expens|utilit|electric|water|bill|margin|profit|spend/.test(q)) return say(find("cost"));
  if (/review|complain|rating|guest|clean|bathroom|shower/.test(q)) return say(find("guest"));
  if (/data|issue|anomal|missing|duplicate|wrong|error|clean/.test(q))
    return `I read **${ds.stats.rowsRead.toLocaleString("en-US")} rows** and set aside ${ds.stats.rowsExcluded} (duplicates, cancelled stays, impossible dates). **${ds.stats.needsOwner} values** need you to confirm them before they count. They're listed under Data health on the Dashboard.`;
  const occ = ds.kpis.find((x) => x.key === "occupancy");
  const adr = ds.kpis.find((x) => x.key === "adr");
  return `Over the last 12 months occupancy was **${occ?.current != null ? pct(occ.current) : "n/a"}**${occ?.current != null && occ.previous != null ? ` (${change(occ.current / occ.previous - 1)} vs the year before)` : ""} at an average rate of **${adr?.current != null ? money(adr.current) : "n/a"}**.\n\nAsk me about occupancy, costs, reviews, or what to do first.\n\n(Scripted answer: set OPENROUTER_API_KEY for free-form questions.)`;
}
