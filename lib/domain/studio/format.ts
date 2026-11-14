/** Formatting shared by the pipeline (server) and the studio UI (client). */

export const CURRENCY = "฿";

export function money(n: number, opts: { compact?: boolean } = {}) {
  const sign = n < 0 ? "−" : "";
  const v = Math.abs(n);
  if (opts.compact && v >= 1_000_000) return `${sign}${CURRENCY}${(v / 1_000_000).toFixed(v >= 10_000_000 ? 0 : 1)}M`;
  if (opts.compact && v >= 10_000) return `${sign}${CURRENCY}${Math.round(v / 1000)}k`;
  return `${sign}${CURRENCY}${Math.round(v).toLocaleString("en-US")}`;
}

/** 0.563 → "56%" (or "56.3%" with digits) */
export const pct = (n: number, digits = 0) => `${(n * 100).toFixed(digits)}%`;

/** relative change, signed: 0.2 → "+20%" */
export const change = (n: number, digits = 0) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n * 100).toFixed(digits)}%`;

/** percentage-point gap: 0.14 → "14 pts" */
export const points = (n: number) => `${Math.abs(n * 100).toFixed(0)} pts`;

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "2026-07" → "Jul 2026" */
export function monthLabel(key: string, long = false) {
  const [y, m] = key.split("-").map(Number);
  return `${(long ? MONTH_LONG : MONTH_NAMES)[m - 1]} ${y}`;
}

/** "2026-07" → "Jul" */
export const monthShort = (key: string) => MONTH_NAMES[Number(key.slice(5, 7)) - 1];
export const monthName = (key: string) => MONTH_LONG[Number(key.slice(5, 7)) - 1];

export const round = (n: number, d = 0) => Math.round(n * 10 ** d) / 10 ** d;
