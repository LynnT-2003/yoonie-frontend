"use client";

import * as React from "react";
import Link from "next/link";
import { PanelRightClose } from "lucide-react";
import { YoonieChat } from "@/components/assistant/YoonieChat";
import { YoonieMascot } from "@/components/mascot/YoonieMascot";
import { streamChat } from "@/lib/domain/studio/studio-api";
import { useAssistantDock } from "@/providers/assistant-dock";
import { useStudio } from "@/providers/studio-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Ask Yoonie as a proper sidebar: part of the layout on wide screens (the page makes room),
 * a full-height side sheet on small ones. Toggled from the top bar or ⌘J.
 */
export function StudioShell({ children }: { children: React.ReactNode }) {
  const { open: wantOpen, setOpen, setAvailable } = useAssistantDock();
  const { dataset, run } = useStudio();
  const available = Boolean(dataset) && run.status !== "running";
  React.useEffect(() => {
    setAvailable(available);
    return () => setAvailable(false);
  }, [available, setAvailable]);
  if (!available) return <div className="min-w-0 flex-1">{children}</div>;
  const open = wantOpen;
  return (
    <div className="flex min-w-0 flex-1">
      <div className="min-w-0 flex-1">{children}</div>

      {/* small screens: dim the page behind the sheet */}
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={cn("fixed inset-0 top-14 z-30 bg-black/20 transition-opacity lg:hidden", open ? "opacity-100" : "pointer-events-none opacity-0")}
      />
      <aside
        aria-label="Ask Yoonie"
        aria-hidden={!open}
        inert={!open}
        className={cn(
          "fixed bottom-0 right-0 top-14 z-40 w-full border-l border-border bg-surface transition-transform duration-300 ease-out sm:w-[400px]",
          "lg:sticky lg:z-0 lg:h-[calc(100vh-3.5rem)] lg:shrink-0 lg:translate-x-0 lg:transition-[width]",
          open ? "translate-x-0 lg:w-[400px]" : "translate-x-full lg:w-0 lg:overflow-hidden lg:border-l-0"
        )}
      >
        <div className="flex h-full w-full flex-col sm:w-[400px]">
          <AssistantPanel onClose={() => setOpen(false)} />
        </div>
      </aside>
    </div>
  );
}

function AssistantPanel({ onClose }: { onClose: () => void }) {
  const { dataset } = useStudio();
  const send = React.useCallback(
    (message: string, history: { role: "user" | "assistant"; content: string }[], onDelta: (t: string) => void) =>
      dataset ? streamChat({ messages: [...history, { role: "user", content: message }], dataset }, onDelta) : Promise.resolve(""),
    [dataset]
  );
  const demandMonth = dataset?.insights.find((i) => i.area === "demand")?.title.match(/^(\w+)/)?.[1];

  return (
    <>
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <YoonieMascot mood="calm" size="xs" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">Ask Yoonie</p>
          <p className="truncate text-[11px] text-muted-foreground">{dataset ? `Answers from ${dataset.property.name}'s own numbers` : "Your pocket strategist"}</p>
        </div>
        <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground lg:inline">⌘J</kbd>
        <button
          type="button"
          onClick={onClose}
          aria-label="Hide Ask Yoonie"
          title="Hide (⌘J)"
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <PanelRightClose className="size-4" />
        </button>
      </header>
      {dataset ? (
        <YoonieChat
          key={dataset.generatedAt}
          greeting={`I've read ${dataset.stats.rowsRead.toLocaleString("en-US")} rows from ${dataset.property.name}. Ask me anything about how the hotel is doing.`}
          suggestions={[
            demandMonth ? `Why was ${demandMonth} so quiet?` : "How was occupancy this year?",
            "What should I fix first?",
            "Are my costs under control?",
            "What are guests complaining about?",
          ]}
          placeholder="Ask about your hotel…"
          send={send}
        />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          <YoonieMascot mood="sleeping" size="lg" />
          <p className="text-sm text-muted-foreground">Upload your spreadsheets first. Then I can answer questions from your own numbers.</p>
          <Button asChild size="sm" variant="secondary">
            <Link href="/studio">Upload</Link>
          </Button>
        </div>
      )}
    </>
  );
}
