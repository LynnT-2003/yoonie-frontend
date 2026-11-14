import type { Anomaly, Dataset, PipelineEvent, SheetStat, SourceFile } from "@/lib/types/studio";
import { readWorkbook, type RawSheet } from "./parse";
import { clean } from "./clean";
import { structure } from "./structure";
import { findInsights } from "./insights";
import { recommend } from "./recommend";
import { monthLabel } from "../format";

export interface InputFile {
  name: string;
  data: ArrayBuffer;
}

const SEVERITY_ORDER = { critical: 0, review: 1, info: 2 } as const;

/** How the owner would name each column we matched. */
const FIELD_NAME: Record<string, string> = {
  ref: "Booking ref", guest: "Guest", room: "Room", checkIn: "Check-in", checkOut: "Check-out", nights: "Nights",
  amount: "Amount", channel: "Channel", status: "Status", date: "Date", category: "Category",
  description: "Description", rating: "Rating", text: "Review", source: "Source",
};

function sheetStats(files: SourceFile[], anomalies: Anomaly[]): SheetStat[] {
  return files.flatMap((f) =>
    f.sheets.map((s) => {
      const here = anomalies.filter((a) => a.file === f.name && a.sheet === s.name);
      const rowsOf = (r: Anomaly["resolution"]) => here.filter((a) => a.resolution === r).reduce((n, a) => n + (a.row === null ? (a.count ?? 1) : 1), 0);
      return {
        file: f.name,
        sheet: s.name,
        kind: s.kind,
        rows: s.rows,
        setAside: s.kind === "unknown" ? s.rows : rowsOf("excluded"),
        needsYou: rowsOf("needs_owner"),
        tidied: rowsOf("normalised"),
        flagged: here.filter((a) => a.resolution === "kept_flagged" && a.row !== null).length,
      };
    })
  );
}

/**
 * Runs Clean → Structure → Insights → Recommendations and yields progress as it goes.
 *
 * This is the stand-in for the n8n flow. The analysis itself is real and deterministic.
 * Only the pacing is staged, so a person can watch each step happen. `pace` scales every
 * delay (0 = instant, e.g. for tests).
 */
export async function* runPipeline(
  files: InputFile[],
  opts: { propertyName?: string; pace?: number } = {}
): AsyncGenerator<PipelineEvent> {
  const pace = opts.pace ?? 1;
  const wait = (ms: number) => (pace > 0 ? new Promise((r) => setTimeout(r, ms * pace)) : Promise.resolve());

  /* ---------------- 1. Cleaning */
  yield { type: "stage", stage: "clean", status: "start" };
  yield { type: "log", stage: "clean", message: `Reading ${files.length} file${files.length > 1 ? "s" : ""}…` };
  await wait(500);

  const sheets: RawSheet[] = [];
  const sourceFiles: SourceFile[] = [];
  for (const f of files) {
    try {
      const s = readWorkbook(f.name, f.data);
      sheets.push(...s);
      const file: SourceFile = { name: f.name, sheets: s.map((x) => ({ name: x.sheet, kind: x.kind, rows: x.rows.length })) };
      sourceFiles.push(file);
      yield { type: "file", file };
      yield {
        type: "log",
        stage: "clean",
        message: `${f.name}: ${file.sheets.map((x) => `${x.name} → ${x.kind === "unknown" ? "not recognised" : x.kind} (${x.rows} rows)`).join(", ")}`,
      };
    } catch {
      yield { type: "log", stage: "clean", message: `${f.name}: couldn't be opened as a spreadsheet. Skipped.` };
    }
    await wait(350);
  }
  if (!sheets.some((s) => s.kind === "bookings")) {
    yield {
      type: "error",
      message: "No booking records found. Yoonie needs at least one sheet with room, check-in and check-out columns.",
    };
    return;
  }

  // columns named differently across sheets of the same kind (e.g. "Check In" vs "Arrival")
  const headerNotes: Anomaly[] = [];
  for (const kind of ["bookings", "expenses", "reviews"] as const) {
    const of = sheets.filter((s) => s.kind === kind);
    const variants = new Set(of.map((s) => Object.values(s.columns).map((i) => s.headers[i]).join("|")));
    if (of.length > 1 && variants.size > 1) {
      const field = kind === "bookings" ? "checkIn" : "date";
      const names = [...new Set(of.map((s) => s.headers[s.columns[field]]).filter(Boolean))];
      const examples: { before: string; after: string }[] = [];
      for (const s of of)
        for (const [f, i] of Object.entries(s.columns)) {
          const before = s.headers[i];
          const after = FIELD_NAME[f] ?? f;
          if (before && before.toLowerCase() !== after.toLowerCase() && !examples.some((e) => e.before === before) && examples.length < 8)
            examples.push({ before: `${before} (sheet ${s.sheet})`, after });
        }
      headerNotes.push({
        id: `hdr-${kind}`,
        kind: "format",
        severity: "info",
        file: of[0].file,
        row: null,
        field: "Columns",
        title: `Column names change between ${kind} sheets`,
        detail: `${variants.size} different layouts across ${of.length} sheets${names.length > 1 ? ` (e.g. ${names.map((n) => `"${n}"`).join(" vs ")})` : ""}. Matched automatically.`,
        resolution: "normalised",
        count: of.length,
        examples,
      });
    }
  }

  const cleaned = clean(sheets);
  const anomalies = [...headerNotes, ...cleaned.anomalies];
  // stream the urgent ones first, the rest in the order found
  const ordered = [...anomalies].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  for (const a of ordered) {
    yield { type: "anomaly", anomaly: a };
    await wait(a.severity === "info" ? 160 : 260);
  }
  const needsOwner = anomalies.filter((a) => a.resolution === "needs_owner").length;
  yield {
    type: "stage",
    stage: "clean",
    status: "done",
    summary: `${cleaned.rowsRead.toLocaleString("en-US")} rows read · ${anomalies.length} findings · ${cleaned.rowsExcluded} rows set aside · ${needsOwner} need you`,
  };
  await wait(500);

  /* ---------------- 2. Structuring */
  yield { type: "stage", stage: "structure", status: "start" };
  const st = structure(cleaned);
  const total = st.months.length;
  const fieldEvery = Math.max(1, Math.floor(total / st.fields.length));
  let fi = 0;
  for (let i = 0; i < total; i++) {
    const m = st.months[i];
    yield {
      type: "progress",
      stage: "structure",
      pct: (i + 1) / total,
      label: `${monthLabel(m.month)}: ${m.roomNightsSold} room nights, ${m.reviewCount} reviews`,
      month: { month: m.month, occupancy: m.occupancy, revenue: m.roomRevenue, costs: m.totalExpenses },
    };
    if ((i + 1) % fieldEvery === 0 && fi < st.fields.length) yield { type: "field", field: st.fields[fi++] };
    await wait(110);
  }
  while (fi < st.fields.length) {
    yield { type: "field", field: st.fields[fi++] };
    await wait(120);
  }
  for (const a of st.assumptions) {
    anomalies.push(a);
    yield { type: "anomaly", anomaly: a };
  }
  yield {
    type: "stage",
    stage: "structure",
    status: "done",
    summary: `${total} months · ${st.rooms} rooms · ${st.fields.length} business fields`,
  };
  await wait(500);

  /* ---------------- 3. Insights */
  yield { type: "stage", stage: "insights", status: "start" };
  yield { type: "log", stage: "insights", message: "Comparing each month with the same month in earlier years…" };
  await wait(700);
  const { insights, signals } = findInsights(st.months, cleaned.expenses, st.rooms);
  for (const ins of insights) {
    yield { type: "insight", insight: ins };
    await wait(700);
  }
  yield {
    type: "stage",
    stage: "insights",
    status: "done",
    summary: insights.length ? `${insights.length} things worth your attention` : "Nothing unusual found",
  };
  await wait(400);

  /* ---------------- 4. Recommendations */
  yield { type: "stage", stage: "recommend", status: "start" };
  yield { type: "log", stage: "recommend", message: "Turning each finding into an action you can measure…" };
  await wait(700);
  const recommendations = recommend(signals);
  for (const r of recommendations) {
    yield { type: "recommendation", recommendation: r };
    await wait(800);
  }
  yield {
    type: "stage",
    stage: "recommend",
    status: "done",
    summary: recommendations.length ? `Top ${recommendations.length} action${recommendations.length > 1 ? "s" : ""} ready` : "No actions yet",
  };

  const dataset: Dataset = {
    property: {
      name: opts.propertyName || "Your hotel",
      rooms: st.rooms,
      currency: "THB",
      from: st.months[0]?.month ?? "",
      to: st.months[st.months.length - 1]?.month ?? "",
    },
    files: sourceFiles,
    sheets: sheetStats(sourceFiles, anomalies),
    anomalies,
    fields: st.fields,
    months: st.months,
    kpis: st.kpis,
    kpiWindow: st.kpiWindow,
    insights,
    recommendations,
    stats: {
      rowsRead: cleaned.rowsRead,
      rowsUsed: cleaned.rowsRead - cleaned.rowsExcluded,
      rowsExcluded: cleaned.rowsExcluded,
      needsOwner,
    },
    generatedAt: new Date().toISOString(),
  };
  yield { type: "result", dataset };
}
