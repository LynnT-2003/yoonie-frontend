"use client";

import * as React from "react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Compass,
  Sparkles,
  ShieldCheck,
  Clock,
  BedDouble,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { YoonieMascot, type MascotMood } from "@/components/mascot/YoonieMascot";

type OnboardingStep = {
  id: string;
  mood: MascotMood;
  mascotSpeech: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: Array<{ icon: typeof Sparkles; title: string; text: string }>;
};

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    mood: "calm",
    mascotSpeech: "Sawadee ka! I'm Yoonie, your hospitality companion.",
    badge: "Welcome to Yoonie OS",
    title: "Say Goodbye to 20% OTA Commissions",
    subtitle: "A unified hospitality operating system built for independent boutique hotels.",
    description:
      "Legacy PMS, disconnected POS, and paper clipboards cause lost revenue and guest friction. Yoonie bridges direct online booking with on-the-ground resource dispatch into one native data model.",
    highlights: [
      {
        icon: ShieldCheck,
        title: "Own Your Guests",
        text: "Direct bookings capture verified emails, phone numbers, and LINE IDs instead of masked OTA contacts.",
      },
      {
        icon: Sparkles,
        title: "Boutique Atmosphere",
        text: "Warm Linen and Forest Green design palette crafted specifically for tranquil riverside properties.",
      },
    ],
  },
  {
    id: "composite-cart",
    mood: "checking",
    mascotSpeech: "Rooms, dinner & airport transfers all in one cart!",
    badge: "Pillar 1: Direct Booking Engine",
    title: "Composite Cart Checkout",
    subtitle: "Rooms, dining reservations, and local excursions booked together.",
    description:
      "Guests don't just book rooms — they plan entire stays. With Yoonie, a guest selects their Deluxe Balcony room, reserves a prime sunset dinner table, and books their private airport minivan in a single transaction.",
    highlights: [
      {
        icon: BedDouble,
        title: "Single Transaction",
        text: "One subtotal, 10% service charge, 7% VAT, and direct attribution tracking (DIRECT_WEB).",
      },
      {
        icon: Compass,
        title: "Bilingual Transit Cards",
        text: "Automatically generates English & Thai driver cards with flight numbers, plates, and meeting doors.",
      },
    ],
  },
  {
    id: "atomic-hold",
    mood: "thinking",
    mascotSpeech: "I hold your room for 15 minutes while you checkout!",
    badge: "Pillar 2: Concurrency Engine",
    title: "Atomic 15-Minute Inventory Holds",
    subtitle: "Zero overbooking across rooms, dining seats, and tour capacity.",
    description:
      "When a guest clicks 'Lock Rate & Hold', Yoonie executes an atomic conditional increment on the inventory slot. No two guests can book the same room or tour slot simultaneously.",
    highlights: [
      {
        icon: Clock,
        title: "15-Minute Soft Hold",
        text: "Capacity is reserved safely while the guest enters flight details and contact information.",
      },
      {
        icon: ShieldCheck,
        title: "Automated Sweeper",
        text: "If a cart is abandoned, background workers automatically release the held slots back to the open pool.",
      },
    ],
  },
  {
    id: "housekeeping",
    mood: "happy",
    mascotSpeech: "Clean rooms by arrival time, not room numbers!",
    badge: "Pillar 3: Front-Desk Zero",
    title: "ETA-Ranked Housekeeping Command",
    subtitle: "Never make a VIP or early flight arrival wait in the lobby.",
    description:
      "Traditional hotels clean rooms in numeric order (101, 102, 103). Yoonie's rules engine scores rooms by guest arrival ETA and VIP status, directing attendants to clean rooms for guests arriving soonest first.",
    highlights: [
      {
        icon: Sparkles,
        title: "4-Stage Kanban",
        text: "Dirty → In Progress → Clean → Inspected. 1-tap mobile updates from cleaning staff tablets.",
      },
      {
        icon: ShieldCheck,
        title: "Key-Ready Handover",
        text: "Front desk sees instant green status for frictionless check-in as soon as the minivan pulls up.",
      },
    ],
  },
  {
    id: "dispatch",
    mood: "happy",
    mascotSpeech: "Every morning at 05:30, operations are synchronized!",
    badge: "Pillar 4: Frontline Logistics",
    title: "Daily Morning Dispatch Hub",
    subtitle: "Automated air-traffic controller for tours, transfers & staff.",
    description:
      "Every morning at 05:30, Yoonie evaluates live booking data and flight schedules to produce prioritized task cards, flags under-filled tours for yield consolidation, and formats driver greeting notes.",
    highlights: [
      {
        icon: Compass,
        title: "Tour Yield Consolidation",
        text: "Flags departures under the 40% threshold with projected THB loss to prevent running empty vans.",
      },
      {
        icon: Clock,
        title: "Driver Run-Sheet",
        text: "Live status tracking (OPEN → ACKNOWLEDGED → IN_PROGRESS → DONE) across all hotel fleet drivers.",
      },
    ],
  },
];

export function YoonieOnboardingModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);

  if (!isOpen) return null;

  const step = ONBOARDING_STEPS[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === ONBOARDING_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      if (typeof window !== "undefined") {
        localStorage.setItem("onboardingComplete", "true");
      }
      onClose();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (!isFirst) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("onboardingComplete", "true");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#F8F5EE] dark:bg-[#1D2723] border border-[#E5DBD0] dark:border-[#2D3D36] shadow-2xl overflow-hidden flex flex-col text-[#303A36] dark:text-[#F5EBDD] animate-in zoom-in-95 duration-200">
        {/* Header bar with progress */}
        <div className="px-6 pt-6 pb-4 border-b border-[#E5DBD0]/70 dark:border-[#2D3D36]/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {ONBOARDING_STEPS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentStepIndex
                    ? "w-8 bg-[#28594E] dark:bg-[#D8E6DA]"
                    : idx < currentStepIndex
                    ? "w-3 bg-[#28594E]/40 dark:bg-[#D8E6DA]/40"
                    : "w-3 bg-[#E5DBD0] dark:bg-[#2D3D36]"
                }`}
                title={`Step ${idx + 1}`}
              />
            ))}
            <span className="text-[11px] font-bold text-[#6B7B74] ml-2">
              {currentStepIndex + 1} / {ONBOARDING_STEPS.length}
            </span>
          </div>

          <button
            onClick={handleSkip}
            className="p-1.5 rounded-xl hover:bg-[#E5DBD0]/50 dark:hover:bg-[#2D3D36]/50 text-[#6B7B74] hover:text-[#303A36] dark:hover:text-[#F5EBDD] transition"
            title="Skip tour"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 sm:p-8 flex flex-col gap-6 max-h-[75vh] overflow-y-auto">
          {/* Mascot speech & Title banner */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <YoonieMascot
              mood={step.mood}
              size="lg"
              className="shrink-0"
              message={step.mascotSpeech}
              badge={`Step ${currentStepIndex + 1}`}
            />

            <div className="flex flex-col gap-1.5 text-center sm:text-left">
              <span className="px-2.5 py-0.5 rounded-full bg-[#E8A45B]/15 text-[#303A36] dark:text-[#E8A45B] text-[10px] font-bold uppercase tracking-wider w-fit mx-auto sm:mx-0">
                {step.badge}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#28594E] dark:text-[#F5EBDD] font-sans leading-tight">
                {step.title}
              </h2>
              <p className="text-xs font-semibold text-[#E8A45B] dark:text-[#E8A45B]">
                {step.subtitle}
              </p>
              <p className="text-xs text-[#6B7B74] dark:text-[#A7B9B0] leading-relaxed mt-1">
                {step.description}
              </p>
            </div>
          </div>

          {/* Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E5DBD0]/70 dark:border-[#2D3D36]/70">
            {step.highlights.map((h, i) => {
              const Icon = h.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl p-4 bg-white dark:bg-[#202C27] border border-[#E5DBD0] dark:border-[#2D3D36] flex flex-col gap-1.5 shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-[#28594E]/10 text-[#28594E] dark:bg-[#D8E6DA]/20 dark:text-[#D8E6DA]">
                      <Icon className="size-3.5" />
                    </span>
                    <h4 className="font-bold text-xs text-[#303A36] dark:text-[#F5EBDD]">
                      {h.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-[#6B7B74] dark:text-[#8FA299] leading-snug">
                    {h.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer controls */}
        <div className="px-6 py-4 bg-white/70 dark:bg-[#17201D]/70 border-t border-[#E5DBD0] dark:border-[#2D3D36] flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            disabled={isFirst}
            className={`text-xs font-semibold ${isFirst ? "invisible" : ""}`}
          >
            <ArrowLeft className="size-3.5 mr-1.5" /> Back
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSkip}
              className="text-xs text-[#6B7B74] border-transparent hover:border-[#E5DBD0]"
            >
              Skip
            </Button>

            <Button
              size="sm"
              onClick={handleNext}
              className="bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold text-xs px-5 rounded-xl shadow-xs flex items-center gap-1.5"
            >
              {isLast ? (
                <>
                  <Check className="size-3.5" /> Get Started
                </>
              ) : (
                <>
                  Next <ArrowRight className="size-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
