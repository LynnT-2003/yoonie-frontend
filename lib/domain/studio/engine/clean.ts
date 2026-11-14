import type { Anomaly, ExpenseCategory } from "@/lib/types/studio";
import {
  type DateFormat,
  type Day,
  type RawSheet,
  DAY_MS,
  addDays,
  cell,
  dayKey,
  monthKey,
  parseAmount,
  parseDate,
  text,
} from "./parse";
import { money } from "../format";
import { CATEGORY_LABEL } from "../labels";

/**
 * Stage 1 — Cleaning: find what doesn't add up.
 *
 * Rules every check follows:
 * - Never invent a value. Missing or doubtful money is left out of revenue/cost totals and
 *   marked `needs_owner` until the owner confirms it.
 * - Never overwrite. Format fixes (`normalised`) keep the same value; doubtful-but-plausible
 *   values stay in the numbers and are marked `kept_flagged`.
 */

interface Origin {
  file: string;
  sheet: string;
  row: number;
}

export interface BookingRec extends Origin {
  guest: string;
  room: string;
  checkIn: Day;
  checkOut: Day;
  nights: number;
  /** null = unconfirmed; the nights still count as occupied, the money does not */
  amount: number | null;
  channel: string;
}

export interface ExpenseRec extends Origin {
  date: Day;
  category: ExpenseCategory;
  label: string;
  description: string;
  amount: number | null;
  flagged?: boolean;
}

export interface ReviewRec extends Origin {
  date: Day;
  /** 1–5 scale */
  rating: number | null;
  text: string;
  source: string;
}

export interface CleanResult {
  bookings: BookingRec[];
  expenses: ExpenseRec[];
  reviews: ReviewRec[];
  anomalies: Anomaly[];
  rowsRead: number;
  rowsExcluded: number;
  cancelled: number;
}

let seq = 0;

type Example = { before: string; after: string };
/** keep up to `max` distinct before → after pairs */
function sample(list: Example[], before: string, after: string, max = 4) {
  if (list.length < max && before !== after && !list.some((e) => e.before === before)) list.push({ before, after });
}
const num = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });
const showRaw = (raw: string, format: DateFormat | null) => (format === "serial" ? `Excel date ${raw}` : raw);
const nextId = () => `a${(++seq).toString(36)}`;

function anomaly(a: Omit<Anomaly, "id">): Anomaly {
  return { id: nextId(), ...a };
}

const FORMAT_LABEL: Record<DateFormat, string> = {
  serial: "Excel dates",
  iso: "YYYY-MM-DD",
  "day-first": "DD/MM/YYYY",
  "month-first": "MM/DD/YYYY",
  text: "written-out dates (3 Jul 2026)",
};

/* ---------------------------------------------------------------- bookings */

const CHANNELS: [RegExp, string][] = [
  [/booking|bdc/i, "Booking.com"],
  [/agoda/i, "Agoda"],
  [/expedia|hotels\.com/i, "Expedia"],
  [/trip\.?com|ctrip/i, "Trip.com"],
  [/airbnb/i, "Airbnb"],
  [/walk|direct|phone|line|website|web|email|repeat/i, "Direct"],
];

export function normaliseChannel(raw: string) {
  if (!raw) return "Unknown";
  return CHANNELS.find(([re]) => re.test(raw))?.[1] ?? raw.trim();
}

function cleanBookings(sheets: RawSheet[], out: Anomaly[]) {
  const bookings: BookingRec[] = [];
  let read = 0;
  let excluded = 0;
  let cancelled = 0;
  const channelSpellings = new Map<string, Set<string>>();

  for (const s of sheets) {
    const formats = new Map<DateFormat, number>();
    let amountsAsText = 0;
    let derivedCheckout = 0;
    let cancelledHere = 0;
    const dateEx: Example[] = [];
    const amountEx: Example[] = [];
    const checkoutEx: Example[] = [];
    const seenFormats = new Set<DateFormat>();

    for (const { row, cells } of s.rows) {
      read++;
      const at = { file: s.file, sheet: s.sheet, row };
      const status = text(cell(s, cells, "status")).toLowerCase();
      if (/cancel|no.?show|void/.test(status)) {
        cancelled++;
        cancelledHere++;
        continue;
      }
      const ci = parseDate(cell(s, cells, "checkIn"));
      const co = parseDate(cell(s, cells, "checkOut"));
      if (ci.format) formats.set(ci.format, (formats.get(ci.format) ?? 0) + 1);
      if (co.format) formats.set(co.format, (formats.get(co.format) ?? 0) + 1);
      if (ci.value && ci.format && !seenFormats.has(ci.format)) {
        seenFormats.add(ci.format);
        sample(dateEx, showRaw(ci.raw, ci.format), dayKey(ci.value));
      }
      const room = text(cell(s, cells, "room"));
      const guest = text(cell(s, cells, "guest"));

      if (!ci.value) {
        excluded++;
        out.push(
          anomaly({
            ...at,
            kind: "invalid",
            severity: "review",
            field: "Check-in",
            title: "Arrival date missing",
            detail: "Without an arrival date this stay can't be placed on the calendar, so it's left out.",
            value: ci.raw || "(blank)",
            resolution: "excluded",
          })
        );
        continue;
      }

      let checkOut = co.value;
      const nightsCell = Number(cell(s, cells, "nights"));
      if (!checkOut && Number.isFinite(nightsCell) && nightsCell > 0) {
        checkOut = addDays(ci.value, nightsCell);
        derivedCheckout++;
        sample(checkoutEx, `(blank), ${nightsCell} night${nightsCell > 1 ? "s" : ""} from ${dayKey(ci.value)}`, dayKey(checkOut), 3);
      }
      if (!checkOut) {
        excluded++;
        out.push(
          anomaly({
            ...at,
            kind: "missing_value",
            severity: "review",
            field: "Check-out",
            title: "Departure date and nights both missing",
            detail: "We can't tell how long this guest stayed, so the booking is left out until confirmed.",
            resolution: "excluded",
          })
        );
        continue;
      }
      const nights = Math.round((checkOut.getTime() - ci.value.getTime()) / DAY_MS);
      if (nights <= 0 || nights > 60) {
        excluded++;
        out.push(
          anomaly({
            ...at,
            kind: "invalid",
            severity: "critical",
            field: "Check-out",
            title: nights <= 0 ? "Departure is before arrival" : "Stay longer than 60 nights",
            detail: `Arrival ${dayKey(ci.value)}, departure ${dayKey(checkOut)}. Probably a typo in one of the dates; left out until fixed.`,
            value: `${ci.raw} → ${co.raw}`,
            resolution: "excluded",
          })
        );
        continue;
      }
      if (!room) {
        excluded++;
        out.push(
          anomaly({
            ...at,
            kind: "missing_value",
            severity: "review",
            field: "Room",
            title: "Room number missing",
            detail: "Occupancy is counted per room, so this booking is left out until the room is known.",
            resolution: "excluded",
          })
        );
        continue;
      }

      const amt = parseAmount(cell(s, cells, "amount"));
      if (amt.wasText && amt.value !== null) {
        amountsAsText++;
        sample(amountEx, amt.raw, num(amt.value), 3);
      }
      if (amt.value === null) {
        out.push(
          anomaly({
            ...at,
            kind: "missing_value",
            severity: "review",
            field: "Amount",
            title: "Revenue missing",
            detail: `${guest || "Guest"} · room ${room} · ${dayKey(ci.value)}, ${nights} night${nights > 1 ? "s" : ""}. The nights count toward occupancy, but the money isn't counted until you confirm it.`,
            value: amt.raw || "(blank)",
            resolution: "needs_owner",
          })
        );
      }

      const rawChannel = text(cell(s, cells, "channel"));
      const channel = normaliseChannel(rawChannel);
      if (rawChannel) {
        if (!channelSpellings.has(channel)) channelSpellings.set(channel, new Set());
        channelSpellings.get(channel)!.add(rawChannel);
      }

      bookings.push({ ...at, guest, room, checkIn: ci.value, checkOut, nights, amount: amt.value, channel });
    }

    if (formats.size > 1 || formats.has("day-first")) {
      const list = [...formats.keys()].map((f) => FORMAT_LABEL[f]).join(", ");
      out.push(
        anomaly({
          file: s.file,
          sheet: s.sheet,
          row: null,
          kind: "format",
          severity: "info",
          field: "Dates",
          title: formats.size > 1 ? `Dates written ${formats.size} different ways` : "Dates written as DD/MM/YYYY",
          detail: `Found ${list}. Read as day-first (DD/MM), the usual format in Thailand. Tell us if your sheet uses month-first.`,
          resolution: "normalised",
          count: [...formats.values()].reduce((a, b) => a + b, 0),
          examples: dateEx,
        })
      );
    }
    if (amountsAsText) {
      out.push(
        anomaly({
          file: s.file,
          sheet: s.sheet,
          row: null,
          kind: "format",
          severity: "info",
          field: "Amount",
          title: "Amounts typed as text",
          detail: `${amountsAsText} amounts like "฿1,850" were read as numbers. Same values, nothing changed.`,
          resolution: "normalised",
          count: amountsAsText,
          examples: amountEx,
        })
      );
    }
    if (derivedCheckout) {
      out.push(
        anomaly({
          file: s.file,
          sheet: s.sheet,
          row: null,
          kind: "missing_value",
          severity: "info",
          field: "Check-out",
          title: "Departure date filled from nights",
          detail: `${derivedCheckout} bookings had no departure date but did have a night count, so departure = arrival + nights.`,
          resolution: "normalised",
          count: derivedCheckout,
          examples: checkoutEx,
        })
      );
    }
    if (cancelledHere) {
      out.push(
        anomaly({
          file: s.file,
          sheet: s.sheet,
          row: null,
          kind: "invalid",
          severity: "info",
          field: "Status",
          title: "Cancelled bookings set aside",
          detail: `${cancelledHere} rows are marked cancelled or no-show. They never used a room, so they don't count toward occupancy or revenue.`,
          resolution: "excluded",
          count: cancelledHere,
        })
      );
    }
  }

  // duplicates: same guest, room and dates (usually a copy-paste)
  const seen = new Map<string, BookingRec>();
  const unique: BookingRec[] = [];
  for (const b of bookings) {
    const key = `${b.guest.toLowerCase()}|${b.room}|${dayKey(b.checkIn)}|${dayKey(b.checkOut)}`;
    const first = seen.get(key);
    if (first) {
      excluded++;
      out.push(
        anomaly({
          file: b.file,
          sheet: b.sheet,
          row: b.row,
          kind: "duplicate",
          severity: "review",
          field: "Booking",
          title: "Duplicate booking",
          detail: `Same guest, room ${b.room} and dates as ${first.sheet} row ${first.row}. Counted once.`,
          value: `${b.guest} · ${dayKey(b.checkIn)}`,
          resolution: "excluded",
        })
      );
      continue;
    }
    seen.set(key, b);
    unique.push(b);
  }

  // nightly rate far from the month's typical rate: probably a typo (extra zero)
  const ratesByMonth = new Map<string, number[]>();
  for (const b of unique)
    if (b.amount !== null && b.amount > 0) {
      const k = monthKey(b.checkIn);
      if (!ratesByMonth.has(k)) ratesByMonth.set(k, []);
      ratesByMonth.get(k)!.push(b.amount / b.nights);
    }
  const medians = new Map([...ratesByMonth].map(([k, v]) => [k, median(v)]));
  for (const b of unique) {
    if (b.amount === null) continue;
    const typical = medians.get(monthKey(b.checkIn));
    const rate = b.amount / b.nights;
    if (!typical) continue;
    if (b.amount <= 0 || rate > typical * 3.5 || rate < typical * 0.25) {
      out.push(
        anomaly({
          file: b.file,
          sheet: b.sheet,
          row: b.row,
          kind: "outlier",
          severity: "critical",
          field: "Amount",
          title: b.amount <= 0 ? "Zero or negative booking amount" : "Nightly rate looks wrong",
          detail: `${money(rate)} a night vs a typical ${money(typical)} that month${rate > typical * 3.5 ? ". Possibly an extra zero" : ""}. Not counted in revenue until you confirm it.`,
          value: money(b.amount),
          resolution: "needs_owner",
        })
      );
      b.amount = null;
    }
  }

  const merged = [...channelSpellings].filter(([, v]) => v.size > 1);
  if (merged.length) {
    const spellings = merged.reduce((a, [, v]) => a + v.size, 0);
    const example = merged[0];
    out.push(
      anomaly({
        file: unique[0]?.file ?? "",
        row: null,
        kind: "format",
        severity: "info",
        field: "Channel",
        title: "Booking channels spelled differently",
        detail: `${spellings} spellings grouped into ${merged.length} channels (e.g. ${[...example[1]].slice(0, 3).map((s) => `"${s}"`).join(", ")} → ${example[0]}).`,
        resolution: "normalised",
        count: spellings,
        examples: merged.flatMap(([ch, v]) => [...v].filter((x) => x !== ch).map((x) => ({ before: x, after: ch }))).slice(0, 8),
      })
    );
  }

  return { bookings: unique, read, excluded, cancelled };
}

/* ---------------------------------------------------------------- expenses */

const CATEGORIES: [RegExp, ExpenseCategory][] = [
  [/commission|ota\b/i, "commissions"],
  [/salar|wage|payroll|staff|bonus|social sec|sso/i, "staff"],
  [/elec|pea\b|power|water|pwa\b|gas|utilit|internet|wifi|fibre|fiber/i, "utilities"],
  [/laundr|linen|amenit|toiletr|clean|suppl|housekeep/i, "housekeeping"],
  [/repair|mainten|plumb|air ?con|a\/c|fix|paint|pest/i, "maintenance"],
  [/breakfast|food|f&b|kitchen|ingredient|coffee/i, "food"],
  [/marketing|ads?\b|advert|facebook|google|photo|promo/i, "marketing"],
];

export { CATEGORY_LABEL };

function cleanExpenses(sheets: RawSheet[], out: Anomaly[]) {
  const expenses: ExpenseRec[] = [];
  let read = 0;
  let excluded = 0;
  for (const s of sheets) {
    let asText = 0;
    const formats = new Set<DateFormat>();
    const unknown = new Set<string>();
    const dateEx: Example[] = [];
    const amountEx: Example[] = [];
    const grouped = new Map<string, ExpenseCategory>();
    for (const { row, cells } of s.rows) {
      read++;
      const at = { file: s.file, sheet: s.sheet, row };
      const d = parseDate(cell(s, cells, "date"));
      if (d.format && d.value && !formats.has(d.format)) sample(dateEx, showRaw(d.raw, d.format), dayKey(d.value), 2);
      if (d.format) formats.add(d.format);
      const rawCat = text(cell(s, cells, "category"));
      const desc = text(cell(s, cells, "description"));
      const label = rawCat || desc;
      if (!d.value) {
        excluded++;
        out.push(
          anomaly({
            ...at,
            kind: "invalid",
            severity: "review",
            field: "Date",
            title: "Expense without a date",
            detail: `"${label || "Unnamed expense"}" can't be put in a month, so it's left out.`,
            value: d.raw || "(blank)",
            resolution: "excluded",
          })
        );
        continue;
      }
      const category = CATEGORIES.find(([re]) => re.test(`${rawCat} ${desc}`))?.[1] ?? "other";
      if (category === "other" && label) unknown.add(label);
      else if (rawCat && !grouped.has(rawCat)) grouped.set(rawCat, category);
      const amt = parseAmount(cell(s, cells, "amount"));
      if (amt.wasText && amt.value !== null) {
        asText++;
        sample(amountEx, amt.raw, num(amt.value), 2);
      }
      if (amt.value === null) {
        out.push(
          anomaly({
            ...at,
            kind: "missing_value",
            severity: "review",
            field: "Amount",
            title: `${CATEGORY_LABEL[category]} amount missing`,
            detail: `"${label}" on ${dayKey(d.value)} has no amount. Costs for ${monthKey(d.value)} may be understated until you add it.`,
            value: amt.raw || "(blank)",
            resolution: "needs_owner",
          })
        );
      } else if (amt.value < 0) {
        out.push(
          anomaly({
            ...at,
            kind: "outlier",
            severity: "review",
            field: "Amount",
            title: "Negative expense",
            detail: `"${label}" is ${money(amt.value)}. Kept as a refund or credit; tell us if it's a typo.`,
            value: amt.raw,
            resolution: "kept_flagged",
          })
        );
      }
      expenses.push({ ...at, date: d.value, category, label, description: desc, amount: amt.value });
    }
    if (asText || formats.size > 1) {
      out.push(
        anomaly({
          file: s.file,
          sheet: s.sheet,
          row: null,
          kind: "format",
          severity: "info",
          field: "Amount / Date",
          title: "Mixed number and date formats",
          detail: `${asText} amounts typed as text and dates in ${formats.size} formats, read without changing any values.`,
          resolution: "normalised",
          count: asText,
          examples: [...amountEx, ...dateEx],
        })
      );
    }
    if (grouped.size) {
      out.push(
        anomaly({
          file: s.file,
          sheet: s.sheet,
          row: null,
          kind: "format",
          severity: "info",
          field: "Category",
          title: "Expense names grouped into types",
          detail: `${grouped.size} different expense names sorted into ${new Set(grouped.values()).size} types, so costs can be compared month to month.`,
          resolution: "normalised",
          count: grouped.size,
          examples: [...grouped].slice(0, 8).map(([before, c]) => ({ before, after: CATEGORY_LABEL[c] })),
        })
      );
    }
    if (unknown.size) {
      out.push(
        anomaly({
          file: s.file,
          sheet: s.sheet,
          row: null,
          kind: "unrecognised",
          severity: "info",
          field: "Category",
          title: "Expense types we couldn't group",
          detail: `Counted as "Other": ${[...unknown].slice(0, 4).map((u) => `"${u}"`).join(", ")}${unknown.size > 4 ? "…" : ""}.`,
          resolution: "kept_flagged",
          count: unknown.size,
        })
      );
    }
  }

  // duplicates: same day, type and amount
  const seen = new Map<string, ExpenseRec>();
  const unique: ExpenseRec[] = [];
  for (const e of expenses) {
    const key = `${dayKey(e.date)}|${e.category}|${(e.description || e.label).toLowerCase()}|${e.amount}`;
    const first = seen.get(key);
    if (first && e.amount !== null) {
      excluded++;
      out.push(
        anomaly({
          file: e.file,
          sheet: e.sheet,
          row: e.row,
          kind: "duplicate",
          severity: "review",
          field: "Expense",
          title: "Expense entered twice",
          detail: `Same date, type and amount as row ${first.row}. Counted once.`,
          value: `${e.label} · ${money(e.amount!)}`,
          resolution: "excluded",
        })
      );
      continue;
    }
    seen.set(key, e);
    unique.push(e);
  }

  // a recurring fixed bill far above its own recent history. Variable costs (commissions,
  // laundry, breakfast) follow occupancy and swing with the season by design, so they're skipped.
  const FIXED: ExpenseCategory[] = ["utilities", "staff", "marketing", "other"];
  const byCat = new Map<string, ExpenseRec[]>();
  for (const e of unique) {
    if (!FIXED.includes(e.category)) continue;
    const k = `${e.category}|${(e.description || e.label).toLowerCase().replace(/[^a-z]/g, "")}`;
    if (!byCat.has(k)) byCat.set(k, []);
    byCat.get(k)!.push(e);
  }
  for (const list of byCat.values()) {
    list.sort((a, b) => a.date.getTime() - b.date.getTime());
    list.forEach((e, i) => {
      if (e.amount === null || e.amount <= 0) return;
      const prior = list
        .slice(Math.max(0, i - 6), i)
        .map((p) => p.amount)
        .filter((a): a is number => a !== null && a > 0);
      if (prior.length < 4) return;
      const typical = median(prior);
      // also check the same month last year, so normal seasonal swings aren't flagged
      const lastYear = list.find(
        (p) => p.amount && p.date.getUTCFullYear() === e.date.getUTCFullYear() - 1 && p.date.getUTCMonth() === e.date.getUTCMonth()
      );
      const seasonal = lastYear?.amount ? e.amount > lastYear.amount * 1.35 : true;
      if (e.amount > typical * 1.35 && seasonal) {
        e.flagged = true;
        out.push(
          anomaly({
            file: e.file,
            sheet: e.sheet,
            row: e.row,
            kind: "outlier",
            severity: "critical",
            field: "Amount",
            title: `Unexpected ${CATEGORY_LABEL[e.category].toLowerCase()} expense`,
            detail: `${money(e.amount)} in ${monthKey(e.date)}, ${(e.amount / typical).toFixed(1)}× the usual ${money(typical)}. Kept in the totals; worth checking the bill or meter.`,
            value: e.label,
            resolution: "kept_flagged",
          })
        );
      }
    });
  }

  return { expenses: unique, read, excluded };
}

/* ----------------------------------------------------------------- reviews */

function cleanReviews(sheets: RawSheet[], out: Anomaly[]) {
  const reviews: ReviewRec[] = [];
  let read = 0;
  let excluded = 0;
  for (const s of sheets) {
    let tenPoint = 0;
    const ratingEx: Example[] = [];
    for (const { row, cells } of s.rows) {
      read++;
      const at = { file: s.file, sheet: s.sheet, row };
      const d = parseDate(cell(s, cells, "date"));
      if (!d.value) {
        excluded++;
        out.push(
          anomaly({
            ...at,
            kind: "invalid",
            severity: "info",
            field: "Date",
            title: "Review without a date",
            detail: "Can't be placed in a month, so it's left out of the trend.",
            resolution: "excluded",
          })
        );
        continue;
      }
      const r = parseAmount(cell(s, cells, "rating"));
      let rating = r.value;
      if (rating !== null && rating > 5 && rating <= 10) {
        rating = rating / 2;
        tenPoint++;
        sample(ratingEx, `${r.value} / 10`, `${num(rating)} / 5`, 3);
      } else if (rating !== null && (rating < 0 || rating > 10)) {
        rating = null;
      }
      reviews.push({
        ...at,
        date: d.value,
        rating,
        text: text(cell(s, cells, "text")),
        source: text(cell(s, cells, "source")),
      });
    }
    if (tenPoint) {
      out.push(
        anomaly({
          file: s.file,
          sheet: s.sheet,
          row: null,
          kind: "format",
          severity: "info",
          field: "Rating",
          title: "Ratings on two different scales",
          detail: `${tenPoint} ratings were out of 10 (e.g. Booking.com) and were halved to fit the 5-point scale.`,
          resolution: "normalised",
          count: tenPoint,
          examples: ratingEx,
        })
      );
    }
  }
  return { reviews, read, excluded };
}

/* -------------------------------------------------------------------- main */

export function clean(sheets: RawSheet[]): CleanResult {
  seq = 0;
  const anomalies: Anomaly[] = [];
  for (const s of sheets.filter((x) => x.kind === "unknown")) {
    anomalies.push(
      anomaly({
        file: s.file,
        sheet: s.sheet,
        row: null,
        kind: "unrecognised",
        severity: "info",
        title: "Sheet not recognised",
        detail: s.headers.length
          ? `Columns ${s.headers.slice(0, 4).map((h) => `"${h}"`).join(", ")} don't look like bookings, expenses or reviews. Skipped.`
          : "No header row found. Skipped.",
        resolution: "excluded",
      })
    );
  }
  const b = cleanBookings(sheets.filter((x) => x.kind === "bookings"), anomalies);
  const e = cleanExpenses(sheets.filter((x) => x.kind === "expenses"), anomalies);
  const r = cleanReviews(sheets.filter((x) => x.kind === "reviews"), anomalies);
  return {
    bookings: b.bookings,
    expenses: e.expenses,
    reviews: r.reviews,
    anomalies,
    rowsRead: b.read + e.read + r.read,
    rowsExcluded: b.excluded + e.excluded + r.excluded + b.cancelled,
    cancelled: b.cancelled,
  };
}

export function median(xs: number[]) {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
