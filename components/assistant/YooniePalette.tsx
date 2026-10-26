"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog as DialogPrimitive } from "radix-ui";
import {
  ArrowRight,
  BedDouble,
  Building2,
  Clock,
  Compass,
  CornerDownLeft,
  LayoutGrid,
  MessageSquarePlus,
  Sparkles,
  Users,
} from "lucide-react";
import { YoonieMascot } from "@/components/mascot/YoonieMascot";
import { ApiError } from "@/lib/domain/api/ApiError";
import { askStaffYoonie, type AssistantPage } from "@/lib/domain/assistant/assistant-api";
import { hospitalityKeys } from "@/lib/domain/hospitality/hospitality-api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { Rich } from "./YoonieChat";

// ─── where you are ───────────────────────────────────────────────────────────

const PAGES: { page: AssistantPage; label: string; href: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { page: "rooms", label: "Rooms", href: "/ops/rooms", icon: LayoutGrid },
  { page: "guests", label: "Guests", href: "/ops/guests", icon: Users },
  { page: "services", label: "Services", href: "/ops/services", icon: Compass },
  { page: "dispatch", label: "Dispatch", href: "/ops/dispatch", icon: Clock },
  { page: "property", label: "Property", href: "/admin", icon: Building2 },
];

const pageOf = (pathname: string): AssistantPage =>
  PAGES.find((p) => pathname.startsWith(p.href))?.page ?? (pathname === "/" ? "rooms" : "other");

/** What's worth asking on each page; a focused room gets its own. */
function suggestionsFor(page: AssistantPage, roomNumber?: string): string[] {
  if (roomNumber) {
    return [
      `What's the status of room ${roomNumber}?`,
      `Who's in room ${roomNumber} and what do they owe?`,
      `Will room ${roomNumber} be ready in time?`,
      `Send room ${roomNumber} back to housekeeping`,
    ];
  }
  switch (page) {
    case "rooms":
      return [
        "Which rooms won't be ready in time?",
        "Who's arriving today, and is their room ready?",
        "Which rooms are still dirty?",
        "How full are we tonight?",
      ];
    case "guests":
      return ["Who's arriving today?", "Who still owes money?", "Any VIPs in house?", "Who checks out tomorrow?"];
    case "services":
      return [
        "Which tours are under-filled?",
        "What airport pickups are today?",
        "How much are services making today?",
        "Any spa slots free this afternoon?",
      ];
    case "dispatch":
      return ["What's late today?", "Which pickups haven't been accepted?", "Who has the most jobs?", "What should I do first?"];
    default:
      return ["What's late today?", "Who's arriving today?", "Which tours are under-filled?", "How full are we tonight?"];
  }
}

// ─── provider: ⌘K anywhere in ops, and the room you have open ───────────────

type YoonieCtx = { open: () => void; setFocusRoom: (roomNumber?: string) => void };
const Ctx = React.createContext<YoonieCtx | null>(null);

/** Lets a screen tell Yoonie what you're looking at (e.g. the room sheet). Safe outside the provider. */
export function useYoonieFocus(roomNumber?: string) {
  const ctx = React.useContext(Ctx);
  React.useEffect(() => {
    ctx?.setFocusRoom(roomNumber);
    return () => ctx?.setFocusRoom(undefined);
  }, [ctx, roomNumber]);
}

export const useYoonie = () => React.useContext(Ctx);

type Turn = { question: string; answer?: string; failed?: boolean };

export function YoonieProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [focusRoom, setFocusRoom] = React.useState<string>();

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = React.useMemo<YoonieCtx>(() => ({ open: () => setIsOpen(true), setFocusRoom }), []);

  return (
    <Ctx.Provider value={value}>
      {children}
      <YooniePalette open={isOpen} onOpenChange={setIsOpen} focusRoom={focusRoom} />
    </Ctx.Provider>
  );
}

// ─── the palette ─────────────────────────────────────────────────────────────

type Item =
  | { kind: "ask"; text: string; label: string }
  | { kind: "go"; href: string; label: string; icon: React.ComponentType<{ className?: string }> };

function YooniePalette({
  open,
  onOpenChange,
  focusRoom,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  focusRoom?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const page = pageOf(pathname);
  const here = PAGES.find((p) => p.page === page);

  const [query, setQuery] = React.useState("");
  const [turns, setTurns] = React.useState<Turn[]>([]);
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const threadRef = React.useRef<HTMLDivElement>(null);
  const thinking = turns.length > 0 && turns[turns.length - 1].answer === undefined;
  // one conversation per person per day
  const sessionId = `${user?._id ?? "staff"}-${new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" })}`;

  const items = React.useMemo<Item[]>(() => {
    const q = query.trim().toLowerCase();
    const asks: Item[] = q
      ? [{ kind: "ask", text: query.trim(), label: query.trim() }]
      : suggestionsFor(page, focusRoom).map((s) => ({ kind: "ask", text: s, label: s }));
    const gos: Item[] = PAGES.filter((p) => p.page !== page && (!q || p.label.toLowerCase().includes(q))).map((p) => ({
      kind: "go",
      href: p.href,
      label: `Go to ${p.label}`,
      icon: p.icon,
    }));
    return turns.length && !q ? [] : [...asks, ...gos];
  }, [query, page, focusRoom, turns.length]);

  React.useEffect(() => setActive(0), [query, turns.length]);
  // never carry half-typed text into the next opening: Enter would send it
  React.useEffect(() => {
    if (!open) setQuery("");
  }, [open]);
  React.useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [turns]);

  const ask = async (question: string) => {
    if (!question.trim() || thinking) return;
    setQuery("");
    setTurns((t) => [...t, { question }]);
    try {
      const { reply } = await askStaffYoonie({
        sessionId,
        message: question,
        context: { page, ...(focusRoom ? { roomNumber: focusRoom } : {}) },
      });
      setTurns((t) => t.map((x, i) => (i === t.length - 1 ? { ...x, answer: reply } : x)));
      // Yoonie acts as you: anything it changed shows on the boards straight away
      void queryClient.invalidateQueries({ queryKey: hospitalityKeys.all });
    } catch (err) {
      const answer =
        err instanceof ApiError && err.statusCode === 401
          ? "Please sign in again to keep using Yoonie."
          : "Sorry, I can't answer right now. Please try again in a moment.";
      setTurns((t) => t.map((x, i) => (i === t.length - 1 ? { ...x, answer, failed: true } : x)));
    } finally {
      inputRef.current?.focus();
    }
  };

  const run = (item?: Item) => {
    if (!item) return void ask(query);
    if (item.kind === "go") {
      router.push(item.href);
      onOpenChange(false);
      setQuery("");
      return;
    }
    void ask(item.text);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(items[active] ?? (query.trim() ? undefined : items[0]));
    }
  };

  const chip = focusRoom ? `Room ${focusRoom}` : (here?.label ?? "Ops");
  const ChipIcon = focusRoom ? BedDouble : (here?.icon ?? Sparkles);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
          className="fixed left-1/2 top-[10vh] z-50 flex max-h-[78vh] w-[min(42rem,calc(100vw-2rem))] -translate-x-1/2 flex-col overflow-hidden rounded-2xl border border-border/70 bg-surface/95 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.35)] outline-none backdrop-blur-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.97] data-[state=open]:slide-in-from-top-2 duration-150"
        >
          <DialogPrimitive.Title className="sr-only">Ask Yoonie</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Ask about this page or tell Yoonie what to do. Yoonie acts as you, with your permissions.
          </DialogPrimitive.Description>

          {/* input row */}
          <div className="flex items-center gap-3 border-b border-border/70 px-4">
            <YoonieMascot mood={thinking ? "thinking" : "happy"} size="xs" className="shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={turns.length ? "Ask a follow-up…" : `Ask Yoonie about ${chip.toLowerCase() === "ops" ? "today" : chip}…`}
              aria-label="Ask Yoonie"
              className="h-14 min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
            />
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
              <ChipIcon className="size-3.5" />
              {chip}
            </span>
          </div>

          {/* conversation */}
          {turns.length ? (
            <div ref={threadRef} className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
              {turns.map((t, i) => (
                <div key={i} className="space-y-2">
                  <p className="text-[13px] font-semibold text-foreground">{t.question}</p>
                  {t.answer === undefined ? (
                    <p className="flex items-center gap-1 py-1" aria-label="Yoonie is thinking">
                      {[0, 150, 300].map((d) => (
                        <span
                          key={d}
                          className="size-1.5 animate-bounce rounded-full bg-primary/60"
                          style={{ animationDelay: `${d}ms` }}
                        />
                      ))}
                    </p>
                  ) : (
                    <p
                      className={cn(
                        "border-l-2 pl-3 text-[13px] leading-relaxed",
                        t.failed ? "border-destructive text-destructive" : "border-primary/40 text-foreground"
                      )}
                    >
                      <Rich text={t.answer} />
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : null}

          {/* suggestions and shortcuts */}
          {items.length ? (
            <div className={cn("overflow-y-auto p-2", turns.length ? "max-h-40 border-t border-border/70" : "max-h-[60vh]")}>
              {items.map((item, i) => {
                const showHeader = i === 0 || items[i - 1].kind !== item.kind;
                const Icon = item.kind === "go" ? item.icon : Sparkles;
                return (
                  <React.Fragment key={`${item.kind}-${item.label}`}>
                    {showHeader ? (
                      <p className="px-2.5 pb-1 pt-2 text-[11px] font-medium text-muted-foreground">
                        {item.kind === "go" ? "Go to" : query.trim() ? "Ask Yoonie" : `Ask about ${chip}`}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => run(item)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors",
                        i === active ? "bg-secondary text-secondary-foreground" : "text-foreground"
                      )}
                    >
                      <Icon className={cn("size-4 shrink-0", item.kind === "ask" ? "text-primary" : "text-muted-foreground")} />
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {i === active ? (
                        item.kind === "go" ? (
                          <ArrowRight className="size-3.5 text-muted-foreground" />
                        ) : (
                          <CornerDownLeft className="size-3.5 text-muted-foreground" />
                        )
                      ) : null}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          ) : null}

          {/* footer */}
          <div className="flex items-center justify-between gap-3 border-t border-border/70 bg-muted/40 px-4 py-2 text-[11px] text-muted-foreground">
            <span className="truncate">Yoonie acts as you, with your permissions</span>
            <span className="flex shrink-0 items-center gap-3">
              {turns.length ? (
                <button
                  type="button"
                  onClick={() => {
                    setTurns([]);
                    inputRef.current?.focus();
                  }}
                  className="inline-flex items-center gap-1 hover:text-foreground"
                >
                  <MessageSquarePlus className="size-3.5" /> New
                </button>
              ) : null}
              <span className="hidden items-center gap-1 sm:inline-flex">
                <Kbd>↵</Kbd> ask <Kbd>↑</Kbd>
                <Kbd>↓</Kbd> move <Kbd>esc</Kbd> close
              </span>
            </span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-surface px-1 font-sans text-[10px] font-medium text-muted-foreground">
      {children}
    </kbd>
  );
}
