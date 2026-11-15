/**
 * Small charts that ride along with a Yoonie chat answer.
 *
 * Wire format (plain text stream): the answer text, then, only when there are charts,
 * one ASCII record separator (U+001E) followed by `{"charts":[...]}`. A group separator
 * (U+001D) inside the text means "start over": the model drafted, looked something up, and
 * is writing the answer again, so only the text after the last one counts. The server strips
 * both characters from everything the model writes, so they only ever come from the server.
 * Chart numbers are computed on the server from the owner's dataset, never by the model.
 *
 * Shared by the route (server) and the chat UI (client).
 */
import { z } from "zod";
import type { Dataset } from "@/lib/types/studio";

export const CHART_SEP = "\u001e";
export const RESTART = "\u001d";

const format = z.enum(["percent", "currency", "count", "decimal"]);
const label = z.string().max(60);
const num = z.number().finite();

const lineChart = z.object({
  kind: z.literal("line"),
  title: z.string().max(90),
  format,
  points: z.array(z.object({ label, value: num.nullable() })).min(2).max(36),
  /** label of the point to mark */
  highlight: label.optional(),
});

const barChart = z.object({
  kind: z.literal("bars"),
  title: z.string().max(90),
  format,
  /** legend: the first series is `value`, the optional second is `prev` */
  series: z.tuple([label]).or(z.tuple([label, label])),
  rows: z
    .array(z.object({ label, value: num, prev: num.optional(), highlight: z.boolean().optional() }))
    .min(1)
    .max(12),
});

export const chatChartSchema = z.discriminatedUnion("kind", [lineChart, barChart]);
export type ChatChart = z.infer<typeof chatChartSchema>;

const MAX_CHARTS = 3;

/** Splits a raw reply into the text and its charts. Bad or missing chart JSON → no charts, text intact. */
export function parseReply(raw: string): { text: string; charts: ChatChart[] } {
  const at = raw.indexOf(CHART_SEP);
  const body = at < 0 ? raw : raw.slice(0, at);
  const text = body.slice(body.lastIndexOf(RESTART) + 1).trim();
  if (at < 0) return { text, charts: [] };
  try {
    const list = (JSON.parse(raw.slice(at + 1)) as { charts?: unknown }).charts;
    if (!Array.isArray(list)) return { text, charts: [] };
    const charts = list.flatMap((c) => {
      const ok = chatChartSchema.safeParse(c);
      return ok.success ? [ok.data] : [];
    });
    return { text, charts: charts.slice(0, MAX_CHARTS) };
  } catch {
    // charts still streaming in, or malformed: show the text alone
    return { text, charts: [] };
  }
}

/* ------------------------------------------------------- suggested prompts */

/**
 * The questions offered as chips. The server recognises them, attaches charts it picks itself
 * and checks every number in the answer before sending it.
 */
export type PromptId = "quiet" | "occupancy" | "fix" | "costs" | "complaints";

function quietMonth(ds: Pick<Dataset, "insights">) {
  return ds.insights.find((i) => i.area === "demand")?.title.match(/^(\w+)/)?.[1];
}

export function suggestedPrompts(ds: Pick<Dataset, "insights">): { id: PromptId; text: string }[] {
  const month = quietMonth(ds);
  return [
    month ? { id: "quiet", text: `Why was ${month} so quiet?` } : { id: "occupancy", text: "How was occupancy this year?" },
    { id: "fix", text: "What should I fix first?" },
    { id: "costs", text: "Are my costs under control?" },
    { id: "complaints", text: "What are guests complaining about?" },
  ];
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** The suggested prompt this question is, word for word (case and punctuation aside), or null. */
export function matchPrompt(ds: Pick<Dataset, "insights">, question: string): PromptId | null {
  const q = norm(question);
  const all: { id: PromptId; text: string }[] = [
    ...suggestedPrompts(ds),
    { id: "occupancy", text: "How was occupancy this year?" },
  ];
  return all.find((p) => norm(p.text) === q)?.id ?? null;
}
