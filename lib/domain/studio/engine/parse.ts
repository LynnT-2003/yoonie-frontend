import * as XLSX from "xlsx";
import type { SheetKind } from "@/lib/types/studio";

/** A date-only value. Kept as UTC midnight so month/day maths never drifts with the server timezone. */
export type Day = Date;

export type DateFormat = "serial" | "iso" | "day-first" | "month-first" | "text";

export interface RawSheet {
  file: string;
  sheet: string;
  kind: SheetKind;
  /** header cell text, original spelling */
  headers: string[];
  /** canonical field → column index */
  columns: Record<string, number>;
  /** data rows with their 1-based spreadsheet row number */
  rows: { row: number; cells: unknown[] }[];
}

/* ------------------------------------------------------------------ headers */

const ALIASES: Record<Exclude<SheetKind, "unknown">, Record<string, string[]>> = {
  bookings: {
    ref: ["bookingref", "bookingid", "bookingno", "reservation", "resno", "ref", "id"],
    guest: ["guestname", "guest", "name"],
    room: ["roomnumber", "roomno", "room", "rm"],
    checkIn: ["checkin", "arrivaldate", "arrival", "datein"],
    checkOut: ["checkout", "departuredate", "departure", "dateout"],
    nights: ["nights", "nts", "los"],
    amount: ["amount", "total", "roomrevenue", "revenue", "price", "paid"],
    channel: ["channel", "source", "bookedvia", "via"],
    status: ["status"],
  },
  expenses: {
    date: ["date", "paiddate", "paymentdate", "month"],
    category: ["category", "expensetype", "type", "item"],
    description: ["description", "details", "memo", "notes", "note"],
    amount: ["amount", "total", "cost", "paid"],
  },
  reviews: {
    date: ["reviewdate", "date", "stayed"],
    rating: ["rating", "score", "stars"],
    text: ["review", "comments", "comment", "feedback", "text"],
    source: ["source", "platform", "site"],
  },
};

const REQUIRED: Record<Exclude<SheetKind, "unknown">, string[][]> = {
  // every inner list is "one of these must be present"
  bookings: [["checkIn"], ["checkOut", "nights"], ["room"]],
  expenses: [["date"], ["category"], ["amount"]],
  reviews: [["date"], ["rating", "text"]],
};

const norm = (s: unknown) =>
  String(s ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

function mapColumns(headers: string[], kind: Exclude<SheetKind, "unknown">) {
  const columns: Record<string, number> = {};
  const used = new Set<number>();
  const normed = headers.map(norm);
  for (const [field, aliases] of Object.entries(ALIASES[kind])) {
    // exact match first, then prefix ("amountthb" → amount)
    let idx = normed.findIndex((h, i) => !used.has(i) && aliases.includes(h));
    if (idx < 0) idx = normed.findIndex((h, i) => !used.has(i) && h && aliases.some((a) => h.startsWith(a)));
    if (idx >= 0) {
      columns[field] = idx;
      used.add(idx);
    }
  }
  return columns;
}

function classify(headers: string[]) {
  let best: { kind: SheetKind; columns: Record<string, number>; score: number } = {
    kind: "unknown",
    columns: {},
    score: 0,
  };
  for (const kind of ["bookings", "expenses", "reviews"] as const) {
    const columns = mapColumns(headers, kind);
    const ok = REQUIRED[kind].every((anyOf) => anyOf.some((f) => f in columns));
    const score = Object.keys(columns).length;
    if (ok && score > best.score) best = { kind, columns, score };
  }
  return best;
}

/* -------------------------------------------------------------------- read */

export function readWorkbook(file: string, data: ArrayBuffer): RawSheet[] {
  const isText = /\.(csv|tsv|txt)$/i.test(file);
  // `raw` keeps CSV text as typed so we can see (and report) the owner's own formats
  // CSVs are decoded as UTF-8 first (SheetJS would read the bytes as Latin-1 and garble "฿")
  const wb = isText
    ? XLSX.read(new TextDecoder("utf-8").decode(data).replace(/^\uFEFF/, ""), { type: "string", raw: true })
    : XLSX.read(new Uint8Array(data), { type: "array", cellDates: false });
  const out: RawSheet[] = [];
  for (const sheetName of wb.SheetNames) {
    const grid = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[sheetName], {
      header: 1,
      raw: true,
      defval: null,
      blankrows: true,
    });
    // header = first row with at least 3 text cells
    const headerIdx = grid.findIndex(
      (r) => Array.isArray(r) && r.filter((c) => typeof c === "string" && c.trim()).length >= 3
    );
    if (headerIdx < 0) {
      out.push({ file, sheet: sheetName, kind: "unknown", headers: [], columns: {}, rows: [] });
      continue;
    }
    const headers = (grid[headerIdx] as unknown[]).map((c) => String(c ?? "").trim());
    const { kind, columns } = classify(headers);
    const rows = grid
      .slice(headerIdx + 1)
      .map((cells, i) => ({ row: headerIdx + 2 + i, cells: (cells ?? []) as unknown[] }))
      .filter((r) => r.cells.some((c) => c !== null && String(c).trim() !== ""));
    out.push({ file, sheet: sheetName, kind, headers, columns, rows });
  }
  return out;
}

export const cell = (s: RawSheet, cells: unknown[], field: string): unknown =>
  field in s.columns ? cells[s.columns[field]] ?? null : null;

/* ------------------------------------------------------------------ values */

const isBlank = (v: unknown) =>
  v === null || v === undefined || /^\s*(|-|–|—|n\/?a|tbc|\?|null)\s*$/i.test(String(v));

export function text(v: unknown): string {
  return isBlank(v) ? "" : String(v).trim();
}

/** "฿1,850", " 1850.00 ", "(120)" → number. `wasText` tells the caller the owner typed it as text. */
export function parseAmount(v: unknown): { value: number | null; wasText: boolean; raw: string } {
  const raw = v === null || v === undefined ? "" : String(v);
  if (isBlank(v)) return { value: null, wasText: false, raw };
  if (typeof v === "number") return { value: v, wasText: false, raw };
  let s = raw.trim();
  const negative = /^\(.*\)$/.test(s) || /(^|[^0-9])[-−]\s*\d/.test(s);
  // drop currency symbols/words, thousands separators and spaces, whatever the encoding
  s = s.replace(/[^0-9.]/g, "");
  const n = Number(s);
  if (!Number.isFinite(n)) return { value: null, wasText: true, raw };
  return { value: negative ? -n : n, wasText: true, raw };
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

const utc = (y: number, m: number, d: number): Day | null => {
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d ? dt : null;
};

/**
 * Accepts Excel serials, ISO, DD/MM/YYYY (the default in Thailand and most of SE Asia),
 * MM/DD/YYYY when the day is obviously > 12, and "3 Jul 2026" / "Jul 3, 2026".
 */
export function parseDate(v: unknown): { value: Day | null; format: DateFormat | null; raw: string } {
  const raw = v === null || v === undefined ? "" : String(v).trim();
  if (isBlank(v)) return { value: null, format: null, raw };
  if (typeof v === "number") {
    const p = XLSX.SSF.parse_date_code(v);
    return { value: p ? utc(p.y, p.m, p.d) : null, format: "serial", raw };
  }
  let m = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return { value: utc(+m[1], +m[2], +m[3]), format: "iso", raw };
  m = raw.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/);
  if (m) {
    const y = m[3].length === 2 ? 2000 + +m[3] : +m[3];
    const a = +m[1];
    const b = +m[2];
    if (b > 12 && a <= 12) return { value: utc(y, a, b), format: "month-first", raw };
    return { value: utc(y, b, a), format: "day-first", raw };
  }
  m = raw.match(/^(\d{1,2})\s+([A-Za-z]{3,})\.?,?\s+(\d{4})$/);
  if (m) {
    const mi = MONTHS.indexOf(m[2].slice(0, 3).toLowerCase());
    return { value: mi >= 0 ? utc(+m[3], mi + 1, +m[1]) : null, format: "text", raw };
  }
  m = raw.match(/^([A-Za-z]{3,})\.?\s+(\d{1,2}),?\s+(\d{4})$/);
  if (m) {
    const mi = MONTHS.indexOf(m[1].slice(0, 3).toLowerCase());
    return { value: mi >= 0 ? utc(+m[3], mi + 1, +m[2]) : null, format: "text", raw };
  }
  return { value: null, format: null, raw };
}

export const DAY_MS = 86_400_000;
export const monthKey = (d: Day) => d.toISOString().slice(0, 7);
export const dayKey = (d: Day) => d.toISOString().slice(0, 10);
export const addDays = (d: Day, n: number) => new Date(d.getTime() + n * DAY_MS);
export const daysInMonth = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
};
export function nextMonth(key: string) {
  const [y, m] = key.split("-").map(Number);
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
}
