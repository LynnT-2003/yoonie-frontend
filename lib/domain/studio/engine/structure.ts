import type {
  Anomaly,
  ExpenseCategory,
  ExtractedField,
  Kpi,
  MonthMetric,
  ReviewTheme,
} from "@/lib/types/studio";
import type { CleanResult, ReviewRec } from "./clean";
import { addDays, daysInMonth, monthKey, nextMonth } from "./parse";
import { monthLabel } from "../format";
import { THEME_LABEL } from "../labels";

/**
 * Stage 2 — Structuring: extract only the fields that answer real questions
 * (is demand healthy, is money leaking, are guests happy) and organise them by month.
 */

/** Negative mentions only: "great shower" is not a complaint, "weak shower" is. */
const COMPLAINTS: Record<ReviewTheme, RegExp> = {
  cleanliness: /dirty|not (very )?clean|unclean|dust|stain|hair (on|in)|sticky|musty|smelly/i,
  bathroom:
    /(bathroom|shower|toilet|drain|sink)[^.]*(weak|cold|blocked|smell|mou?ld|leak|broken|dirty|slow|hair)|(mou?ld|smell|blocked|leak|weak|cold)[^.]*(bathroom|shower|toilet|drain)|no hot water|water pressure/i,
  noise: /noisy|noise|loud|thin walls/i,
  staff: /rude|unfriendly|unhelpful|ignored us/i,
  breakfast: /breakfast[^.]*(cold|limited|poor|same|bland|ran out)|(cold|limited|poor|bland)[^.]*breakfast/i,
  wifi: /(wi-?fi|internet)[^.]*(slow|weak|drop|didn.t work|unstable|bad)/i,
  aircon: /(air ?con|a\/c)[^.]*(noisy|broken|weak|not cool|leak)|room was (too )?hot/i,
  location: /far from|hard to find|inconvenient location/i,
};

export { THEME_LABEL };

export function complaintThemes(text: string): ReviewTheme[] {
  return (Object.keys(COMPLAINTS) as ReviewTheme[]).filter((t) => COMPLAINTS[t].test(text));
}

export interface StructureResult {
  rooms: number;
  months: MonthMetric[];
  fields: ExtractedField[];
  kpis: Kpi[];
  kpiWindow: { current: string; previous: string };
  assumptions: Anomaly[];
}

type Acc = {
  nights: number;
  weekdayNights: number;
  weekendNights: number;
  revenue: number;
  unpriced: number;
  bookings: number;
  channels: Record<string, number>;
  expenses: Partial<Record<ExpenseCategory, number>>;
  hasExpenses: boolean;
  ratings: number[];
  reviews: number;
  complaints: Partial<Record<ReviewTheme, number>>;
};

const isWeekendNight = (d: Date) => d.getUTCDay() === 5 || d.getUTCDay() === 6; // Fri, Sat nights

function weekendDays(key: string) {
  const [y, m] = key.split("-").map(Number);
  let n = 0;
  for (let d = 1; d <= daysInMonth(key); d++) if (isWeekendNight(new Date(Date.UTC(y, m - 1, d)))) n++;
  return n;
}

export function structure(c: CleanResult): StructureResult {
  const rooms = new Set(c.bookings.map((b) => b.room)).size;
  const acc = new Map<string, Acc>();
  const get = (k: string) => {
    if (!acc.has(k))
      acc.set(k, {
        nights: 0, weekdayNights: 0, weekendNights: 0, revenue: 0, unpriced: 0, bookings: 0,
        channels: {}, expenses: {}, hasExpenses: false, ratings: [], reviews: 0, complaints: {},
      });
    return acc.get(k)!;
  };

  // Period = first to last check-in month, never past the last complete calendar month.
  // (Stays that check out after the export date, or reservations for future months, would
  // otherwise show up as a fake collapse in occupancy.)
  let first = "9999-99";
  let last = "0000-00";
  for (const b of c.bookings) {
    const k = monthKey(b.checkIn);
    if (k < first) first = k;
    if (k > last) last = k;
  }
  const now = new Date();
  const lastComplete = monthKey(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)));
  if (last > lastComplete) last = lastComplete;
  for (const b of c.bookings) {
    get(monthKey(b.checkIn)).bookings++;
    const perNight = b.amount !== null ? b.amount / b.nights : null;
    for (let i = 0; i < b.nights; i++) {
      const d = addDays(b.checkIn, i);
      const k = monthKey(d);
      const a = get(k);
      a.nights++;
      if (isWeekendNight(d)) a.weekendNights++;
      else a.weekdayNights++;
      if (perNight === null) a.unpriced++;
      else {
        a.revenue += perNight;
        a.channels[b.channel] = (a.channels[b.channel] ?? 0) + perNight;
      }
    }
  }
  for (const e of c.expenses) {
    const a = get(monthKey(e.date));
    a.hasExpenses = true;
    if (e.amount !== null) a.expenses[e.category] = (a.expenses[e.category] ?? 0) + e.amount;
  }
  for (const r of c.reviews) {
    const a = get(monthKey(r.date));
    a.reviews++;
    if (r.rating !== null) a.ratings.push(r.rating);
    for (const t of complaintThemes(r.text)) a.complaints[t] = (a.complaints[t] ?? 0) + 1;
  }

  const months: MonthMetric[] = [];
  if (rooms > 0)
    for (let k = first; k <= last; k = nextMonth(k)) {
      const a = get(k);
      const days = daysInMonth(k);
      const available = rooms * days;
      const wkndAvail = rooms * weekendDays(k);
      const priced = a.nights - a.unpriced;
      const total = a.hasExpenses ? Object.values(a.expenses).reduce((x, y) => x + (y ?? 0), 0) : null;
      const profit = total === null ? null : a.revenue - total;
      months.push({
        month: k,
        roomsAvailable: available,
        roomNightsSold: a.nights,
        occupancy: a.nights / available,
        weekdayOccupancy: a.weekdayNights / (available - wkndAvail),
        weekendOccupancy: wkndAvail ? a.weekendNights / wkndAvail : 0,
        roomRevenue: a.revenue,
        unpricedNights: a.unpriced,
        adr: priced ? a.revenue / priced : 0,
        revpar: a.revenue / available,
        bookings: a.bookings,
        channelRevenue: a.channels,
        expenses: a.expenses,
        totalExpenses: total,
        operatingProfit: profit,
        margin: profit === null || !a.revenue ? null : profit / a.revenue,
        reviewCount: a.reviews,
        avgRating: a.ratings.length ? a.ratings.reduce((x, y) => x + y, 0) / a.ratings.length : null,
        complaints: a.complaints,
      });
    }

  const n = months.length || 1;
  const nights = c.bookings.reduce((s, b) => s + b.nights, 0);
  const pricedNights = c.bookings.filter((b) => b.amount !== null).reduce((s, b) => s + b.nights, 0);
  const fields: ExtractedField[] = [
    { key: "occupancy", label: "Occupancy rate", source: "Bookings: room + check-in/out dates", coverage: months.filter((m) => m.roomNightsSold).length / n },
    { key: "available", label: "Available room nights", source: `${rooms} rooms × days in month`, coverage: 1 },
    { key: "revenue", label: "Room revenue", source: "Booking amounts, spread across nights", coverage: nights ? pricedNights / nights : 0 },
    { key: "adr", label: "Average daily rate (ADR)", source: "Room revenue ÷ paid room nights", coverage: nights ? pricedNights / nights : 0 },
    { key: "revpar", label: "Revenue per available room", source: "Room revenue ÷ available room nights", coverage: nights ? pricedNights / nights : 0 },
    { key: "weekday", label: "Weekday vs weekend demand", source: "Night-by-night stay calendar", coverage: 1 },
    { key: "channels", label: "Booking-channel mix", source: "Channel column, spellings merged", coverage: c.bookings.length ? c.bookings.filter((b) => b.channel !== "Unknown").length / c.bookings.length : 0 },
    { key: "expenses", label: "Operating expenses", source: "Expense log, grouped into 8 types", coverage: months.filter((m) => m.totalExpenses !== null).length / n },
    { key: "margin", label: "Operating margin", source: "Room revenue − operating expenses", coverage: months.filter((m) => m.margin !== null).length / n },
    { key: "rating", label: "Guest satisfaction", source: "Review ratings, on a 5-point scale", coverage: months.filter((m) => m.avgRating !== null).length / n },
    { key: "themes", label: "Guest complaint themes", source: "Review text: 8 recurring topics", coverage: c.reviews.length ? c.reviews.filter((r: ReviewRec) => r.text).length / c.reviews.length : 0 },
  ].filter((f) => f.coverage > 0);

  // KPIs: last 12 months vs the 12 before
  const cur = months.slice(-12);
  const prev = months.slice(-24, -12);
  const agg = (ms: MonthMetric[]) => {
    if (!ms.length) return null;
    const sold = ms.reduce((s, m) => s + m.roomNightsSold, 0);
    const avail = ms.reduce((s, m) => s + m.roomsAvailable, 0);
    const rev = ms.reduce((s, m) => s + m.roomRevenue, 0);
    const paid = ms.reduce((s, m) => s + m.roomNightsSold - m.unpricedNights, 0);
    const withCost = ms.filter((m) => m.operatingProfit !== null);
    const costRev = withCost.reduce((s, m) => s + m.roomRevenue, 0);
    const profit = withCost.reduce((s, m) => s + (m.operatingProfit ?? 0), 0);
    const rated = ms.filter((m) => m.avgRating !== null);
    const ratingN = rated.reduce((s, m) => s + m.reviewCount, 0);
    return {
      occupancy: sold / avail,
      adr: paid ? rev / paid : null,
      revpar: rev / avail,
      margin: costRev ? profit / costRev : null,
      rating: ratingN ? rated.reduce((s, m) => s + (m.avgRating ?? 0) * m.reviewCount, 0) / ratingN : null,
    };
  };
  const a = agg(cur);
  const b = agg(prev);
  const kpis: Kpi[] = [
    { key: "occupancy", label: "Occupancy", current: a?.occupancy ?? null, previous: b?.occupancy ?? null, format: "percent" },
    { key: "adr", label: "Average daily rate", current: a?.adr ?? null, previous: b?.adr ?? null, format: "currency" },
    { key: "revpar", label: "RevPAR", current: a?.revpar ?? null, previous: b?.revpar ?? null, format: "currency" },
    { key: "margin", label: "Operating margin", current: a?.margin ?? null, previous: b?.margin ?? null, format: "percent" },
    { key: "rating", label: "Guest rating", current: a?.rating ?? null, previous: b?.rating ?? null, format: "rating" },
  ];
  const span = (ms: MonthMetric[]) => (ms.length ? `${monthLabel(ms[0].month)} – ${monthLabel(ms[ms.length - 1].month)}` : "");

  const assumptions: Anomaly[] = rooms
    ? [
        {
          id: "assume-rooms",
          kind: "assumption",
          severity: "review",
          file: c.bookings[0]?.file ?? "",
          row: null,
          field: "Rooms",
          title: `Hotel size taken as ${rooms} rooms`,
          detail: `Counted from the room numbers in your bookings. If some rooms never appear (closed, owner's use), occupancy will read a little high or low. Please confirm.`,
          resolution: "kept_flagged",
        },
      ]
    : [];

  return { rooms, months, fields, kpis, kpiWindow: { current: span(cur), previous: span(prev) }, assumptions };
}
