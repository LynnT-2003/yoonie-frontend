"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";

export type OnboardingStepInfo = {
  id: string;
  pageRoute: string;
  pageName: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  elementsWalkthrough: Array<{
    name: string;
    description: string;
    endpoint?: string;
    badge?: string;
  }>;
};

export const ONBOARDING_STEPS: OnboardingStepInfo[] = [
  {
    id: "booking-engine",
    pageRoute: "/",
    pageName: "Direct Booking Engine",
    badge: "Page 1: Direct-Channel Booking",
    title: "Direct Composite Booking Engine",
    subtitle: "Combines room nights, waterside dining, and airport minivans in one checkout.",
    description:
      "This is the guest-facing digital front door. It enables independent boutique hotels to bypass high 15–25% OTA commissions by providing a frictionless composite reservation experience.",
    elementsWalkthrough: [
      {
        name: "Property & Stay Dates Bar",
        description:
          "Computes nights dynamically and verifies property settings (VAT 7%, Service Charge 10%, check-in 14:00).",
        endpoint: "GET /branches",
        badge: "Settings",
      },
      {
        name: "Room Catalog & Availability",
        description:
          "Displays Standard King, Deluxe River Balcony, and Pool Villa. Never computes room availability from room keys — queries atomic bookable inventory slots.",
        endpoint: "GET /inventory/availability",
        badge: "Atomic Slot",
      },
      {
        name: "Composite Add-on Experiences",
        description:
          "Guests can bundle Bangkok Airport Minivan transfers, Chao Phraya Sunset Cruises, and Riverside Terrace dining in the same cart.",
        endpoint: "GET /services & GET /restaurants",
        badge: "Multi-Product",
      },
      {
        name: "15-Minute Atomic Hold Cart",
        description:
          "Locks inventory slots atomically ($inc: { held: +qty }). Live countdown with Yoonie mascot changing from thinking to worried if under 3 minutes.",
        endpoint: "POST /inventory/hold",
        badge: "Concurrency",
      },
      {
        name: "Direct Attribution Checkout",
        description:
          "Captures verified guest contacts (phone, LINE ID) and attaches UTM attribution (DIRECT_WEB). Generates bilingual airport pickup cards.",
        endpoint: "POST /orders & POST /orders/:id/confirm",
        badge: "Direct ROI",
      },
    ],
  },
  {
    id: "housekeeping",
    pageRoute: "/ops/housekeeping",
    pageName: "Housekeeping Command Board",
    badge: "Page 2: Front-Desk Zero",
    title: "Front-Desk Zero Housekeeping Board",
    subtitle: "Rooms cleaned in guest arrival ETA & VIP order, not numeric room order.",
    description:
      "A tablet-optimized command board for housekeeping leads and attendants. Eliminates the traditional hotel problem of VIP guests waiting in the lobby because their room wasn't cleaned in time.",
    elementsWalkthrough: [
      {
        name: "Front-Desk Zero Gauge",
        description:
          "Shows real-time percentage of rooms inspected and key-ready for handover.",
        badge: "Operational Metric",
      },
      {
        name: "ETA-Ranked Dirty Column",
        description:
          "Rooms sorted by guest arrival urgency. A guest whose flight lands at 09:40 is automatically prioritized at the top.",
        endpoint: "GET /rooms/housekeeping",
        badge: "dispatch-rules.ts",
      },
      {
        name: "In Progress Column",
        description:
          "Timestamped cleaning underway. Prevents duplicate cleaning by attendants.",
        badge: "Attendant View",
      },
      {
        name: "Clean & Inspected Columns",
        description:
          "Attendant finishes → flips to CLEAN. Supervisor signs off → flips to INSPECTED (green key-ready state).",
        endpoint: "PATCH /rooms/:id/cleaning",
        badge: "1-Tap Action",
      },
      {
        name: "Sleeping Mascot State",
        description:
          "When all rooms are inspected, Yoonie rests peacefully, confirming zero pending cleanings.",
        badge: "Mascot Reactive",
      },
    ],
  },
  {
    id: "dispatch",
    pageRoute: "/ops/dispatch",
    pageName: "05:30 Morning Dispatch Run-Sheet",
    badge: "Page 3: Frontline Operations",
    title: "Daily Morning Dispatch Hub",
    subtitle: "Automated air-traffic controller for tours, flight transfers, and turnarounds.",
    description:
      "Every morning at 05:30, the system evaluates all active bookings and flight arrivals to generate prioritized, idempotent task cards with natural-key deduplication.",
    elementsWalkthrough: [
      {
        name: "Task Severity & Urgency Score",
        description:
          "Every task is calculated with a priorityScore (e.g. 965 for early international flight pickups, 910 for VIP room turns).",
        endpoint: "GET /dispatch?serviceDate=YYYY-MM-DD",
        badge: "Priority Engine",
      },
      {
        name: "Tour Yield Consolidation",
        description:
          "Flags tours with booked pax below the 40% threshold or minViablePax. Computes projected THB loss and recommends WATCH or MERGE_OR_CANCEL.",
        badge: "Yield Optimizer",
      },
      {
        name: "Bilingual Airport Pickup Cards",
        description:
          "Ready-to-send English & Thai driver cards with flight numbers, vehicle plates, drivers, and meeting doors (with 1-click copy).",
        badge: "Bilingual Cards",
      },
      {
        name: "Task Status Progression",
        description:
          "Staff advance tasks: OPEN → ACKNOWLEDGED → IN_PROGRESS → DONE, maintaining live visibility across all hotel staff.",
        endpoint: "PATCH /dispatch/:id/status",
        badge: "Task Workflow",
      },
    ],
  },
  {
    id: "account",
    pageRoute: "/account",
    pageName: "Master Guest CDP",
    badge: "Page 4: Guest Loyalty & CDP",
    title: "Master Guest CDP & Account Portal",
    subtitle: "Own guest identity and track lifetime value without OTA data masking.",
    description:
      "When guests book directly, the hotel owns the relationship forever. This portal houses the guest's verified profile, loyalty tier, lifetime spend, and direct communication channels.",
    elementsWalkthrough: [
      {
        name: "VIP Tier & Score Badge",
        description:
          "Derived from lifetime spend in THB and total stay count. Enables personalized frontline recognition.",
        endpoint: "GET /users/me",
        badge: "Guest CDP",
      },
      {
        name: "Direct Communication Channels",
        description:
          "Stores phone (E.164), LINE User ID, and WhatsApp opt-in for automated transit cards and concierge messaging.",
        badge: "Frontline Messaging",
      },
      {
        name: "Unified Account Session",
        description:
          "Connected via JWT token rotation with silent refresh and multi-provider OAuth (Google, LINE).",
        endpoint: "POST /auth/refresh",
        badge: "Authentication",
      },
    ],
  },
];

type OnboardingContextValue = {
  isOpen: boolean;
  currentStepIndex: number;
  currentStep: OnboardingStepInfo;
  openTour: (stepIndex?: number) => void;
  closeTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  navigateAndInspect: (route: string) => void;
};

const OnboardingContext = React.createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);

  // Sync step with active route if opened
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const completed = localStorage.getItem("onboardingComplete");
      if (!completed) {
        setIsOpen(true);
      }
    }
  }, []);

  const currentStep = ONBOARDING_STEPS[currentStepIndex];

  const openTour = (stepIndex = 0) => {
    setCurrentStepIndex(stepIndex);
    setIsOpen(true);
  };

  const closeTour = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("onboardingComplete", "true");
    }
    setIsOpen(false);
  };

  const navigateAndInspect = (route: string) => {
    if (pathname !== route) {
      router.push(route);
    }
  };

  const nextStep = () => {
    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      navigateAndInspect(ONBOARDING_STEPS[nextIdx].pageRoute);
    } else {
      closeTour();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      navigateAndInspect(ONBOARDING_STEPS[prevIdx].pageRoute);
    }
  };

  const goToStep = (index: number) => {
    setCurrentStepIndex(index);
    navigateAndInspect(ONBOARDING_STEPS[index].pageRoute);
  };

  return (
    <OnboardingContext.Provider
      value={{
        isOpen,
        currentStepIndex,
        currentStep,
        openTour,
        closeTour,
        nextStep,
        prevStep,
        goToStep,
        navigateAndInspect,
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
