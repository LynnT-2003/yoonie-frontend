"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { YoonieMascot } from "@/components/mascot/YoonieMascot";
import { useStudio } from "@/providers/studio-provider";
import { useAssistantDock } from "@/providers/assistant-dock";
import { cn } from "@/lib/utils";

/**
 * First-run walkthrough of the studio: Dashboard → Strategy → (point at) Data → Ask Yoonie → done.
 *
 * Starts on its own the first time results appear in a sign-in session, and can be replayed
 * with `useTour().start()`. Mobile first: on phones the card docks to the bottom of the screen
 * and the highlighted element is scrolled into view above it.
 */

type Step = {
  /** route the step lives on; the tour navigates there if needed */
  route?: string;
  /** `data-tour` value of the element to highlight; none = a centered card */
  target?: string;
  title: string;
  body: (ctx: { mobile: boolean }) => React.ReactNode;
};

const STEPS: Step[] = [
  {
    route: "/studio/dashboard",
    target: "kpis",
    title: "Your last 12 months",
    body: () => "Six numbers that matter, each compared with the year before. Green is good news, red needs a look.",
  },
  {
    route: "/studio/dashboard",
    target: "attention",
    title: "What needs your attention",
    body: () => "Yoonie's top findings from your data, each with an action to try. Tap one to open it.",
  },
  {
    route: "/studio/dashboard",
    target: "sections",
    title: "Dig deeper",
    body: () => "Demand, Money and Guests each have their own charts and the evidence behind every finding.",
  },
  {
    route: "/studio/strategy",
    target: "action",
    title: "Your action plan",
    body: () => "Each action shows what Yoonie noticed, what to aim for, and how you'll measure whether it worked.",
  },
  {
    route: "/studio/strategy",
    target: "details",
    title: "Details when you want them",
    body: () => "The steps, the maths behind the numbers, and the assumptions stay tucked away until you open them.",
  },
  {
    target: "nav-data",
    title: "Your data, cleaned",
    body: () => "The Data tab shows what Yoonie tidied, what needs your confirmation, and the full monthly table. Open it any time.",
  },
  {
    target: "ask",
    title: "Ask Yoonie anything",
    body: ({ mobile }) =>
      mobile ? (
        "Tap here to ask questions about your hotel. Answers come from your own numbers."
      ) : (
        <>
          Questions about your hotel? Press{" "}
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-xs font-semibold text-foreground">⌘K</kbd> or click here.
          Answers come from your own numbers.
        </>
      ),
  },
  {
    title: "That's it",
    body: () => "Go ahead and use Yoonie. Your strategy is ready whenever you are.",
  },
];

const SEEN_KEY = "yoonie.studio.tourSeen"; // cleared on every sign-in with the rest of the studio session

type TourValue = { start: () => void; active: boolean };
const Ctx = React.createContext<TourValue>({ start: () => {}, active: false });
export const useTour = () => React.useContext(Ctx);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const { dataset } = useStudio();
  const dock = useAssistantDock();
  const router = useRouter();
  const pathname = usePathname();
  const [index, setIndex] = React.useState<number | null>(null);

  const start = React.useCallback(() => {
    dock.setOpen(false); // the chat stays closed during the tour
    setIndex(0);
  }, [dock]);

  // keep the latest `start` without making the timer below depend on it: its identity changes
  // when the chat becomes available (right as results arrive), which would cancel the timer
  const startRef = React.useRef(start);
  React.useEffect(() => {
    startRef.current = start;
  }, [start]);

  // start once, the first time new results arrive in this session (not on a reload of old ones)
  const firstSeen = React.useRef<string | null | undefined>(undefined);
  React.useEffect(() => {
    const id = dataset?.generatedAt ?? null;
    if (firstSeen.current === undefined) {
      firstSeen.current = id;
      return;
    }
    if (!id || id === firstSeen.current) return;
    firstSeen.current = id;
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      /* blocked storage: show it */
    }
    if (!seen) {
      const t = setTimeout(() => startRef.current(), 700); // let the dashboard paint first
      return () => clearTimeout(t);
    }
  }, [dataset?.generatedAt]);

  const finish = React.useCallback(() => {
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
    setIndex(null);
    router.push("/studio/dashboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [router]);

  const go = React.useCallback(
    (i: number) => {
      if (i < 0) return;
      if (i >= STEPS.length) return finish();
      const route = STEPS[i].route;
      if (route && !pathname.startsWith(route)) router.push(route);
      setIndex(i);
    },
    [finish, pathname, router]
  );

  const value = React.useMemo(() => ({ start, active: index !== null }), [start, index]);
  return (
    <Ctx.Provider value={value}>
      {children}
      {index !== null && dataset ? <TourOverlay index={index} onNext={() => go(index + 1)} onBack={() => go(index - 1)} onClose={finish} /> : null}
    </Ctx.Provider>
  );
}

/* ------------------------------------------------------------- overlay */

function useIsMobile() {
  const [mobile, setMobile] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const on = () => setMobile(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return mobile;
}

function TourOverlay({ index, onNext, onBack, onClose }: { index: number; onNext: () => void; onBack: () => void; onClose: () => void }) {
  const step = STEPS[index];
  const mobile = useIsMobile();
  const [rect, setRect] = React.useState<DOMRect | null>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [cardH, setCardH] = React.useState(220);
  const isLast = index === STEPS.length - 1;

  // find the target (it may still be mounting after a route change), bring it into view, measure it
  React.useEffect(() => {
    setRect(null);
    if (!step.target) return;
    let tries = 0;
    let settle: ReturnType<typeof setTimeout> | undefined;
    const find = () => {
      const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
      if (!el) return false;
      const inNav = el.closest("header");
      if (!inNav) {
        const r = el.getBoundingClientRect();
        // phones: put it just under the top bar, above the docked card; desktop: centre it
        const top = mobile ? window.scrollY + r.top - 76 : window.scrollY + r.top - Math.max(80, (window.innerHeight - r.height) / 2);
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      }
      settle = setTimeout(() => setRect(el.getBoundingClientRect()), 420);
      return true;
    };
    if (find()) return () => clearTimeout(settle);
    const iv = setInterval(() => {
      if (find() || ++tries > 40) clearInterval(iv);
    }, 100);
    return () => {
      clearInterval(iv);
      clearTimeout(settle);
    };
  }, [step.target, index, mobile]);

  // follow scrolling / resizing
  React.useEffect(() => {
    if (!step.target) return;
    const update = () => {
      const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
      if (el) setRect(el.getBoundingClientRect());
    };
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [step.target]);

  React.useLayoutEffect(() => {
    if (cardRef.current) setCardH(cardRef.current.offsetHeight);
  }, [index, mobile, rect]);

  // keyboard: → / Enter next, ← back, Esc skip
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter") onNext();
      else if (e.key === "ArrowLeft") onBack();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onNext, onBack, onClose]);

  const pad = 8;
  const centered = !step.target;
  const waiting = Boolean(step.target) && !rect;

  // card placement: docked at the bottom on phones; next to the target on larger screens
  let cardStyle: React.CSSProperties;
  if (mobile || centered || !rect) {
    cardStyle = centered && !mobile ? { left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: 400 } : {};
  } else {
    const w = 380;
    const below = rect.bottom + pad + 14;
    const above = rect.top - pad - 14 - cardH;
    const top = below + cardH < window.innerHeight - 16 ? below : above > 16 ? above : Math.max(16, window.innerHeight - cardH - 16);
    const left = Math.max(16, Math.min(rect.left + rect.width / 2 - w / 2, window.innerWidth - w - 16));
    cardStyle = { top, left, width: w };
  }

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={`Tour: ${step.title}`}>
      {/* dim everything; cut a window around the target */}
      {rect ? (
        <div
          className="pointer-events-none fixed rounded-xl transition-all duration-300 ease-out"
          style={{
            top: rect.top - pad,
            left: rect.left - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
            boxShadow: "0 0 0 9999px rgba(20, 27, 24, 0.55), 0 0 0 2px #E8A45B",
          }}
        />
      ) : (
        <div className="fixed inset-0 bg-[rgba(20,27,24,0.55)] transition-opacity" />
      )}
      {/* clicks outside the card do nothing (use the buttons) */}
      <div className="fixed inset-0" onClick={(e) => e.stopPropagation()} />

      <div
        ref={cardRef}
        style={cardStyle}
        className={cn(
          "fixed rounded-2xl border border-border bg-surface p-5 text-foreground shadow-2xl transition-[top,left,opacity] duration-300 ease-out",
          mobile && "inset-x-3 bottom-[max(12px,env(safe-area-inset-bottom))]",
          waiting && "opacity-0"
        )}
      >
        {centered ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <YoonieMascot mood="happy" size="lg" />
            <h2 className="text-xl font-semibold tracking-tight">{step.title}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{step.body({ mobile })}</p>
            <Button className="mt-2 w-full" size="lg" onClick={onClose}>
              Start exploring
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-muted-foreground tabular-nums">
                {index + 1} of {STEPS.length - 1}
              </span>
              <button type="button" onClick={onClose} className="-mr-1 inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
                Skip <X className="size-3.5" />
              </button>
            </div>
            <h2 className="mt-2 text-base font-semibold tracking-tight">{step.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body({ mobile })}</p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="flex gap-1" aria-hidden>
                {STEPS.slice(0, -1).map((_, i) => (
                  <span key={i} className={cn("h-1.5 rounded-full transition-all", i === index ? "w-4 bg-primary" : "w-1.5 bg-border")} />
                ))}
              </div>
              <div className="flex gap-2">
                {index > 0 ? (
                  <Button variant="ghost" size="sm" onClick={onBack}>
                    Back
                  </Button>
                ) : null}
                <Button size="sm" onClick={onNext}>
                  {isLast ? "Done" : "Next"}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
