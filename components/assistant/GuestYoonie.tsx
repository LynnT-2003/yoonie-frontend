"use client";

import * as React from "react";
import { X } from "lucide-react";
import { YoonieMascot } from "@/components/mascot/YoonieMascot";
import { askGuestYoonie } from "@/lib/domain/assistant/assistant-api";
import { cn } from "@/lib/utils";
import { YoonieChat, useChatSession } from "./YoonieChat";

const SUGGESTIONS = [
  "What rooms do you have?",
  "Is anything free next weekend?",
  "Check my booking",
  "When is breakfast?",
];

/** The guest concierge on the booking site: a bubble that opens a chat panel (full screen on phones). */
export function GuestYoonie({ hotelName, className }: { hotelName?: string; className?: string }) {
  const [open, setOpen] = React.useState(false);
  const sessionId = useChatSession("yoonie:guest-session");

  return (
    <>
      {open ? (
        <div
          role="dialog"
          aria-label="Chat with Yoonie"
          className="fixed inset-0 z-50 flex flex-col bg-surface sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[34rem] sm:w-[24rem] sm:rounded-2xl sm:border sm:border-border sm:shadow-2xl"
        >
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <YoonieMascot mood="happy" size="xs" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">Yoonie</p>
              <p className="truncate text-xs text-muted-foreground">
                {hotelName ? `Your concierge at ${hotelName}` : "Your concierge"} · replies in seconds
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
          <YoonieChat
            greeting="Sawasdee ka! I'm Yoonie. Ask me about rooms, prices, tours and dining, or about your booking."
            suggestions={SUGGESTIONS}
            placeholder="Ask anything about your stay…"
            send={async (message) => (await askGuestYoonie({ sessionId, message })).reply}
          />
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Chat with Yoonie"}
        className={cn(
          "fixed bottom-6 right-6 z-50 items-center gap-2 rounded-full bg-primary py-2 pl-2 pr-4 text-sm font-medium text-primary-foreground shadow-xl transition-transform hover:scale-[1.03]",
          open ? "hidden sm:inline-flex" : "inline-flex",
          className
        )}
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-surface">
          <YoonieMascot mood={open ? "calm" : "happy"} size="xs" />
        </span>
        {open ? "Close" : "Ask Yoonie"}
      </button>
    </>
  );
}
