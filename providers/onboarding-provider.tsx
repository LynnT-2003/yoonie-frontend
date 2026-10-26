"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import type { MascotMood } from "@/components/mascot/YoonieMascot";
import { extractTenantSubdomain } from "@/lib/utils";

/**
 * Two separate tours: guests see the booking engine, staff see the ops board once signed in.
 * A tour never navigates outside its own audience, so it never runs into the login wall.
 */
export type TourAudience = "guest" | "ops";

export type SpotlightStep = {
  id: string;
  audience: TourAudience;
  pageRoute: string;
  targetId: string;
  label: string;
  title: string;
  mascotMood: MascotMood;
  speech: string;
  actionHint: string;
};

export const SPOTLIGHT_STEPS: SpotlightStep[] = [
  {
    id: "stay-search",
    pageRoute: "/",
    targetId: "tour-stay-search",
    audience: "guest",
    label: "Direct Booking",
    title: "Stay Search & Dates",
    mascotMood: "calm",
    speech:
      "Here! This is the Stay Search Bar. Pick your arrival and departure dates and guest count. Notice how it instantly calculates your stay nights and pulls live branch settings directly from the backend.",
    actionHint: "Click 'Next' to view the direct room selection catalog.",
  },
  {
    id: "room-catalog",
    pageRoute: "/",
    targetId: "tour-room-catalog",
    audience: "guest",
    label: "Atomic Inventory",
    title: "Direct Sanctuary Catalog",
    mascotMood: "checking",
    speech:
      "Here! These are the bookable rooms: Standard King, Deluxe River Balcony, and Private Pool Villa. Yoonie queries atomic bookable inventory slots, preventing double-bookings without paying 15–25% OTA commissions.",
    actionHint: "Click 'Choose Room' on any card to hold it in your composite cart.",
  },
  {
    id: "experience-addons",
    pageRoute: "/",
    targetId: "tour-experiences",
    audience: "guest",
    label: "Composite Cart",
    title: "Experiences & Dining Add-Ons",
    mascotMood: "happy",
    speech:
      "Here! Yoonie lets guests bundle airport minivans, Chao Phraya Sunset Cruises, and riverside dining into the exact same reservation checkout.",
    actionHint: "That's the guest side. Click 'Finish Tour' to try a booking yourself.",
  },
  {
    id: "rooms-board",
    pageRoute: "/ops/rooms",
    targetId: "tour-rooms-board",
    audience: "ops",
    label: "Live Rooms",
    title: "Every Key at a Glance",
    mascotMood: "thinking",
    speech:
      "This is the live room board: who is in each room tonight, who is arriving, and whether the room is ready. It only shows state — the work that changes it happens in Dispatch.",
    actionHint: "Click 'Next' to see where that work is done.",
  },
  {
    id: "dispatch-header",
    pageRoute: "/ops/dispatch",
    targetId: "tour-dispatch-header",
    audience: "ops",
    label: "Today's Runway",
    title: "Every Deadline on One Line",
    mascotMood: "checking",
    speech:
      "Dispatch is where every job in the hotel lives. The runway shows each room that must be ready and each flight that lands today, against a live 'now' line — late and tight jobs light up.",
    actionHint: "Now look at the to-do list below.",
  },
  {
    id: "dispatch-inbox",
    pageRoute: "/ops/dispatch",
    targetId: "tour-dispatch-inbox",
    audience: "ops",
    label: "One Queue",
    title: "Rooms, Pickups and Tours in Order",
    mascotMood: "worried",
    speech:
      "Rooms are ordered by when their guest arrives, not by room number. Housekeepers take rooms from the open pool on their phones; you can assign anyone here. Each job shows just its next step.",
    actionHint: "Changing a room here updates the room board and the staff app at the same time.",
  },
  {
    id: "dispatch-inspect",
    pageRoute: "/ops/dispatch",
    targetId: "tour-dispatch-inspect",
    audience: "ops",
    label: "Sign-off",
    title: "Inspect and Release",
    mascotMood: "happy",
    speech:
      "Clean rooms wait here for a supervisor. Pass releases the room for the guest; Fail sends it back with a reason the housekeeper sees on their phone.",
    actionHint: "You're all set! Click 'Finish Tour' to explore the operating system freely.",
  },
];

const DONE_KEY: Record<TourAudience, string> = {
  guest: "onboardingComplete:guest",
  ops: "onboardingComplete:ops",
};

const readDone = (audience: TourAudience) => {
  try {
    // the old single flag meant the guest tour had been seen
    return Boolean(
      localStorage.getItem(DONE_KEY[audience]) ||
        (audience === "guest" && localStorage.getItem("onboardingComplete"))
    );
  } catch {
    return true; // storage blocked: never nag
  }
};

/** Which tour belongs on this page: the booking engine, the ops board, or none (platform root, login, admin…). */
function audienceFor(pathname: string): TourAudience | null {
  if (typeof window === "undefined") return null;

  const hostname = window.location.hostname;
  const host = window.location.host;

  // 1. Staff / Ops Portal: anywhere under /ops or accessed via ops.<domain>
  if (pathname.startsWith("/ops") || hostname.startsWith("ops.")) {
    return "ops";
  }

  // 2. Direct Booking Engine: ONLY on tenant subdomains at root / (e.g. sedona.yoonie.app or bkk-riverside.yoonie.app)
  if (pathname === "/") {
    const tenantSlug = extractTenantSubdomain(host);
    if (tenantSlug) {
      return "guest";
    }
  }

  // 3. Platform Root (yoonie.app, www.yoonie.app, localhost:3000), Auth, Admin: No tour
  return null;
}

type OnboardingContextValue = {
  isOpen: boolean;
  /** this page's tour, or null where there is none */
  audience: TourAudience | null;
  steps: SpotlightStep[];
  currentStepIndex: number;
  currentStep: SpotlightStep;
  totalSteps: number;
  openTour: (stepIndex?: number) => void;
  closeTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
};

const OnboardingContext = React.createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [audience, setAudience] = React.useState<TourAudience | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);

  // follow the page: entering the booking engine or the ops board picks that tour,
  // and opens it once if this browser hasn't finished it
  const audienceRef = React.useRef<TourAudience | null>(null);
  React.useEffect(() => {
    const next = audienceFor(pathname);
    if (next === audienceRef.current) return;
    audienceRef.current = next;
    setAudience(next);
    setCurrentStepIndex(0);
    const open = Boolean(next && !readDone(next));
    setIsOpen(open);
    // start where step 1 lives (staff land on Dispatch after login; the ops tour starts on Rooms)
    const first = SPOTLIGHT_STEPS.find((s) => s.audience === next);
    const here = pathname === "/" && next === "ops" ? "/ops/rooms" : pathname;
    if (open && first && first.pageRoute !== here) router.push(first.pageRoute);
  }, [pathname, router]);

  const steps = React.useMemo(
    () => SPOTLIGHT_STEPS.filter((s) => s.audience === (audience ?? "guest")),
    [audience]
  );
  const currentStep = steps[currentStepIndex] ?? steps[0];

  const navigateToStep = React.useCallback(
    (stepIdx: number) => {
      const targetStep = steps[stepIdx];
      if (!targetStep) return;
      setCurrentStepIndex(stepIdx);
      // on ops.<domain>, "/" already shows the rooms board
      const here = pathname === "/" && audience === "ops" ? "/ops/rooms" : pathname;
      if (here !== targetStep.pageRoute) {
        router.push(targetStep.pageRoute);
      }
    },
    [steps, pathname, audience, router]
  );

  const openTour = (stepIndex = 0) => {
    if (!audience) return;
    setIsOpen(true);
    navigateToStep(stepIndex);
  };

  const closeTour = () => {
    if (audience) {
      try {
        localStorage.setItem(DONE_KEY[audience], "true");
      } catch {
        // storage blocked: the tour just shows again next visit
      }
    }
    setIsOpen(false);
  };

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      navigateToStep(currentStepIndex + 1);
    } else {
      closeTour();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      navigateToStep(currentStepIndex - 1);
    }
  };

  const goToStep = (index: number) => {
    if (index >= 0 && index < steps.length) {
      navigateToStep(index);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        isOpen: isOpen && audience !== null,
        audience,
        steps,
        currentStepIndex,
        currentStep,
        totalSteps: steps.length,
        openTour,
        closeTour,
        nextStep,
        prevStep,
        goToStep,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = React.useContext(OnboardingContext);
  if (!ctx) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return ctx;
}
