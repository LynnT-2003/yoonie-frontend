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
    actionHint: "Click 'Next' to navigate to the Housekeeping Command Board.",
  },
  {
    id: "hk-header-gauge",
    pageRoute: "/ops/housekeeping",
    targetId: "tour-hk-header",
    badge: "4/7 · Front-Desk Zero",
    title: "Front-Desk Zero Gauge",
    mascotMood: "thinking",
    speech:
      "We've arrived at the Housekeeping Command Board! Here is the Front-Desk Zero gauge, tracking the percentage of rooms inspected and key-ready for arriving guests.",
    actionHint: "Now take a look at how dirty rooms are prioritized below.",
  },
  {
    id: "hk-dirty-queue",
    pageRoute: "/ops/housekeeping",
    targetId: "tour-hk-dirty-column",
    badge: "5/7 · ETA Priority",
    title: "ETA & VIP Cleaning Priority",
    mascotMood: "worried",
    speech:
      "Here! This is the Dirty Rooms queue. Instead of cleaning in numeric room order, Yoonie automatically prioritizes rooms by the guest's flight arrival ETA and VIP status so no guest waits in the lobby!",
    actionHint: "Housekeeping staff tap 'Start Cleaning' to transition rooms to In Progress.",
  },
  {
    id: "dispatch-header",
    pageRoute: "/ops/dispatch",
    targetId: "tour-dispatch-header",
    badge: "6/7 · Daily Operations",
    title: "05:30 Morning Dispatch Hub",
    mascotMood: "checking",
    speech:
      "Welcome to Frontline Operations! Every morning at 05:30, this automated air-traffic controller processes all flight arrivals, VIP check-ins, and tour consolidations.",
    actionHint: "Notice the alert counter highlighting urgent actions for the day.",
  },
  {
    id: "dispatch-tasks",
    pageRoute: "/ops/dispatch",
    targetId: "tour-dispatch-tasks",
    badge: "7/7 · Bilingual Logistics",
    title: "Bilingual Driver & Tour Cards",
    mascotMood: "happy",
    speech:
      "Here! Staff get 1-click bilingual (English & Thai) driver dispatch cards with flight numbers, terminal meeting doors, and vehicle plates ready to copy and send!",
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
