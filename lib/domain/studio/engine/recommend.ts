import type { Recommendation } from "@/lib/types/studio";
import type { Signals } from "./insights";
import { CATEGORY_LABEL } from "./clean";
import { THEME_LABEL } from "./structure";
import { daysInMonth } from "./parse";
import { change, money, monthLabel, monthName, pct } from "../format";

/**
 * Stage 4 — Recommendations: know what to do next.
 *
 * Every card follows   Cause → Action → Effect → Numbers ← Evidence.
 * All arithmetic is done here, in code, from the owner's own data. The language model never
 * produces a number on these cards. Targets are things to test, not forecasts.
 */

/** Promotion assumptions. Shown on the card so the owner can disagree with them. */
const PROMO = { nights: 7, uplift: 0.1, discount: 0.15 };

function weekdayNightsIn(month: string) {
  const [y, m] = month.split("-").map(Number);
  let n = 0;
  for (let d = 1; d <= daysInMonth(month); d++) {
    const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    if (dow !== 5 && dow !== 6) n++;
  }
  return n;
}

function demandRec(s: Signals): Omit<Recommendation, "rank"> | null {
  const g = s.demand;
  if (!g) return null;
  const m = g.month;
  const name = monthName(m.month);
  const lostNights = (g.baseline - m.occupancy) * m.roomsAvailable;
  const promoBase = s.rooms * PROMO.nights * m.weekdayOccupancy;
  const extra = promoBase * PROMO.uplift;
  const promoRate = m.adr * (1 - PROMO.discount);
  const variable =
    m.roomNightsSold && (m.expenses.housekeeping || m.expenses.utilities)
      ? ((m.expenses.housekeeping ?? 0) + (m.expenses.utilities ?? 0)) / m.roomNightsSold
      : null;
  const perExtraNight = promoRate - (variable ?? 0);
  const weekdays = weekdayNightsIn(m.month);
  const nextYear = `${Number(m.month.slice(0, 4)) + 1}`;

  return {
    id: "rec-demand",
    area: "demand",
    insightId: "demand-gap",
    title: `Fill ${name} weekdays with a 7-night promotion`,
    cause: {
      observation: `${monthLabel(m.month, true)} occupancy was ${pct(m.occupancy)}, ${Math.abs(Math.round(g.relative * 100))}% below the ${pct(g.baseline)} ${name} baseline, and the drop was mostly on weekday nights.`,
      evidence: [
        { label: `${monthLabel(m.month)} occupancy`, value: pct(m.occupancy) },
        { label: `${name} baseline (${g.baselineYears.join(" & ")})`, value: pct(g.baseline) },
        { label: "Relative decline", value: `${change(g.relative)}  (${pct(m.occupancy)} ÷ ${pct(g.baseline)} − 1)` },
        { label: "Weekday occupancy", value: `${pct(m.weekdayOccupancy)} vs ${pct(g.baselineWeekday)} usual` },
      ],
    },
    action: {
      summary: `Before ${name} ${nextYear}, test a 7-night promotion on low-demand weekday nights (Sun–Thu): ${Math.round(PROMO.discount * 100)}% off nights still unsold 3 days before arrival.`,
      steps: [
        `Pick the 7 weakest weekday nights in ${name} from last year's calendar.`,
        `Offer ${Math.round(PROMO.discount * 100)}% off on those nights only, released 3 days before arrival so guests who'd book anyway still pay full price.`,
        "Leave Friday and Saturday rates unchanged.",
        "Tag every promotion booking so it can be counted separately.",
      ],
    },
    effect: {
      target: `+${Math.round(PROMO.uplift * 100)}% bookings during the promotion nights, against a comparable baseline`,
      metric: "Room nights sold on the 7 promotion nights",
    },
    numbers: [
      {
        label: `${name} gap vs a normal year`,
        value: `≈ ${Math.round(lostNights)} room nights`,
        basis: `(${pct(g.baseline)} − ${pct(m.occupancy)}) × ${m.roomsAvailable} available nights (${s.rooms} rooms × ${daysInMonth(m.month)})`,
      },
      {
        label: "Room revenue that gap represents",
        value: `≈ ${money(lostNights * m.adr, { compact: true })}`,
        basis: `${Math.round(lostNights)} nights × ${monthLabel(m.month)} ADR ${money(m.adr)}`,
      },
      {
        label: "Expected without a promotion",
        value: `≈ ${Math.round(promoBase)} room nights`,
        basis: `${s.rooms} rooms × 7 nights × ${pct(m.weekdayOccupancy)} weekday occupancy`,
      },
      {
        label: `Target: +${Math.round(PROMO.uplift * 100)}% bookings`,
        value: `≈ +${Math.round(extra)} room nights`,
        basis: `${Math.round(PROMO.uplift * 100)}% × ${Math.round(promoBase)}`,
      },
      variable !== null
        ? {
            label: "Extra contribution from the test",
            value: `≈ ${money(extra * perExtraNight)}`,
            basis: `${extra.toFixed(1)} nights × (${money(promoRate)} promo rate − ${money(variable)} housekeeping & utilities per night)`,
          }
        : {
            label: "Extra room revenue from the test",
            value: `≈ ${money(extra * promoRate)}`,
            basis: `${extra.toFixed(1)} nights × ${money(promoRate)} promo rate`,
          },
      {
        label: `If it works on all ${weekdays} ${name} weekday nights`,
        value: `≈ ${money((extra * perExtraNight * weekdays) / PROMO.nights, { compact: true })}`,
        basis: `Same uplift scaled from 7 to ${weekdays} weekday nights`,
      },
    ],
    measurement: {
      window: "The 7 promotion nights, plus the 2 weeks after (to catch bookings that only moved dates)",
      compareAgainst: `The same weekday nights in ${monthLabel(m.month)}, and ${name}'s non-promotion weekdays`,
      metrics: [
        { label: "Room nights sold (promotion nights)", baseline: `≈ ${Math.round(promoBase)}` },
        { label: "Average daily rate", baseline: money(m.adr) },
        { label: "Net room revenue after discount", baseline: money(promoBase * m.adr) },
        { label: "Contribution margin per night", baseline: variable !== null ? money(m.adr - variable) : "n/a" },
      ],
    },
    assumptions: [
      `The +${Math.round(PROMO.uplift * 100)}% is a target to test, not a forecast or a result.`,
      "The discount only reaches nights that would otherwise stay empty. If regular guests get it too, the net result is lower.",
      variable !== null
        ? `Variable cost per night = (housekeeping + utilities) ÷ nights sold, ${monthLabel(m.month)}.`
        : "No expense data for this month, so variable costs are not deducted.",
      `${name} ${nextYear} demand looks roughly like ${monthLabel(m.month)}.`,
    ],
    seen: {
      label: `${name} occupancy`,
      now: { label: monthLabel(m.month), value: m.occupancy },
      usual: { label: `Usual ${name} (${g.baselineYears.join(" & ")})`, value: g.baseline },
      format: "percent",
    },
    goal: { metric: "Room nights sold on the 7 promotion nights", from: Math.round(promoBase), to: Math.round(promoBase * (1 + PROMO.uplift)), format: "count" },
    strip: {
      observation: `${name} occupancy ${Math.abs(Math.round(g.relative * 100))}% below baseline (${pct(m.occupancy)} vs ${pct(g.baseline)})`,
      evidence: `${g.baselineYears.length} years of ${name} bookings; the gap is on weekdays (${pct(m.weekdayOccupancy)} vs ${pct(g.baselineWeekday)})`,
      action: "Test a 7-day promotion on low-demand weekdays",
      target: `+${Math.round(PROMO.uplift * 100)}% bookings vs a comparable baseline`,
      measure: "Bookings, ADR, net room revenue, contribution",
    },
  };
}

function costRec(s: Signals): Omit<Recommendation, "rank"> | null {
  const c = s.cost;
  if (!c) return null;
  const label = CATEGORY_LABEL[c.driver];
  const lower = label.toLowerCase();
  const excess = (c.perNightNow - c.perNightBefore) * c.nightsNow;
  const target = c.perNightBefore;
  const steps =
    c.driver === "utilities"
      ? [
          ...(c.flagged
            ? [`Check the ${monthLabel(c.flagged.month)} "${c.flagged.label}" bill (${money(c.flagged.amount)}) against the meter reading. Yoonie flagged it during cleaning.`]
            : []),
          "Service the air-con in every room: clean filters, check thermostat limits, look for units that run all day.",
          "Check water heaters and pumps for leaks or always-on settings.",
          `Set a monthly alert when utilities per occupied night go above ${money(target * 1.1)}.`,
        ]
      : [
          `List every ${lower} line item for ${c.window} and compare with the same months last year.`,
          "Ask suppliers about price changes; get one alternative quote for the largest item.",
          `Set a monthly alert when ${lower} per occupied night goes above ${money(target * 1.1)}.`,
        ];
  return {
    id: "rec-cost",
    area: "cost",
    insightId: "cost-squeeze",
    title: `Bring ${lower} back in line with occupancy`,
    cause: {
      observation: `${c.window}: costs ${change(c.expenseGrowth)} vs last year, room revenue ${change(c.revenueGrowth)}. ${label} per occupied night went from ${money(c.perNightBefore)} to ${money(c.perNightNow)}.`,
      evidence: [
        { label: `${label} vs last year`, value: change(c.driverGrowth) },
        { label: `${label} per occupied night`, value: `${money(c.perNightBefore)} → ${money(c.perNightNow)}` },
        { label: "Room revenue vs last year", value: change(c.revenueGrowth) },
        ...(c.profitGrowth !== null ? [{ label: "Operating profit vs last year", value: change(c.profitGrowth) }] : []),
      ],
    },
    action: {
      summary: `Find and fix what's driving ${lower} up, starting with the flagged bill${c.driver === "utilities" ? " and the air-con" : ""}.`,
      steps,
    },
    effect: {
      target: `${label} back to ≈ ${money(target)} per occupied room night (last year's level)`,
      metric: `${label} ÷ room nights sold, monthly`,
    },
    numbers: [
      {
        label: `Extra ${lower} spend vs last year's rate`,
        value: `≈ ${money(excess, { compact: true })} over 6 months`,
        basis: `(${money(c.perNightNow)} − ${money(c.perNightBefore)}) × ${c.nightsNow.toLocaleString("en-US")} nights sold`,
      },
      {
        label: "Per month",
        value: `≈ ${money(excess / 6, { compact: true })}`,
        basis: "6-month excess ÷ 6",
      },
      ...(c.flagged
        ? [
            {
              label: "Explained if the flagged bill was a mistake",
              value: `up to ${money(c.flagged.amount - c.flagged.typical, { compact: true })}`,
              basis: `${money(c.flagged.amount)} billed − ${money(c.flagged.typical)} typical`,
            },
          ]
        : []),
      {
        label: "Yearly saving at last year's rate",
        value: `≈ ${money(excess * 2, { compact: true })}`,
        basis: "6-month excess × 2, if occupancy stays similar",
      },
    ],
    measurement: {
      window: "The next 3 monthly bills",
      compareAgainst: "The same months last year, per occupied room night (so occupancy changes don't hide the result)",
      metrics: [
        { label: `${label} per occupied night`, baseline: money(c.perNightNow) },
        { label: `${label}, monthly total`, baseline: money(c.driverNow / 6) },
        { label: "Operating margin", baseline: "see dashboard" },
      ],
    },
    assumptions: [
      "Tariffs are the same as last year. If they rose, part of the gap can't be recovered.",
      "Per-night comparison assumes similar room mix and length of stay.",
    ],
    seen: {
      label: `${label} per occupied room night`,
      now: { label: c.window, value: c.perNightNow },
      usual: { label: c.priorWindow, value: c.perNightBefore },
      format: "currency",
    },
    goal: { metric: `${label} per occupied room night`, from: Math.round(c.perNightNow), to: Math.round(target), format: "currency" },
    strip: {
      observation: `${label} ${change(c.driverGrowth)} while revenue moved ${change(c.revenueGrowth)}`,
      evidence: `${money(c.perNightBefore)} → ${money(c.perNightNow)} per occupied night${c.flagged ? `, plus an unusual ${monthLabel(c.flagged.month)} bill` : ""}`,
      action: c.driver === "utilities" ? "Check the flagged bill, service air-con and water heaters" : `Review ${lower} line by line`,
      target: `Back to ≈ ${money(target)} per occupied night`,
      measure: `${label} per occupied night, monthly`,
    },
  };
}

function guestRec(s: Signals): Omit<Recommendation, "rank"> | null {
  const g = s.guest;
  if (!g) return null;
  const names = g.themes.map((t) => THEME_LABEL[t].toLowerCase()).join(" & ");
  const bathroom = g.themes.includes("bathroom");
  const targetRating = g.ratingBefore !== null ? Math.min(5, Math.round(g.ratingBefore * 10) / 10) : null;
  return {
    id: "rec-guest",
    area: "guest",
    insightId: "guest-complaints",
    title: `Fix the ${names} complaints guests keep repeating`,
    cause: {
      observation: `${g.now} recent reviews mention ${names} problems, up from ${g.before}${g.ratingNow !== null && g.ratingBefore !== null ? `, while the rating fell from ${g.ratingBefore.toFixed(1)} to ${g.ratingNow.toFixed(1)}` : ""}.`,
      evidence: [
        { label: `Complaints, ${g.window}`, value: `${g.now} (was ${g.before})` },
        { label: "Share of recent reviews", value: pct(g.now / g.reviewsNow) },
        ...(g.ratingNow !== null && g.ratingBefore !== null
          ? [{ label: "Average rating", value: `${g.ratingBefore.toFixed(2)} → ${g.ratingNow.toFixed(2)}` }]
          : []),
        ...(g.correlation !== null ? [{ label: "Complaints vs rating, month by month", value: `r = ${g.correlation.toFixed(2)}` }] : []),
      ],
    },
    action: {
      summary: bathroom
        ? "Add a bathroom check to every room turnover, deep-clean all bathrooms once, and spot-check daily for 4 weeks."
        : `Add a ${names} check to every room turnover and spot-check daily for 4 weeks.`,
      steps: bathroom
        ? [
            "Turnover checklist: drain clear and odour-free, no hair, no mould in grout or silicone, shower pressure OK.",
            "One-time deep clean: descale showers, replace mouldy silicone, clear slow drains.",
            "Manager spot-checks 3 rooms a day for 4 weeks.",
            "Reply to recent bathroom reviews saying what changed.",
          ]
        : [
            `Add ${names} items to the turnover checklist.`,
            "Manager spot-checks 3 rooms a day for 4 weeks.",
            "Reply to recent reviews saying what changed.",
          ],
    },
    effect: {
      target: `Halve ${names} complaints within 3 months${targetRating ? ` and get the rating back to ${targetRating.toFixed(1)}` : ""}`,
      metric: "Complaint mentions per month and average rating",
    },
    numbers: [
      { label: "Complaints now", value: `${g.now} in 6 months`, basis: `Reviews mentioning ${names} problems, ${g.window}` },
      { label: "Target", value: `≤ ${Math.floor(g.now / 2)} in the next 3 months`, basis: `Half of ${g.now}` },
      ...(g.ratingNow !== null && g.ratingBefore !== null
        ? [{ label: "Rating gap to close", value: `${(g.ratingBefore - g.ratingNow).toFixed(2)} stars`, basis: `${g.ratingBefore.toFixed(2)} (${g.priorWindow}) − ${g.ratingNow.toFixed(2)} (${g.window})` }]
        : []),
    ],
    measurement: {
      window: "3 months from the deep clean",
      compareAgainst: g.window,
      metrics: [
        { label: `${names[0].toUpperCase()}${names.slice(1)} complaints per month`, baseline: (g.now / 6).toFixed(1) },
        { label: "Average rating", baseline: g.ratingNow !== null ? g.ratingNow.toFixed(2) : "n/a" },
        { label: "Share of reviews with these complaints", baseline: pct(g.now / g.reviewsNow) },
      ],
    },
    assumptions: [
      "Ratings and complaints move together here, but that doesn't prove one causes the other.",
      "No revenue effect is claimed: we don't have data linking ratings to bookings for this property yet.",
    ],
    seen: {
      label: `Reviews mentioning ${names} problems`,
      now: { label: g.window, value: g.now },
      usual: { label: g.priorWindow, value: g.before },
      format: "count",
    },
    goal: { metric: `${names[0].toUpperCase()}${names.slice(1)} complaints per month`, from: Math.round((g.now / 6) * 10) / 10, to: Math.round((g.now / 12) * 10) / 10, format: "decimal" },
    strip: {
      observation: `${names[0].toUpperCase()}${names.slice(1)} complaints up: ${g.now} vs ${g.before}`,
      evidence: `${pct(g.now / g.reviewsNow)} of recent reviews${g.ratingNow !== null && g.ratingBefore !== null ? `; rating ${g.ratingBefore.toFixed(1)} → ${g.ratingNow.toFixed(1)}` : ""}`,
      action: bathroom ? "Bathroom check on every turnover + one deep clean" : `Add ${names} checks to every turnover`,
      target: `Halve these complaints in 3 months`,
      measure: "Complaints per month, average rating",
    },
  };
}

export function recommend(signals: Signals): Recommendation[] {
  return [demandRec(signals), costRec(signals), guestRec(signals)]
    .filter((r): r is Omit<Recommendation, "rank"> => r !== null)
    .slice(0, 3)
    .map((r, i) => ({ ...r, rank: i + 1 }));
}
