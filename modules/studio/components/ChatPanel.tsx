"use client";

import * as React from "react";
import { MessageCircle, X } from "lucide-react";
import { YoonieChat } from "@/components/assistant/YoonieChat";
import { streamChat } from "@/lib/domain/studio/studio-api";
import type { Dataset } from "@/lib/types/studio";
import { cn } from "@/lib/utils";

/** "Ask Yoonie": live chat grounded in the owner's own dataset. Docked on desktop, a sheet on mobile. */
export function ChatPanel({ dataset, className }: { dataset: Dataset; className?: string }) {
  const demand = dataset.insights.find((i) => i.area === "demand");
  const suggestions = [
    demand ? `Why was ${demandMonth(demand.title)} so quiet?` : "How was occupancy this year?",
    "What should I fix first?",
    "Are my costs under control?",
    "What are guests complaining about?",
  ];
  const send = React.useCallback(
    (message: string, history: { role: "user" | "assistant"; content: string }[], onDelta: (t: string) => void) =>
      streamChat({ messages: [...history, { role: "user", content: message }], dataset }, onDelta),
    [dataset]
  );
  return (
    <div className={cn("flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface", className)}>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-sm font-bold">Ask Yoonie</p>
          <p className="text-[11px] text-muted-foreground">Answers come from your own numbers</p>
        </div>
      </div>
      <YoonieChat
        key={dataset.generatedAt}
        greeting={`I've read ${dataset.stats.rowsRead.toLocaleString("en-US")} rows from ${dataset.property.name}. Ask me anything about how the hotel is doing.`}
        suggestions={suggestions}
        placeholder="Ask about your hotel…"
        send={send}
      />
    </div>
  );
}

function demandMonth(title: string) {
  const m = title.match(/^(\w+)/);
  return m ? m[1] : "that month";
}

/** Floating button + bottom sheet for small screens. */
export function ChatSheet({ dataset }: { dataset: Dataset }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="xl:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg"
      >
        <MessageCircle className="size-4" /> Ask Yoonie
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/30 sm:items-center sm:justify-center" onClick={() => setOpen(false)}>
          <div className="relative h-[85vh] w-full sm:h-[640px] sm:max-w-md" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="absolute right-3 top-3 z-10 rounded-md p-1.5 text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </button>
            <ChatPanel dataset={dataset} className="h-full rounded-b-none sm:rounded-2xl" />
          </div>
        </div>
      ) : null}
    </div>
  );
}

