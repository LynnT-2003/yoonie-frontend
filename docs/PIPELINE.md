# Yoonie v2: How the Pipeline Works

**Yoonie by Yulio Labs · Your Pocket Strategist**

*Last updated 15 Nov 2026 · describes the `main` branch (merged from `v2`)*

> A dashboard tells a hotel owner what happened. Yoonie helps them decide what to do next.

This document explains, step by step, how Yoonie turns a hotel's messy spreadsheets into a dashboard, an action plan and a chat that answers from the hotel's own numbers. Every number quoted comes from running the real engine on the sample hotel, *Sam's Garden House* (fictional; see section 9).

---

## 1. Overview

```
 Spreadsheets (.xlsx / .csv)
        │
        ▼
 0 Read ─► 1 Clean ─► 2 Structure ─► 3 Insights ─► 4 Recommendations
                                                           │
                                                           ▼
                             Dashboard · Strategy · Data · Ask Yoonie
```

| Stage | Question it answers | Output |
|---|---|---|
| 0 · Read | What's in these files? | Sheets recognised as bookings, expenses or reviews |
| 1 · Clean | Does anything not add up? | Every problem found, and what Yoonie did about it |
| 2 · Structure | Which numbers matter? | A month-by-month business data model (11 fields) |
| 3 · Insights | What changed, and how sure are we? | Up to 3 findings, each labelled anomaly / trend / correlation |
| 4 · Recommendations | What should I do next? | Up to 3 actions, each with a target and a way to measure it |

The first three stages build trust. The fourth delivers the value.

### Principles every stage follows

1. **Nothing is silently fabricated.** Yoonie never fills in or overwrites a value it isn't sure about. A missing or doubtful amount is left out of the totals until the owner confirms it.
2. **Numbers come from code, never from the AI.** All arithmetic (occupancy, gaps, targets, savings) is calculated deterministically. The language model only phrases answers in the chat, and it can only read numbers through tools that calculate them.
3. **Certainty is labelled.** Every finding says whether it is an *anomaly*, a *trend* or a *correlation*, carries a confidence level, and states what it does **not** prove.
4. **Targets are things to test, not forecasts.** "+10% bookings" is a goal for an experiment, not a promise.
5. **The owner decides.** Yoonie suggests; it never acts on the owner's behalf.

### Where it lives in the code

| Part | File |
|---|---|
| Reading files | `lib/domain/studio/engine/parse.ts` |
| Stage 1 · Clean | `lib/domain/studio/engine/clean.ts` |
| Stage 2 · Structure | `lib/domain/studio/engine/structure.ts` |
| Stage 3 · Insights | `lib/domain/studio/engine/insights.ts` |
| Stage 4 · Recommendations | `lib/domain/studio/engine/recommend.ts` |
| Orchestration & streaming | `lib/domain/studio/engine/run.ts`, `app/api/studio/pipeline/route.ts` |
| Ask Yoonie | `lib/domain/studio/server/chat.ts`, `app/api/studio/chat/route.ts` |
| Wire contract (all types) | `lib/types/studio/index.ts` |

The engine is plain TypeScript with no framework dependencies, so it can move into the backend or an n8n flow unchanged.

---

## 2. Step 0 · Reading the files

**Input:** up to 10 spreadsheets (`.xlsx`, `.xlsm`, `.xls`, `.csv`), 4 MB in total, uploaded by drag-and-drop, or the bundled sample hotel.

### 2.1 Opening each file
- Excel files are read with SheetJS, keeping dates as raw Excel serial numbers so no timezone shifts creep in.
- CSV files are first decoded as UTF-8. (Otherwise the Thai baht sign `฿` arrives garbled and amounts like `"฿ 38,200.00"` can't be read.)

### 2.2 Finding the header row
The header is the **first row with at least three text cells**. Title rows, blank rows and notes above the table are skipped.

### 2.3 Recognising what each sheet is
Each column header is normalised (lower-cased, punctuation removed) and matched against a list of aliases for every field Yoonie understands:

| Sheet type | Fields matched (examples of accepted headers) | Must have |
|---|---|---|
| Bookings | check-in (`Check In`, `Arrival`, `Date in`), check-out (`Departure`), nights (`Nts`, `LOS`), room (`Room No`), amount (`Total`, `Amount (THB)`, `Revenue`), channel (`Source`, `Booked via`), guest, status, ref | check-in, room, and check-out **or** nights |
| Expenses | date, category (`Type`, `Item`), description (`Memo`, `Notes`), amount (`Cost`, `Paid`) | date, category, amount |
| Reviews | date, rating (`Score`, `Stars`), text (`Review`, `Comments`, `Feedback`), source (`Platform`) | date, and rating **or** text |

A sheet becomes whichever type it matches best. Sheets that match nothing (for example an old "Summary" tab) are **skipped and reported**, not guessed at.

Because matching is by meaning rather than position, it doesn't matter that one year's sheet says `Check In` and the next says `Arrival`. Yoonie maps both to *Check-in* and tells the owner it did.

### 2.4 Reading messy values

**Amounts.** `"฿1,850"`, `"฿ 38,200.00"`, `"(120)"` and `1850` all become numbers. Currency symbols, commas and spaces are dropped; brackets or a minus sign make it negative. Blanks and placeholders (`""`, `-`, `n/a`, `TBC`, `?`) become *missing*, never zero.

**Dates.** Accepted formats:
- Excel date serials
- ISO `2026-07-03`
- `DD/MM/YYYY`, the default, as used in Thailand and most of Southeast Asia (Yoonie switches to `MM/DD` only when the day is obviously over 12)
- `3 Jul 2026` and `Jul 3, 2026`

All dates are stored as calendar dates at midnight UTC, so month and day-of-week maths never drifts.

---

## 3. Stage 1 · Cleaning — *find what doesn't add up*

Every problem Yoonie finds is reported, with the file, sheet and row number, and lands in **one of four outcomes**. These four words are used everywhere in the app:

| Outcome | Meaning | Effect on the numbers |
|---|---|---|
| **Needs you** | Missing or doubtful values | Left out of totals until the owner confirms |
| **Worth a look** | Plausible but unusual | Kept in the totals, flagged |
| **Set aside** | Duplicates, cancellations, impossible rows | Left out, with the reason |
| **Tidied** | Same value, cleaner format | Kept; nothing for the owner to do |

### 3.1 Booking checks

| Check | Rule | Outcome |
|---|---|---|
| Cancelled / no-show | Status contains *cancel*, *no show* or *void* | Set aside (never used a room) |
| Arrival missing | No readable check-in date | Set aside |
| Departure missing | Has a night count → departure = arrival + nights | Tidied |
| Departure and nights both missing | Length of stay unknown | Set aside |
| Impossible stay | Departure on/before arrival, or over 60 nights | Set aside |
| Room missing | Occupancy is counted per room | Set aside |
| Revenue missing | Blank or `TBC` amount | **Needs you**: the nights still count toward occupancy, the money doesn't |
| Rate looks wrong | Nightly rate over 3.5× or under 0.25× that month's median, or ≤ 0 | **Needs you**: removed from revenue until confirmed |
| Duplicate | Same guest, room, arrival and departure | Set aside (counted once) |
| Channel spellings | `BDC`, `booking`, `Booking.com` → Booking.com; `agoda.com` → Agoda; `Walk-in`, `LINE`, `Phone` → Direct | Tidied |
| Mixed formats | Dates in several formats; amounts typed as text | Tidied (with real before → after examples) |

### 3.2 Expense checks

| Check | Rule | Outcome |
|---|---|---|
| Date missing | Can't be placed in a month | Set aside |
| Grouping | Names like `Elec`, `PEA electricity bill`, `Water` → *Utilities*; `Salaries` → *Staff*; `Laundry`, `Amenities` → *Housekeeping*; and so on, into 8 types | Tidied |
| Unrecognised | Fits no type (e.g. `Garden`) | Worth a look (counted as *Other*) |
| Amount missing | Blank amount | Needs you (that month's costs may be understated) |
| Negative amount | e.g. a refund | Worth a look (kept as a credit) |
| Duplicate | Same date, type, description and amount | Set aside |
| Unusual bill | A recurring fixed bill (utilities, staff, marketing, other) over **1.35×** the median of its previous 6 bills **and** over 1.35× the same month last year | Worth a look (the second test stops normal seasonal swings being flagged) |

The 8 cost types are Staff, Utilities, Housekeeping & laundry, Maintenance, OTA commissions, Food & breakfast, Marketing and Other.

### 3.3 Review checks

| Check | Rule | Outcome |
|---|---|---|
| Date missing | Can't be placed in a month | Set aside |
| 10-point ratings | A rating between 5 and 10 (e.g. Booking.com's 9.2) is halved to the 5-point scale | Tidied |
| Out-of-range rating | Below 0 or above 10 | Rating ignored, text kept |

### 3.4 Result on the sample hotel

**6,607 of 6,828 rows are in the numbers.**

| Outcome | Count | Examples |
|---|---|---|
| Needs you | 12 rows | 10 missing booking amounts (one marked TBC), a ฿28,000-a-night typo (typical ฿2,800), a missing water bill |
| Worth a look | 4 items | August 2026 electricity ฿71,400 (usual ≈ ฿40,000), a laundry refund, the "Garden" expense, the hotel-size assumption |
| Set aside | 209 rows | 6 duplicate bookings, 1 duplicate bill, 199 cancellations, a stay that departs before it arrives, a blank room, an undated review |
| Tidied | 9,834 values | 7,611 dates in mixed formats, 2,132 amounts typed as text, 16 channel spellings, 13 expense names, 56 ten-point ratings, 3 departures filled from nights |

The owner can download every "Needs you" and "Worth a look" item as a **fix list (CSV)** with file, sheet, row and value, fix them in their own spreadsheet, and upload again.

---

## 4. Stage 2 · Structuring — *extract the fields that matter*

Cleaned records become a **month-by-month business data model**. Only fields that answer the owner's real questions are built: *is demand healthy, is money leaking, are guests happy?*

### 4.1 The period and the hotel size
- **Rooms:** counted from the distinct room numbers in the bookings (20 for the sample). This is an assumption, so it's shown to the owner as *Worth a look*: rooms that never appear (closed, owner's use) would skew occupancy.
- **Period:** first to last check-in month, but never past the last complete calendar month. Future reservations or stays checking out after the export would otherwise look like a collapse in occupancy.

### 4.2 Spreading stays across nights
Every booking is walked **night by night**:
- each night adds 1 to its month's room nights sold, to *weekday* (Sun–Thu) or *weekend* (Fri–Sat), and to its day of the week;
- revenue per night = booking amount ÷ nights, added to the month and to the booking channel;
- if the amount is missing or doubtful, the night still counts toward occupancy but adds no revenue (it's tracked as an *unpriced night*).

Bookings and length of stay are counted in the check-in month. Expenses are summed per month per type. Reviews give each month an average rating, a count of reviews by star, and complaint counts by theme.

### 4.3 Complaint themes
Reviews are scanned for **negative** mentions of 8 themes: cleanliness, bathroom, noise, staff, breakfast, Wi-Fi, air-con and location. Patterns look for problems, not topics: *"weak shower"* or *"drain smelled bad"* counts as a bathroom complaint, *"great shower"* doesn't.

### 4.4 The metrics

| Metric | Formula |
|---|---|
| Rooms available | rooms × days in month |
| Occupancy | room nights sold ÷ rooms available |
| ADR (average daily rate) | room revenue ÷ *paid* room nights |
| RevPAR | room revenue ÷ rooms available |
| Operating profit | room revenue − operating expenses |
| Operating margin | operating profit ÷ room revenue |
| Weekday / weekend occupancy | nights sold ÷ nights available, by type of night |

The **11 business fields** are: occupancy, available room nights, room revenue, ADR, RevPAR, weekday vs weekend demand, booking-channel mix, operating expenses, operating margin, guest satisfaction and complaint themes. Each is shown with how complete it is and its latest value (e.g. *"Oct 2026: 67%"*).

### 4.5 Headline KPIs
The last 12 months are compared with the 12 before. For the sample (Nov 2025 – Oct 2026 vs Nov 2024 – Oct 2025):

| KPI | Last 12 months | vs year before |
|---|---|---|
| Occupancy | 73% | −1.0 pts |
| ADR | ฿2,542 | +4.2% |
| RevPAR | ฿1,855 | +2.9% |
| Room revenue | ฿14M | +2.9% |
| Operating margin | 49.0% | −0.6 pts |
| Guest rating | 4.43 | −0.23 |

**Sample result:** 34 months · 20 rooms · 11 business fields.

---

## 5. Stage 3 · Insights — *understand what is happening and why*

Three detectors run over the monthly data. Each one either finds something or stays quiet, so a healthy hotel gets fewer findings, not padded ones.

### 5.1 Demand gap (labelled *Anomaly*)
**Question:** did any recent month fill far worse than usual for that time of year?

1. For each of the last 12 months, the **baseline** is the average occupancy of the *same calendar month* in earlier years. Comparing July with July removes seasonality.
2. A month is flagged if it is **10% or more below** its baseline (relative). The worst one is reported.
3. Evidence adds weekday vs weekend occupancy against their own baselines, and the neighbouring months, to show whether it's one month or a trend.
4. Confidence is *high* with 2+ years of baseline, *medium* with 1.

**Sample, worked through:**
- July baseline = average of July 2024 (70.5%) and July 2025 (69.5%) = **70%**
- July 2026 occupancy = **56%**
- Relative change = 56 ÷ 70 − 1 = **−20%**
- Empty nights vs usual = (70% − 56%) × 620 available nights ≈ **87 room nights**
- Weekdays 48% vs 69% usual; weekends 75% vs 73% usual, so the drop is midweek
- Neighbouring months: June −1%, August +6%, so it's July-specific
- *What this doesn't prove:* it shows that July fell, not why. Local events, competitor prices, flights or weather could explain it.

### 5.2 A cost line outgrowing revenue (labelled *Trend*)
**Question:** is any cost growing much faster than the business?

1. Needs at least 18 months of expenses. Compares the **last 6 months with the same 6 months a year earlier**.
2. A cost type qualifies if it is at least **3% of costs** and grows **15 points or more faster than room revenue**. The one with the most money above revenue's growth rate is reported.
3. Also calculated **per occupied room night**, which takes occupancy out of the picture.
4. If cleaning flagged an unusual bill in that window, growth is recalculated **without it**, so one bad bill can't create a false trend. Confidence drops to *medium* when a flagged bill is involved.

**Sample:** May–Oct 2026 vs May–Oct 2025.
- Utilities **+23%** (฿299k → ฿369k), against room revenue +1%; total operating costs +5%
- Utilities per occupied night ฿122 → **฿154**; operating profit −5%
- Without the flagged August bill, utilities are still **+13%**, so the trend is real
- *What this doesn't prove:* higher tariffs or a hotter season could explain part of it; there are no meter readings.

### 5.3 Rising guest complaints (labelled *Correlation, not proof of cause*)
**Question:** are guests complaining about the same thing more often?

1. Needs at least 9 months with reviews. Compares the **last 6 months with the 6 before**.
2. Takes the theme that rose most (with at least 3 mentions), plus any theme that rose 1.5× alongside it.
3. Reported only if there are at least 4 mentions and at least a 1.5× increase.
4. Adds the rating change and the **Pearson correlation** between each month's complaint share and its average rating.

**Sample:**
- Bathroom & cleanliness complaints **24 vs 7** (bathroom 9 vs 0, cleanliness 15 vs 7), in **44%** of recent reviews
- Average rating 4.65 → **4.21**; correlation **r = −0.59** (months with more complaints rate lower)
- *What this doesn't prove:* the timing matches, but other things may also have pulled the rating down.

Each insight carries a **headline number** (−20%, +23%, 24 vs 7), which the dashboard shows first.

---

## 6. Stage 4 · Recommendations — *know what to do next*

Each finding becomes **at most one action**, and there are never more than three. Every action follows the same shape:

**Observation → Evidence → Action → Target → Measure**

| Part | What it contains |
|---|---|
| Observation | What Yoonie noticed, in one sentence |
| Evidence | The comparison behind it (drawn as *now vs usual* bars) |
| Action | One-sentence summary plus concrete steps |
| Target | Where to aim, drawn as *today → target* (a target to test, not a forecast) |
| Numbers | The arithmetic, each line with its formula ("basis") |
| Measure | The metrics to watch, their baseline from the owner's data, the window, and what to compare against |
| Assumptions | What has to be true for the numbers to hold |

All arithmetic is in `recommend.ts`. The AI never produces a number on these cards.

### 6.1 Action 1 · Fill July weekdays with a 7-night promotion
**Action:** before July 2027, test a promotion on 7 low-demand weekday nights (Sun–Thu): 15% off nights still unsold 3 days before arrival, so guests who'd book anyway still pay full price. Weekend rates stay the same.

| Number | Value | How it's calculated |
|---|---|---|
| July gap vs a normal year | ≈ 87 room nights | (70% − 56%) × 620 available nights (20 rooms × 31) |
| Room revenue that gap represents | ≈ ฿188k | 87 nights × July 2026 ADR ฿2,160 |
| Expected without a promotion | ≈ 67 room nights | 20 rooms × 7 nights × 48% weekday occupancy |
| **Target: +10% bookings** | **≈ +7 room nights (67 → 74)** | 10% × 67 |
| Extra contribution from the test | ≈ ฿10,826 | 6.7 nights × (฿1,836 promo rate − ฿231 housekeeping & utilities per night) |
| If it works on all 22 July weekday nights | ≈ ฿34k | same uplift scaled from 7 to 22 nights |

- Promo rate = ADR × 85% = ฿1,836. Variable cost per night = (housekeeping + utilities) ÷ nights sold in July 2026 = ฿231.
- **Measure:** over the 7 promotion nights plus the 2 weeks after (to catch bookings that only moved dates), compared with the same weekday nights in July 2026 and July's non-promotion weekdays. Baselines: room nights ≈ 67, ADR ฿2,160, net room revenue ฿145,708, contribution per night ฿1,929.
- **Assumptions:** +10% is a target, not a forecast. The discount reaches only nights that would otherwise stay empty. July 2027 demand looks roughly like July 2026.

### 6.2 Action 2 · Bring utilities back in line with occupancy
**Steps:** check the flagged August bill against the meter reading; service the air-con in every room (filters, thermostat limits, units running all day); check water heaters and pumps; set an alert when utilities per occupied night go above 110% of last year's level.

| Number | Value | How it's calculated |
|---|---|---|
| Extra spend vs last year's rate | ≈ ฿78k over 6 months | (฿154 − ฿122) × 2,388 nights sold |
| Per month | ≈ ฿13k | 6-month excess ÷ 6 |
| Explained if the flagged bill was a mistake | up to ฿31k | ฿71,400 billed − ฿40,281 typical |
| Yearly saving at last year's rate | ≈ ฿155k | 6-month excess × 2, if occupancy stays similar |
| **Target** | **฿154 → ≈ ฿122 per occupied night** | back to last year's level |

- **Measure:** the next 3 monthly bills, per occupied room night (so occupancy changes don't hide the result), against the same months last year.
- **Assumptions:** tariffs unchanged from last year; similar room mix and length of stay.

### 6.3 Action 3 · Fix the bathroom & cleanliness complaints
**Steps:** add a bathroom check to every room turnover (drain clear, no hair, no mould, shower pressure OK); one deep clean (descale showers, replace mouldy silicone, clear slow drains); manager spot-checks 3 rooms a day for 4 weeks; reply to recent bathroom reviews saying what changed.

| Number | Value | How it's calculated |
|---|---|---|
| Complaints now | 24 in 6 months | reviews mentioning these problems, May–Oct 2026 |
| **Target** | **≤ 12 in the next 3 months (4.0 → 2.0 a month)** | half of 24 |
| Rating gap to close | 0.45 stars | 4.65 (Nov 2025 – Apr 2026) − 4.21 (May–Oct 2026) |

- **Measure:** complaints per month, average rating and share of reviews with these complaints, over 3 months from the deep clean.
- **Assumptions:** ratings and complaints move together but that doesn't prove one causes the other. No revenue effect is claimed, because there's no data linking ratings to bookings for this hotel yet.

---

## 7. Delivering it: streaming and the app

### 7.1 The pipeline endpoint
`POST /api/studio/pipeline` takes the uploaded files (or `demo=1` for the sample) and streams progress as **newline-delimited JSON events**:

| Event | Meaning |
|---|---|
| `stage` | A stage started or finished (with a one-line summary) |
| `file` | A file was read and its sheets recognised |
| `anomaly` | A cleaning finding |
| `progress` / `field` | A month or a business field was structured |
| `insight` / `recommendation` | A finding or an action was produced |
| `result` | The complete dataset |
| `error` | Something went wrong, in plain words |

- **Timing:** the real analysis of the sample (6,828 rows) takes about **0.7 seconds**. To make the steps readable, the server holds each stage on screen for about 1.5 seconds before reporting it done, so the owner sees *Cleaning… done → Structuring… done → Insights… done → Recommendations… done* in roughly 6–7 seconds. The pause can be turned off with `PIPELINE_PACE=0`.
- **Sign-in:** the endpoint only accepts signed-in users (checked against the backend's `users/me`).
- **n8n-ready:** setting `N8N_PIPELINE_WEBHOOK_URL` forwards uploads to an n8n flow instead. The app works unchanged as long as the flow emits the same events.
- **Storage:** results live in the browser tab (`sessionStorage`). A reload keeps them; every new sign-in starts empty.

### 7.2 What the owner sees

**Dashboard** (exploratory analysis)
- KPI strip: 6 metrics, each with a 12-month trend line and a change badge, green for good news and red for bad (rising costs show red).
- **"3 things need your attention":** each finding's headline number and the action to try, linking to Strategy.
- **Demand:** occupancy vs baseline bars, a season heatmap with 5 occupancy bands, full history, occupancy by night of the week, length of stay.
- **Money:** revenue vs costs, costs by type, revenue by channel, cost per occupied room night.
- **Guests:** rating over time, rating spread, complaint themes.

**Strategy:** the actions. Each shows *Try this*, *What we noticed* (now vs usual bars), *What to aim for* (today → target), and *How we'll measure it*. Steps, the arithmetic and the assumptions sit behind *Show details*.

**Data:** where every row went, what was cleaned, the four outcome lists, file by file, the business fields, the monthly table (CSV download) and the fix list.

**First-run tour:** an 8-step walkthrough (Dashboard → Strategy → the Data tab → Ask Yoonie → "That's it"), mobile first, shown once per sign-in and replayable from the *Tour* button.

---

## 8. Ask Yoonie: chat grounded in the owner's data

| | |
|---|---|
| Model | Claude Haiku 5.5 via OpenRouter, low reasoning effort, up to 2,000 output tokens, up to 6 tool-call steps |
| Cost | $0.10 / $0.50 per million input / output tokens ≈ **$0.001–0.003 per question** |
| Speed | about 1–6 seconds, streamed as it writes |
| Opening it | *Ask Yoonie* button or **⌘K / Ctrl+K**; available only after an analysis |

### How it stays grounded
With each question, the app sends the structured dataset (not the raw files). The model **cannot see numbers directly**; it has to call tools that calculate them:

| Tool | Answers |
|---|---|
| `get_monthly_metrics` | Any month's occupancy, revenue, ADR, RevPAR, costs, margin, rating, complaints |
| `compare_periods` | Two date ranges side by side (e.g. this July vs last July) |
| `expense_breakdown` | Costs by type for a period |
| `channel_mix` | Room revenue by booking channel |
| `get_patterns` | Occupancy by night of the week, length of stay, star ratings, complaint themes |
| `get_yearly_summary` | One row per year |
| `get_insights` / `get_recommendations` | The findings and the actions, with their evidence |
| `get_data_issues` | What cleaning found, by sheet and row |

### The instructions it follows
- Lead with the answer and what it means, then the most useful next move.
- Every number must come from a tool result; never invent figures, bookings or guests.
- For "why" questions, name the 1–2 most likely drivers as things to check ("points to…", "likely…"), never as proven causes.
- No disclaimer paragraphs about missing data.
- Targets are things to test.
- Point to the right tab. Steer off-topic questions back in one sentence.
- It sees monthly data, not individual bookings: asked *"Who stayed in room 204?"* it says so in one sentence and offers what it can answer.

Without an API key, the chat falls back to fixed, data-templated answers so the demo still works.

---

## 9. The sample hotel: Sam's Garden House

A **fictional** 20-room boutique hotel in Chiang Mai (rooms 101–110 and 201–210), Jan 2024 – Oct 2026, generated by `scripts/generate-demo-data.mjs` (`npm run demo:data`). The generator is deterministic, so every run produces the same files:

- 5,906 bookings plus 199 cancellations
- 411 expense lines
- 306 reviews

### The story built into the data
- July baseline ≈ **70%** (2024: 70.5%, 2025: 69.5%); July 2026 = **56%**, a 20% drop, mostly midweek.
- Utilities up about 22% from May 2026, plus an unusual **฿71,400** electricity bill in August 2026.
- Bathroom and cleanliness complaints rising from May 2026; ratings slipping.

### The mess built in on purpose
**Bookings**
- One sheet per year, with column names that change between years
- Dates in three formats
- Amounts typed as `"฿1,850"`
- 9 blank amounts and a `TBC`
- A ฿28,000 typo for one night
- A stay that departs before it arrives
- 3 missing departures
- A blank room number
- 6 copy-pasted duplicates
- Channels spelled 16 ways
- An old "Summary" tab with notes from Mum

**Expenses**
- The same bill named three ways (`Elec`, `Electricity`, `PEA electricity bill`)
- A bill entered twice
- A refund
- A missing water bill
- An unrecognised "Garden" expense

**Reviews**
- Booking.com ratings out of 10 mixed with 5-star ratings
- One undated review

Every one of these is caught by Stage 1 (section 3.4). Nothing here is real customer data.

---

## 10. Safeguards, known limits, and what comes next

### Safeguards
- Doubtful money is excluded until confirmed; plausible oddities are kept but flagged; every exclusion has a reason and a row number.
- Unusual bills are re-checked against the same month last year, and trends are recalculated without flagged bills.
- Findings need a minimum amount of history (12+ months for baselines, 18 months of costs, 9 months of reviews) and clear thresholds before they're reported.
- Every finding states what it doesn't prove; every target is labelled a target; no revenue effect is claimed without data.
- The chat can't produce a number without a tool calculating it.
- Studio routes require sign-in; results stay in the owner's browser tab.

### Known limits
- **Results aren't saved in the backend** yet: they live in one browser tab.
- **"Did it work?" isn't automatic yet.** Actions show their baselines, but comparing new months against them still needs building.
- **Hotel size is inferred** from room numbers (flagged for confirmation).
- **Dates default to DD/MM** when ambiguous (stated to the owner).
- **Complaint themes use English keyword patterns**; Thai-language reviews aren't covered yet.
- **Three detectors** today: seasonal demand gaps, cost lines outgrowing revenue, rising complaints.
- **Not yet validated with real operators**: thresholds and actions need pilot feedback.

### What comes next
1. **Backend analysis jobs:** upload creates a job, a worker runs the same engine, the app polls for status, and results are saved per hotel.
2. **Connect once:** sign in with Google, pick the Sheets and the period, and sync on a schedule (daily, weekly or monthly), with the brief delivered by email, LINE or the dashboard.
3. **Outcome measurement:** compare new data against each action's baseline and report whether it worked.
4. **More detectors and actions:** channel dependence, pricing by night of week, length-of-stay patterns, maintenance cycles.
5. **Pilot validation:** run with 3–5 independent hotels and measure how often recommendations are useful and acted on.
