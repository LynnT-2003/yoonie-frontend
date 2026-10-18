"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  ExternalLink,
  Layers,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { YoonieMascot, type MascotMood } from "@/components/mascot/YoonieMascot";
import { useOnboarding, ONBOARDING_STEPS } from "@/providers/onboarding-provider";

const STEP_MOODS: MascotMood[] = ["calm", "checking", "thinking", "happy"];
const STEP_SPEECHES = [
  "Welcome! Let's explore the Direct Booking Engine.",
  "Here is our Front-Desk Zero Housekeeping board!",
  "Here is our 05:30 Daily Dispatch Run-Sheet!",
  "And here is our Master Guest CDP & Loyalty Portal!",
];

export function YoonieOnboardingModal() {
  const {
    isOpen,
    currentStepIndex,
    currentStep,
    closeTour,
    nextStep,
    prevStep,
    goToStep,
    navigateAndInspect,
  } = useOnboarding();

  const pathname = usePathname();

  if (!isOpen) return null;

  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === ONBOARDING_STEPS.length - 1;
  const isCurrentlyOnStepPage = pathname === currentStep.pageRoute;

  const currentMood = STEP_MOODS[currentStepIndex] || "calm";
  const currentSpeech = STEP_SPEECHES[currentStepIndex] || "Exploring Yoonie OS";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#F8F5EE] dark:bg-[#1D2723] border border-[#E5DBD0] dark:border-[#2D3D36] shadow-2xl overflow-hidden flex flex-col text-[#303A36] dark:text-[#F5EBDD] animate-in zoom-in-95 duration-200">
        {/* Top Stepper Navigation */}
        <div className="px-6 pt-5 pb-3 border-b border-[#E5DBD0]/70 dark:border-[#2D3D36]/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {ONBOARDING_STEPS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => goToStep(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentStepIndex
                    ? "w-8 bg-[#28594E] dark:bg-[#D8E6DA]"
                    : idx < currentStepIndex
                    ? "w-3 bg-[#28594E]/40 dark:bg-[#D8E6DA]/40"
                    : "w-3 bg-[#E5DBD0] dark:bg-[#2D3D36]"
                }`}
                title={s.pageName}
              />
            ))}
            <span className="text-[11px] font-bold text-[#6B7B74] ml-2">
              Page {currentStepIndex + 1} of {ONBOARDING_STEPS.length}
            </span>
          </div>

          <button
            onClick={closeTour}
            className="p-1.5 rounded-xl hover:bg-[#E5DBD0]/50 dark:hover:bg-[#2D3D36]/50 text-[#6B7B74] hover:text-[#303A36] dark:hover:text-[#F5EBDD] transition"
            title="Close walkthrough"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 flex flex-col gap-6 max-h-[72vh] overflow-y-auto">
          {/* Mascot speech & Title banner */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <YoonieMascot
              mood={currentMood}
              size="lg"
              className="shrink-0"
              message={currentSpeech}
              badge={`Page ${currentStepIndex + 1}`}
            />

            <div className="flex flex-col gap-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="px-2.5 py-0.5 rounded-full bg-[#E8A45B]/15 text-[#303A36] dark:text-[#E8A45B] text-[10px] font-bold uppercase tracking-wider">
                  {currentStep.badge}
                </span>
                <span className="text-xs font-mono font-bold text-[#28594E] dark:text-[#D8E6DA]">
                  {currentStep.pageRoute}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#28594E] dark:text-[#F5EBDD] font-sans leading-tight mt-1">
                {currentStep.title}
              </h2>
              <p className="text-xs font-semibold text-[#E8A45B]">
                {currentStep.subtitle}
              </p>
              <p className="text-xs text-[#6B7B74] dark:text-[#A7B9B0] leading-relaxed mt-1">
                {currentStep.description}
              </p>
            </div>
          </div>

          {/* Navigation Action to Jump to Page */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#EFE7DA]/50 dark:bg-[#1A2521] border border-[#E5DBD0] dark:border-[#2D3D36]">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#28594E]" />
              <span className="text-xs font-bold text-[#303A36] dark:text-[#F5EBDD]">
                {isCurrentlyOnStepPage ? "Currently viewing this page" : `Navigate to ${currentStep.pageName}`}
              </span>
            </div>

            {!isCurrentlyOnStepPage ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigateAndInspect(currentStep.pageRoute)}
                className="h-7 text-xs rounded-xl border-[#28594E]/30 text-[#28594E] dark:text-[#D8E6DA] hover:bg-[#D8E6DA]/50"
              >
                Go to {currentStep.pageRoute} <ExternalLink className="size-3 ml-1" />
              </Button>
            ) : (
              <span className="text-[11px] font-bold text-[#28594E] dark:text-[#D8E6DA]">
                Active Page ✓
              </span>
            )}
          </div>

          {/* Element Breakdown List */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7B74] mb-3 flex items-center gap-1.5">
              <Layers className="size-3.5" /> What Is What On This Page:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentStep.elementsWalkthrough.map((el, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-4 bg-white dark:bg-[#202C27] border border-[#E5DBD0] dark:border-[#2D3D36] flex flex-col gap-1.5 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-xs text-[#28594E] dark:text-[#D8E6DA]">
                      {el.name}
                    </h4>
                    {el.badge ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#F8F5EE] dark:bg-[#1A2521] text-[#E8A45B] border border-[#E5DBD0] dark:border-[#2D3D36]">
                        {el.badge}
                      </span>
                    ) : null}
                  </div>

                  <p className="text-[11px] text-[#6B7B74] dark:text-[#8FA299] leading-snug">
                    {el.description}
                  </p>

                  {el.endpoint ? (
                    <span className="text-[9px] font-mono text-[#6B7B74] bg-[#F8F5EE] dark:bg-[#1A2521] px-1.5 py-0.5 rounded w-fit mt-1">
                      {el.endpoint}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 bg-white/70 dark:bg-[#17201D]/70 border-t border-[#E5DBD0] dark:border-[#2D3D36] flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevStep}
            disabled={isFirst}
            className={`text-xs font-semibold ${isFirst ? "invisible" : ""}`}
          >
            <ArrowLeft className="size-3.5 mr-1.5" /> Previous Page
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={closeTour}
              className="text-xs text-[#6B7B74] border-transparent hover:border-[#E5DBD0]"
            >
              Close
            </Button>

            <Button
              size="sm"
              onClick={nextStep}
              className="bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold text-xs px-5 rounded-xl shadow-xs flex items-center gap-1.5"
            >
              {isLast ? (
                <>
                  <Check className="size-3.5" /> Finish Tour
                </>
              ) : (
                <>
                  Next: {ONBOARDING_STEPS[currentStepIndex + 1]?.pageName || "Next Page"}{" "}
                  <ArrowRight className="size-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
