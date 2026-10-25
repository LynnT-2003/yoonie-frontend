"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import type { MascotMood } from "@/components/mascot/YoonieMascot";

export type SpotlightStep = {
  id: string;
  pageRoute: string;
  targetId: string;
  badge: string;
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
    badge: "1/7 · Direct Booking",
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
    badge: "2/7 · Atomic Inventory",
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
    badge: "3/7 · Composite Cart",
    title: "Experiences & Dining Add-Ons",
    mascotMood: "happy",
    speech:
      "Here! Yoonie lets guests bundle airport minivans, Chao Phraya Sunset Cruises, and riverside dining into the exact same reservation checkout.",
    actionHint: "Click 'Next' to see the live room board.",
  },
  {
    id: "rooms-board",
    pageRoute: "/ops/rooms",
    targetId: "tour-rooms-board",
    badge: "4/7 · Live Rooms",
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
    badge: "5/7 · Today's Runway",
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
    badge: "6/7 · One Queue",
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
    badge: "7/7 · Sign-off",
    title: "Inspect and Release",
    mascotMood: "happy",
    speech:
      "Clean rooms wait here for a supervisor. Pass releases the room for the guest; Fail sends it back with a reason the housekeeper sees on their phone.",
    actionHint: "You're all set! Click 'Finish Tour' to explore the operating system freely.",
  },
];

type OnboardingContextValue = {
  isOpen: boolean;
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
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);

  // Initialize from localStorage if onboarding has not been completed
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const completed = localStorage.getItem("onboardingComplete");
      if (!completed) {
        setIsOpen(true);
      }
    }
  }, []);

  const currentStep = SPOTLIGHT_STEPS[currentStepIndex] || SPOTLIGHT_STEPS[0];

  const navigateToStep = React.useCallback(
    (stepIdx: number) => {
      const targetStep = SPOTLIGHT_STEPS[stepIdx];
      if (!targetStep) return;
      setCurrentStepIndex(stepIdx);
      if (pathname !== targetStep.pageRoute) {
        router.push(targetStep.pageRoute);
      }
    },
    [pathname, router]
  );

  const openTour = (stepIndex = 0) => {
    setIsOpen(true);
    navigateToStep(stepIndex);
  };

  const closeTour = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("onboardingComplete", "true");
    }
    setIsOpen(false);
  };

  const nextStep = () => {
    if (currentStepIndex < SPOTLIGHT_STEPS.length - 1) {
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
    if (index >= 0 && index < SPOTLIGHT_STEPS.length) {
      navigateToStep(index);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        isOpen,
        currentStepIndex,
        currentStep,
        totalSteps: SPOTLIGHT_STEPS.length,
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
