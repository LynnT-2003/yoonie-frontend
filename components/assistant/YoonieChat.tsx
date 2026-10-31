"use client";

import * as React from "react";
import { ArrowUp, Mic, MicOff } from "lucide-react";
import { YoonieMascot } from "@/components/mascot/YoonieMascot";
import { ApiError } from "@/lib/domain/api/ApiError";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "yoonie"; text: string; failed?: boolean };

/** **bold** and line breaks only: the assistants answer in light markdown. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <React.Fragment key={i}>
          {i > 0 ? <br /> : null}
          {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={j} className="font-semibold">
                {part.slice(2, -2)}
              </strong>
            ) : (
              <React.Fragment key={j}>{part}</React.Fragment>
            )
          )}
        </React.Fragment>
      ))}
    </>
  );
}

/**
 * The Yoonie conversation: messages, a typing indicator, suggestion chips and an input.
 * The caller decides who Yoonie is (guest concierge or staff assistant) through `send`.
 */
export function YoonieChat({
  greeting,
  suggestions,
  placeholder,
  send,
  onReply,
  className,
}: {
  greeting: string;
  suggestions: string[];
  placeholder: string;
  send: (message: string) => Promise<string>;
  /** after every answer, e.g. to refresh boards the assistant may have changed */
  onReply?: () => void;
  className?: string;
}) {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [draft, setDraft] = React.useState("");
  const [thinking, setThinking] = React.useState(false);
  const [listening, setListening] = React.useState(false);
  const recognitionRef = React.useRef<any>(null);
  const silenceTimerRef = React.useRef<any>(null);
  const latestTextRef = React.useRef("");
  const endRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking]);

  const toggleListening = () => {
    if (listening) {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      recognitionRef.current?.stop();
      setListening(false);
      const textToSend = latestTextRef.current.trim();
      if (textToSend) {
        ask(textToSend, true);
      }
      return;
    }
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input requires Google Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => {
      setListening(true);
      latestTextRef.current = "";
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      setDraft(transcript);
      latestTextRef.current = transcript;

      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        const textToSend = latestTextRef.current.trim();
        if (textToSend) {
          recognitionRef.current?.stop();
          setListening(false);
          ask(textToSend, true);
        }
      }, 1800);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const ask = async (text: string, forceVoice?: boolean) => {
    const message = text.trim();
    if (!message || thinking) return;
    setDraft("");
    setMessages((m) => [...m, { role: "user", text: message }]);
    setThinking(true);
    try {
      const reply = await send(message);
      setMessages((m) => [...m, { role: "yoonie", text: reply }]);

      if (forceVoice && typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const clean = reply.replace(/\*\*/g, "").replace(/\n/g, " ");
        const u = new SpeechSynthesisUtterance(clean);
        u.lang = "en-US";
        window.speechSynthesis.speak(u);
      }

      onReply?.();
    } catch (err) {
      const text =
        err instanceof ApiError && err.statusCode === 429
          ? "You're sending messages a little fast. Give me a moment and try again."
          : err instanceof ApiError && err.statusCode === 401
            ? "Please sign in again to keep chatting."
            : "Sorry, I can't answer right now. Please try again in a moment.";
      setMessages((m) => [...m, { role: "yoonie", text, failed: true }]);
    } finally {
      setThinking(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        <div className="flex items-end gap-2">
          <YoonieMascot mood="happy" size="xs" className="shrink-0" />
          <p className="max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-3.5 py-2.5 text-[13px] leading-relaxed text-foreground">
            {greeting}
          </p>
        </div>

        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-3.5 py-2.5 text-[13px] leading-relaxed text-primary-foreground">
                {m.text}
              </p>
            </div>
          ) : (
            <div key={i} className="flex items-end gap-2">
              <YoonieMascot mood={m.failed ? "worried" : "calm"} size="xs" className="shrink-0" />
              <p
                className={cn(
                  "max-w-[85%] rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-[13px] leading-relaxed",
                  m.failed ? "bg-danger-soft text-destructive" : "bg-muted text-foreground"
                )}
              >
                <Rich text={m.text} />
              </p>
            </div>
          )
        )}

        {thinking ? (
          <div className="flex items-end gap-2" aria-live="polite">
            <YoonieMascot mood="thinking" size="xs" className="shrink-0" />
            <p className="flex gap-1 rounded-2xl rounded-bl-sm bg-muted px-3.5 py-3" aria-label="Yoonie is typing">
              {[0, 150, 300].map((d) => (
                <span
                  key={d}
                  className="size-1.5 animate-bounce rounded-full bg-muted-foreground"
                  style={{ animationDelay: `${d}ms` }}
                />
              ))}
            </p>
          </div>
        ) : null}

        {!messages.length && !thinking ? (
          <div className="flex flex-wrap gap-1.5 pl-10 pt-1">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => void ask(s)}
                className="rounded-full border border-border bg-surface px-3 py-1.5 text-left text-xs text-foreground transition-colors hover:border-primary/50 hover:bg-muted"
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      <form
        className="flex items-end gap-2 border-t border-border p-3"
        onSubmit={(e) => {
          e.preventDefault();
          void ask(draft);
        }}
      >
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void ask(draft);
            }
          }}
          rows={1}
          maxLength={1000}
          placeholder={placeholder}
          aria-label="Message Yoonie"
          className="max-h-32 min-h-10 flex-1 resize-none rounded-xl border border-input bg-surface px-3 py-2.5 text-[13px] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
        />

        <button
          type="button"
          onClick={toggleListening}
          aria-label={listening ? "Stop listening" : "Speak to Yoonie"}
          title={listening ? "Listening... click to stop" : "Click to speak"}
          className={cn(
            "inline-flex size-10 shrink-0 items-center justify-center rounded-xl transition-all",
            listening
              ? "bg-red-500 text-white animate-pulse shadow-md"
              : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
        </button>
        <button
          type="submit"
          disabled={!draft.trim() || thinking}
          aria-label="Send"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
        >
          <ArrowUp className="size-4" />
        </button>
      </form>
    </div>
  );
}

/** A conversation id kept in this browser; "" when storage is blocked (each message stands alone then). */
export function useChatSession(key: string) {
  const [id] = React.useState(() => {
    const fresh = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) return saved;
      localStorage.setItem(key, fresh);
    } catch {
      // private window or blocked storage
    }
    return fresh;
  });
  return id;
}
