import "server-only";

/**
 * Checks that every number in an answer appears in what the model was shown: the instructions,
 * the conversation and the tool results. A figure that isn't there (allowing for the rounding the
 * answer shows) counts as invented.
 *
 * Percentages are only matched against percentages (or 0–1 ratios) in the sources, so a made-up
 * "31%" can't hide behind some unrelated 31. Words ("eight months") aren't checked.
 */

// ฿1,234.5 · 56% · −20% · 4.21 · ฿299k · 1.2M · 24
const NUM = /(฿\s?)?(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d+))?\s?(%|k\b|K\b|M\b)?/g;

const scale = (suffix?: string) => (suffix === "k" || suffix === "K" ? 1e3 : suffix === "M" ? 1e6 : 1);
const read = (m: RegExpMatchArray) => Number(`${m[2].replace(/,/g, "")}${m[3] ? `.${m[3]}` : ""}`) * scale(m[4]);

/** what the sources support: plain numbers, and percentages (written as % or as 0–1 ratios) */
function pools(sources: string[]) {
  const plain: number[] = [];
  const percent: number[] = [];
  for (const text of sources)
    for (const m of text.matchAll(NUM)) {
      const v = read(m);
      if (m[4] === "%") percent.push(v);
      else {
        plain.push(v);
        if (m[3] && v <= 1.5) percent.push(v * 100); // 0.5597 → 55.97%
      }
    }
  return { plain, percent };
}

/** numbers in `answer` that no source supports; empty means grounded */
export function ungroundedNumbers(answer: string, sources: string[]): string[] {
  const { plain, percent } = pools(sources);
  const bad: string[] = [];
  for (const m of answer.matchAll(NUM)) {
    const v = read(m);
    const digits = m[2].replace(/,/g, "");
    const k = scale(m[4]);
    // half a unit of the last digit shown, or 0.5% for round figures (฿71,400, ฿369k)
    const tol = Math.max((0.5 * k) / 10 ** (m[3]?.length ?? 0), /0{2,}$/.test(digits) || k > 1 ? v * 0.005 : 0) + 1e-9;
    // "62–67%": the first number of a range is a percentage too
    const isPct = m[4] === "%" || /^\s?[–-]\s?\d+(?:\.\d+)?\s?%/.test(answer.slice((m.index ?? 0) + m[0].length));
    const pool = isPct ? percent : plain;
    if (!pool.some((c) => Math.abs(c - v) <= tol)) bad.push(m[0].trim());
  }
  return bad;
}
