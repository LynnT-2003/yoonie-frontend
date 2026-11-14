import { runPipeline, type InputFile } from "@/lib/domain/studio/engine/run";
import { requireUser } from "@/lib/domain/studio/server/guard";
import type { PipelineEvent } from "@/lib/types/studio";

/**
 * POST multipart/form-data
 *   files:        one or more .xlsx / .xls / .csv files
 *   demo=1:       use the bundled sample hotel instead of uploads
 *   propertyName: optional display name
 *
 * Streams PipelineEvent objects as NDJSON while Clean → Structure → Insights → Recommendations run.
 *
 * Stand-in for the n8n flow: set N8N_PIPELINE_WEBHOOK_URL and this route forwards the same form
 * to n8n and relays its stream. The n8n flow must emit the same NDJSON events
 * (see lib/types/studio).
 */

export const maxDuration = 120;

const DEMO_FILES = [
  "Sams-Garden-House-bookings-2024-2026.xlsx",
  "Sams-Garden-House-expenses.csv",
  "Sams-Garden-House-guest-reviews.xlsx",
];
const MAX_FILES = 10;
const MAX_BYTES = 4 * 1024 * 1024; // Vercel functions accept bodies up to 4.5 MB

export async function POST(req: Request) {
  const denied = await requireUser(req);
  if (denied) return denied;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ message: "Send the files as multipart/form-data." }, { status: 400 });
  }

  const n8n = process.env.N8N_PIPELINE_WEBHOOK_URL;
  if (n8n) {
    const upstream = await fetch(n8n, { method: "POST", body: form, signal: req.signal });
    if (!upstream.ok || !upstream.body)
      return Response.json({ message: "The analysis workflow is unavailable." }, { status: 502 });
    return new Response(upstream.body, { headers: streamHeaders });
  }

  const demo = form.get("demo") === "1";
  let files: InputFile[];
  if (demo) {
    files = await Promise.all(
      DEMO_FILES.map(async (name) => {
        const res = await fetch(new URL(`/demo/${name}`, req.url));
        if (!res.ok) throw new Error(`sample file missing: ${name}`);
        return { name, data: await res.arrayBuffer() };
      })
    );
  } else {
    const uploads = form.getAll("files").filter((f): f is File => f instanceof File);
    if (!uploads.length) return Response.json({ message: "Add at least one spreadsheet." }, { status: 400 });
    if (uploads.length > MAX_FILES) return Response.json({ message: `Up to ${MAX_FILES} files at a time.` }, { status: 400 });
    if (uploads.reduce((s, f) => s + f.size, 0) > MAX_BYTES)
      return Response.json({ message: "Files are over 4 MB in total. Try fewer at a time." }, { status: 413 });
    const bad = uploads.find((f) => !/\.(xlsx|xlsm|xls|csv)$/i.test(f.name));
    if (bad) return Response.json({ message: `"${bad.name}" isn't a spreadsheet (.xlsx, .xls or .csv).` }, { status: 400 });
    files = await Promise.all(uploads.map(async (f) => ({ name: f.name, data: await f.arrayBuffer() })));
  }

  const name = String(form.get("propertyName") ?? "").slice(0, 80) || (demo ? "Sam's Garden House (sample)" : "Your hotel");
  const pace = Number(process.env.PIPELINE_PACE ?? "1");
  const encoder = new TextEncoder();
  let cancelled = false;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (e: PipelineEvent) => controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
      try {
        for await (const event of runPipeline(files, { propertyName: name, pace: Number.isFinite(pace) ? pace : 1 })) {
          if (cancelled) break;
          send(event);
        }
      } catch (err) {
        console.error("[pipeline]", err);
        if (!cancelled) send({ type: "error", message: "Something went wrong while reading your files." });
      }
      if (!cancelled) controller.close();
    },
    cancel() {
      cancelled = true;
    },
  });

  return new Response(stream, { headers: streamHeaders });
}

const streamHeaders = {
  "Content-Type": "application/x-ndjson; charset=utf-8",
  "Cache-Control": "no-store, no-transform",
  "X-Accel-Buffering": "no",
};
