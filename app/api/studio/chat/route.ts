import { streamText, isStepCount } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { requireUser } from "@/lib/domain/studio/server/guard";
import { instructions, scriptedAnswer, studioTools } from "@/lib/domain/studio/server/chat";
import { chartsForPrompt } from "@/lib/domain/studio/server/chat-charts";
import { ungroundedNumbers } from "@/lib/domain/studio/server/grounding";
import { CHART_SEP, RESTART, matchPrompt, type ChatChart } from "@/lib/domain/studio/chat-charts";
import type { ChatBody } from "@/lib/types/studio";

/**
 * POST { messages, dataset } → streamed plain text: the answer, then (only when there are
 * charts) U+001E and `{"charts":[...]}`. See lib/domain/studio/chat-charts.ts.
 *
 * With OPENROUTER_API_KEY the model answers through tools over the owner's dataset
 * (Claude Haiku 5.5: cheap, fast, good at tool calls). Without a key it falls back to
 * scripted, data-templated answers so the demo still works.
 *
 * Suggested prompts (the chips) get extra care: their charts are fixed by the server, and the
 * answer is held back until every number in it is found in what the model was shown. If one
 * isn't, the owner gets the scripted answer instead.
 */

export const maxDuration = 60;

/** $0.10 / $0.50 per million tokens on OpenRouter, with tool calling: about $0.001–0.003 per question. */
const MODEL = "anthropic/claude-haiku-5.5";

const HEADERS = { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" };

/** the model's text must never contain the control characters, or the client would act on them */
const clean = (s: string) => s.replaceAll(CHART_SEP, "").replaceAll(RESTART, "");
const tail = (charts: ChatChart[]) => (charts.length ? `${CHART_SEP}${JSON.stringify({ charts })}` : "");

export async function POST(req: Request) {
  const denied = await requireUser(req);
  if (denied) return denied;

  let body: ChatBody;
  try {
    body = (await req.json()) as ChatBody;
  } catch {
    return Response.json({ message: "Invalid request." }, { status: 400 });
  }
  const { dataset } = body;
  const messages = (body.messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12)
    .map((m) => ({ role: m.role, content: clean(m.content).slice(0, 2000) }));
  if (
    !dataset?.months?.length ||
    !Array.isArray(dataset.recommendations) ||
    !Array.isArray(dataset.insights) ||
    messages.at(-1)?.role !== "user"
  )
    return Response.json({ message: "Upload your data first, then ask a question." }, { status: 400 });

  const question = messages.at(-1)!.content;
  const prompt = matchPrompt(dataset, question);
  let fixedCharts: ChatChart[] = [];
  try {
    fixedCharts = prompt ? chartsForPrompt(dataset, prompt) : [];
  } catch (error) {
    console.error("[chat] charts", error); // a chart must never cost the owner their answer
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(clean(scriptedAnswer(dataset, question)) + tail(fixedCharts), { headers: HEADERS });
  }

  const toolCharts: ChatChart[] = [];
  const system = instructions(dataset, fixedCharts);
  const openrouter = createOpenRouter({ apiKey, appName: "Yoonie", appUrl: "https://yoonie.app" });
  const result = streamText({
    // Haiku 5.5 thinks before answering, and thinking counts toward the output cap: keep it
    // low and leave room, or answers get cut off ("finish: length") or come back empty.
    model: openrouter(MODEL, { reasoning: { effort: "low", exclude: true } }),
    instructions: system,
    messages,
    // suggested prompts: charts are fixed, so the model gets no chart tool
    tools: studioTools(dataset, prompt ? null : toolCharts),
    stopWhen: isStepCount(6),
    maxOutputTokens: 2000,
    abortSignal: req.signal,
    onError: ({ error }) => console.error("[chat]", error),
  });

  const enc = new TextEncoder();

  if (prompt) {
    // Hold the answer, check every figure, then send it in one go.
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let text = "";
        try {
          // only the last step's text: earlier steps can hold a draft the model then corrects
          text = await result.text;
          const outputs = (await result.steps).flatMap((s) => s.toolResults.map((r) => r.output));
          const sources = [system, ...messages.map((m) => m.content), JSON.stringify(outputs)];
          const bad = ungroundedNumbers(text, sources);
          if (!text.trim() || bad.length) {
            if (bad.length) console.warn("[chat] ungrounded figures, using scripted answer:", bad, "\n", text);
            text = scriptedAnswer(dataset, question, { note: false });
          }
        } catch (error) {
          if (req.signal.aborted) return controller.close();
          console.error("[chat]", error);
          text = scriptedAnswer(dataset, question, { note: false });
        }
        controller.enqueue(enc.encode(clean(text).trim() + tail(fixedCharts)));
        controller.close();
      },
    });
    return new Response(stream, { headers: HEADERS });
  }

  // Free-form questions: stream as it's written, charts (if the model asked for any) at the end.
  // If a step wrote text and then called tools, the next step's text replaces it (RESTART).
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        let wrote = false;
        let restart = false;
        for await (const part of result.fullStream) {
          if (part.type === "text-delta" && part.text) {
            if (restart) controller.enqueue(enc.encode(RESTART));
            restart = false;
            wrote = true;
            controller.enqueue(enc.encode(clean(part.text)));
          } else if (part.type === "finish-step") {
            if (wrote) restart = true;
            wrote = false;
          }
        }
        controller.enqueue(enc.encode(tail(toolCharts)));
      } catch (error) {
        if (!req.signal.aborted) console.error("[chat]", error);
      }
      controller.close();
    },
  });
  return new Response(stream, { headers: HEADERS });
}
