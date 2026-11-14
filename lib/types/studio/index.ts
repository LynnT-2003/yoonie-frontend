/**
 * Wire contract for the Yoonie intelligence pipeline:
 * files → Clean → Structure → Insights → Recommendations.
 *
 * The pipeline endpoint streams `PipelineEvent`s as NDJSON (one JSON object per line).
 * Today it runs inside Next.js (`app/api/studio/pipeline`); a real n8n flow can replace it
 * as long as it emits the same events.
 */

export type StageId = "clean" | "structure" | "insights" | "recommend";

export const STAGES: { id: StageId; label: string; purpose: string }[] = [
  { id: "clean", label: "Cleaning", purpose: "Find what doesn't add up" },
  { id: "structure", label: "Structuring", purpose: "Extract the information that matters" },
  { id: "insights", label: "Insights", purpose: "Understand what is happening" },
  { id: "recommend", label: "Recommendations", purpose: "Know what to do next" },
];

export type SheetKind = "bookings" | "expenses" | "reviews" | "unknown";

export type Severity = "info" | "review" | "critical";

export type AnomalyKind =
  | "missing_value"
  | "duplicate"
  | "format"
  | "outlier"
  | "invalid"
  | "unrecognised"
  | "assumption";

/** What Yoonie did with the record. It never silently invents or overwrites a value. */
export type Resolution =
  | "excluded" // left out of the numbers (e.g. a duplicate)
  | "normalised" // same value, cleaner format (e.g. "฿1,850" → 1850)
  | "kept_flagged" // kept in the numbers but marked for review
  | "needs_owner"; // cannot be used until the owner confirms it

export interface Anomaly {
  id: string;
  kind: AnomalyKind;
  severity: Severity;
  file: string;
  sheet?: string;
  /** spreadsheet row number as the owner sees it (1-based, header included); null when it covers many rows */
  row: number | null;
  field?: string;
  title: string;
  detail: string;
  value?: string;
  resolution: Resolution;
  /** how many rows this covers when several identical issues are grouped */
  count?: number;
}

export interface SourceFile {
  name: string;
  sheets: { name: string; kind: SheetKind; rows: number }[];
}

export interface ExtractedField {
  key: string;
  label: string;
  /** where it came from, in plain words */
  source: string;
  /** share of the period with usable data, 0–1 */
  coverage: number;
}

export type ExpenseCategory =
  | "staff"
  | "utilities"
  | "housekeeping"
  | "maintenance"
  | "commissions"
  | "food"
  | "marketing"
  | "other";

export type ReviewTheme =
  | "cleanliness"
  | "bathroom"
  | "noise"
  | "staff"
  | "breakfast"
  | "wifi"
  | "aircon"
  | "location";

export interface MonthMetric {
  /** YYYY-MM */
  month: string;
  roomsAvailable: number;
  roomNightsSold: number;
  occupancy: number;
  weekdayOccupancy: number;
  weekendOccupancy: number;
  roomRevenue: number;
  /** room nights whose revenue is unconfirmed, so ADR uses confirmed nights only */
  unpricedNights: number;
  adr: number;
  revpar: number;
  bookings: number;
  channelRevenue: Record<string, number>;
  expenses: Partial<Record<ExpenseCategory, number>>;
  totalExpenses: number | null;
  operatingProfit: number | null;
  margin: number | null;
  reviewCount: number;
  avgRating: number | null;
  complaints: Partial<Record<ReviewTheme, number>>;
}

export interface Evidence {
  label: string;
  value: string;
}

export type InsightKind = "anomaly" | "trend" | "correlation";

export interface Insight {
  id: string;
  kind: InsightKind;
  area: "demand" | "cost" | "guest";
  title: string;
  detail: string;
  evidence: Evidence[];
  confidence: "high" | "medium" | "low";
  /** what this does NOT prove */
  caveat: string;
  /** the month the finding is about, when there is one (YYYY-MM) */
  focusMonth?: string;
}

export interface NumberLine {
  label: string;
  value: string;
  /** how the number was calculated */
  basis: string;
}

export interface Recommendation {
  id: string;
  rank: number;
  area: Insight["area"];
  insightId: string;
  title: string;
  /** Cause: what the data shows */
  cause: { observation: string; evidence: Evidence[] };
  /** Action: what to try */
  action: { summary: string; steps: string[] };
  /** Effect: the target the owner sets out to hit (a target, not a forecast) */
  effect: { target: string; metric: string };
  /** Numbers: the arithmetic behind the size of the opportunity */
  numbers: NumberLine[];
  /** How the owner will know it worked */
  measurement: {
    window: string;
    compareAgainst: string;
    metrics: { label: string; baseline: string }[];
  };
  assumptions: string[];
}

export interface Kpi {
  key: "occupancy" | "adr" | "revpar" | "margin" | "rating";
  label: string;
  current: number | null;
  previous: number | null;
  format: "percent" | "currency" | "rating";
}

export interface Dataset {
  property: {
    name: string;
    rooms: number;
    currency: string;
    from: string;
    to: string;
  };
  files: SourceFile[];
  anomalies: Anomaly[];
  fields: ExtractedField[];
  months: MonthMetric[];
  kpis: Kpi[];
  kpiWindow: { current: string; previous: string };
  insights: Insight[];
  recommendations: Recommendation[];
  stats: {
    rowsRead: number;
    rowsUsed: number;
    rowsExcluded: number;
    needsOwner: number;
  };
  generatedAt: string;
}

export type PipelineEvent =
  | { type: "stage"; stage: StageId; status: "start" | "done"; summary?: string }
  | { type: "log"; stage: StageId; message: string }
  | { type: "file"; file: SourceFile }
  | { type: "anomaly"; anomaly: Anomaly }
  | { type: "progress"; stage: StageId; pct: number; label: string }
  | { type: "field"; field: ExtractedField }
  | { type: "insight"; insight: Insight }
  | { type: "recommendation"; recommendation: Recommendation }
  | { type: "result"; dataset: Dataset }
  | { type: "error"; message: string };

export type ChatTurn = { role: "user" | "assistant"; content: string };

export interface ChatBody {
  messages: ChatTurn[];
  dataset: Dataset;
}
