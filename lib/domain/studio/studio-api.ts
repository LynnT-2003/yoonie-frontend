"use client";

import { tokenStore } from "../api/tokenStore";
import { getCurrentUser } from "../user/user-api";
import type { ChatBody, PipelineEvent } from "../../types/studio";

/**
 * Streaming calls to the studio route handlers (Next.js, not the Nest backend).
 * NetworkManager doesn't stream, so these use fetch directly and borrow its session:
 * on a 401 they let NetworkManager refresh the token once (via users/me) and retry.
 */

async function authedFetch(url: string, init: RequestInit): Promise<Response> {
  const go = () =>
    fetch(url, {
      ...init,
      headers: { ...(init.headers ?? {}), ...(tokenStore.get() ? { Authorization: `Bearer ${tokenStore.get()}` } : {}) },
    });
  let res = await go();
  if (res.status === 401) {
    try {
      await getCurrentUser(); // NetworkManager refreshes the access token on 401
      res = await go();
    } catch {
      /* fall through with the 401 */
    }
  }
  return res;
}

async function errorMessage(res: Response) {
  try {
    const j = await res.json();
    if (j?.message) return String(j.message);
  } catch {
    /* not json */
  }
  return res.status === 401 ? "Please sign in again." : "Something went wrong. Please try again.";
}

export async function streamPipeline(
  input: { files: File[] } | { demo: true },
  onEvent: (e: PipelineEvent) => void,
  signal?: AbortSignal
) {
  const form = new FormData();
  if ("demo" in input) form.set("demo", "1");
  else for (const f of input.files) form.append("files", f, f.name);

  const res = await authedFetch("/api/studio/pipeline", { method: "POST", body: form, signal });
  if (!res.ok || !res.body) throw new Error(await errorMessage(res));

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += value;
    let nl: number;
    while ((nl = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (line) onEvent(JSON.parse(line) as PipelineEvent);
    }
  }
  if (buf.trim()) onEvent(JSON.parse(buf) as PipelineEvent);
}

export async function streamChat(body: ChatBody, onDelta: (text: string) => void, signal?: AbortSignal) {
  const res = await authedFetch("/api/studio/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok || !res.body) throw new Error(await errorMessage(res));
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let full = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    full += value;
    onDelta(full);
  }
  return full;
}
