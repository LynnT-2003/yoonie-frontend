import { streamText, isStepCount } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { requireUser } from "@/lib/domain/studio/server/guard";
import { instructions, scriptedAnswer, studioTools } from "@/lib/domain/studio/server/chat";
import type { ChatBody } from "@/lib/types/studio";

/**
 * POST { messages, dataset } → streamed plain text.
 *
 * With OPENROUTER_API_KEY the model answers through tools over the owner's dataset
 * (OPENROUTER_MODEL, default anthropic/claude-sonnet-5.5). Without a key it falls back to
 * scripted, data-templated answers so the demo still works.
 */

export const maxDuration = 60;

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
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
  if (!dataset?.months?.length || !Array.isArray(dataset.recommendations) || messages.at(-1)?.role !== "user")
    return Response.json({ message: "Upload your data first, then ask a question." }, { status: 400 });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(scriptedAnswer(dataset, messages.at(-1)!.content), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const openrouter = createOpenRouter({ apiKey, appName: "Yoonie", appUrl: "https://yoonie.app" });
  const result = streamText({
    model: openrouter(process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-5.5"),
    instructions: instructions(dataset),
    messages,
    tools: studioTools(dataset),
    stopWhen: isStepCount(6),
    maxOutputTokens: 700,
    abortSignal: req.signal,
    onError: ({ error }) => console.error("[chat]", error),
  });
  return result.toTextStreamResponse({ headers: { "Cache-Control": "no-store" } });
}
