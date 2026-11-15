# Yoonie — Product Guide (v2: Pocket Strategist)

**Yoonie by Yulio Labs · Your Pocket Strategist**

> Your hotel already has the data. Yoonie helps you understand what it means and what to do next.

A dashboard tells a hotel owner what happened. Yoonie helps them decide what to do next.

## What changed

Yoonie used to be a hospitality operating system (direct booking, OTA-commission reduction, dispatch, housekeeping, PMS-style workflows). **That product is discontinued.** All booking, ops, dispatch, CMS and guest-booking code was removed on the `v2` branch. Don't reintroduce it, and don't position Yoonie against Agoda/Booking.com, PMSs or channel managers.

## Who it's for

Independent hotel owners and managers (boutique hotels, guesthouses, small properties) who run on spreadsheets and have no analyst or revenue manager. They have enough data to learn from, but not the time to analyse it consistently.

## The pipeline

**Data → Intelligence → Decisions → Measurable outcomes**

| Stage | Purpose | Code |
|---|---|---|
| 1. Cleaning | Find what doesn't add up | `lib/domain/studio/engine/clean.ts` |
| 2. Structuring | Extract the fields that matter | `lib/domain/studio/engine/structure.ts` |
| 3. Insights | What's happening and why it matters | `lib/domain/studio/engine/insights.ts` |
| 4. Recommendations | What to do next (the hero) | `lib/domain/studio/engine/recommend.ts` |

Every recommendation follows **Cause → Action → Effect → Numbers ← Evidence**, plus a measurement plan (window, comparison, baseline per metric) and the assumptions behind it.

## Principles (treat as invariants)

- **Never fabricate or silently overwrite.** Format fixes keep the same value (`normalised`). Missing or doubtful money is left out of totals and marked `needs_owner`. Plausible-but-odd values stay in and are `kept_flagged`.
- **Numbers come from code, never from the LLM.** All arithmetic on recommendation cards is computed in `recommend.ts` from the owner's data. The chat model reads numbers only through tools (`lib/domain/studio/server/chat.ts`) and is instructed not to invent any.
- **Label certainty.** Every insight is an anomaly, a trend or a correlation, with a confidence level and a caveat saying what it doesn't prove.
- **Targets are not forecasts.** "+10% bookings" is something to test. The card shows break-even-style arithmetic and the assumptions.
- **The owner decides.** Yoonie suggests; the owner marks an action "trying" or "not now".
- **Select fields for questions, not completeness.** Only fields that answer "is demand healthy / is money leaking / are guests happy" are built.

## What's built today (v2 branch)

- Multi-file upload (.xlsx/.xls/.csv), sheet auto-classification (bookings / expenses / reviews), header aliasing across inconsistent layouts.
- Cleaning: duplicates, missing values, impossible dates, typo'd rates, mixed date formats (DD/MM default), amounts typed as text, channel spelling variants, 10-point vs 5-point ratings, unusual recurring bills (seasonality-aware), unrecognised sheets.
- Structuring: monthly occupancy (weekday/weekend split), ADR, RevPAR, room revenue, expenses by 8 categories, operating margin, channel mix, rating and complaint themes.
- Insights: seasonal demand gap vs same-month baseline, a cost line outgrowing revenue (with and without flagged bills), rising complaint themes vs rating (Pearson r).
- Recommendations: top 3, with arithmetic, measurement plan and assumptions.
- Two tabs only:
  - **Dashboard**: upload → the live four-stage pipeline → full EDA (overview KPIs, data health with before/after tables and a downloadable fix list, demand incl. baseline bars, season heatmap, night-of-week and length-of-stay, money incl. cost per occupied night and channel mix, guests incl. rating spread and complaint themes, and the full monthly table as CSV).
  - **Strategy**: the recommendations as an action plan, each shown as Observation → Evidence → Action → Target → Measure (as in the pitch deck), with a step checklist, status (to do / trying / done / not now), the arithmetic and a measurement scorecard.
- "Ask Yoonie" sidebar (OpenRouter, tool-grounded; scripted fallback without a key). It only exists once an analysis has finished.

## Not built yet

- Persistence: results live in the browser (localStorage), not the backend. No multi-property, no history.
- Outcome tracking: the "after" column is a placeholder. Re-uploading new months doesn't yet compare against a saved baseline.
- Real n8n flows: the pipeline route is the stand-in. `N8N_PIPELINE_WEBHOOK_URL` forwards to n8n, which must emit the same events.
- Integrations (PMS/channel-manager exports), more recommendation types, Thai-language UI.
- Recommendation quality has not been validated with real operators.

## Sample data

`scripts/generate-demo-data.mjs` builds **Sam's Garden House**, a fictional 20-room Chiang Mai hotel (Jan 2024 – Oct 2026), deliberately messy. Built-in story: July baseline 70% → July 2026 56% (a 20% relative drop, weekday-led); utilities up from May 2026 plus an unusual August bill; bathroom and cleanliness complaints rising. It's hypothetical. Never present it as customer data.
