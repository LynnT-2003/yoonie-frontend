"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { YoonieMascot } from "@/components/mascot/YoonieMascot";
import { useOnboarding } from "@/providers/onboarding-provider";

export function YoonieSpotlightTour() {
  const {
    isOpen,
    steps,
    currentStepIndex,
    currentStep,
    totalSteps,
    closeTour,
    nextStep,
    prevStep,
    goToStep,
  } = useOnboarding();

  const [targetRect, setTargetRect] = React.useState<DOMRect | null>(null);
  const [targetNotFound, setTargetNotFound] = React.useState(false);

  // Poll for target element when route changes or step changes
  React.useEffect(() => {
    if (!isOpen) {
      setTargetRect(null);
      setTargetNotFound(false);
      return;
    }

    setTargetNotFound(false);
    let attempts = 0;
    const maxAttempts = 25;

    const findAndMeasure = () => {
      if (!currentStep?.targetId) return false;
      const el = document.getElementById(currentStep.targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // Give smooth scroll 150ms to settle then measure
        setTimeout(() => {
          const rect = el.getBoundingClientRect();
          setTargetRect(rect);
        }, 150);
        return true;
      }
      return false;
    };

    if (findAndMeasure()) return;

    const interval = setInterval(() => {
      attempts++;
      if (findAndMeasure()) {
        clearInterval(interval);
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        setTargetNotFound(true);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, currentStepIndex, currentStep?.targetId, currentStep?.pageRoute]);

  // Keep target rect updated on window resize or scroll
  React.useEffect(() => {
    if (!isOpen || !currentStep?.targetId) return;

    const updateRect = () => {
      if (!currentStep?.targetId) return;
      const el = document.getElementById(currentStep.targetId);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      }
    };

    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [isOpen, currentStep?.targetId]);

  if (!isOpen || targetNotFound) return null;

  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === totalSteps - 1;

  // Compute tooltip card position relative to target element
  let cardStyle: React.CSSProperties = {
    position: "fixed",
    bottom: "24px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "calc(100vw - 32px)",
    maxWidth: "460px",
  };

  let arrowPlacement: "top" | "bottom" | null = null;

  if (targetRect && typeof window !== "undefined") {
    const pad = 12;
    const cardEstimatedHeight = 240;
    const cardWidth = Math.min(460, window.innerWidth - 32);

    const spaceBelow = window.innerHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;

    let cardTop: number;
    if (spaceBelow >= cardEstimatedHeight + 30) {
      // Place below target
      cardTop = targetRect.bottom + pad;
      arrowPlacement = "top";
    } else if (spaceAbove >= cardEstimatedHeight + 30) {
      // Place above target
      cardTop = targetRect.top - cardEstimatedHeight - pad;
      arrowPlacement = "bottom";
    } else {
      // Center or stick near bottom
      cardTop = Math.max(16, window.innerHeight - cardEstimatedHeight - 24);
      arrowPlacement = null;
    }

    // Align left edge with target, clamped within viewport
    const clampedLeft = Math.max(
      16,
      Math.min(targetRect.left, window.innerWidth - cardWidth - 16)
    );

    cardStyle = {
      position: "fixed",
      top: `${cardTop}px`,
      left: `${clampedLeft}px`,
      width: `${cardWidth}px`,
      zIndex: 60,
    };
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none select-none overflow-hidden animate-in fade-in duration-300">
      {/* ─── Spotlight Cutout Box ───────────────────────────────────────────── */}
      {targetRect ? (
        <div
          style={{
            position: "fixed",
            top: `${Math.max(0, targetRect.top - 8)}px`,
            left: `${Math.max(0, targetRect.left - 8)}px`,
            width: `${targetRect.width + 16}px`,
            height: `${targetRect.height + 16}px`,
            borderRadius: "20px",
            boxShadow:
              "0 0 0 9999px rgba(18, 26, 23, 0.72), 0 0 0 3px #E8A45B, 0 10px 35px rgba(232, 164, 91, 0.45)",
            pointerEvents: "none",
            transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          className="ring-2 ring-[#E8A45B]/60"
        />
      ) : (
        /* Soft fallback backdrop if element is still mounting */
        <div className="fixed inset-0 bg-[#121A17]/70 pointer-events-auto transition-opacity" />
      )}

      {/* ─── Floating Yoonie Mascot Coachmark Card ──────────────────────────── */}
      <div
        style={cardStyle}
        className="pointer-events-auto rounded-3xl bg-[#F8F5EE] dark:bg-[#1D2723] border-2 border-[#E8A45B] p-5 shadow-2xl flex flex-col gap-3.5 transition-all duration-300 text-[#303A36] dark:text-[#F5EBDD] relative"
      >
        {/* Pointer Arrow */}
        {arrowPlacement === "top" && targetRect ? (
          <div
            className="absolute -top-2.5 left-10 size-5 rotate-45 bg-[#F8F5EE] dark:bg-[#1D2723] border-t-2 border-l-2 border-[#E8A45B]"
            style={{
              left: `${Math.max(
                24,
                Math.min(
                  targetRect.left + targetRect.width / 2 - (parseFloat(cardStyle.left as string) || 0) - 10,
                  (parseFloat(cardStyle.width as string) || 400) - 40
                )
              )}px`,
            }}
          />
        ) : null}

        {arrowPlacement === "bottom" && targetRect ? (
          <div
            className="absolute -bottom-2.5 left-10 size-5 rotate-45 bg-[#F8F5EE] dark:bg-[#1D2723] border-b-2 border-r-2 border-[#E8A45B]"
            style={{
              left: `${Math.max(
                24,
                Math.min(
                  targetRect.left + targetRect.width / 2 - (parseFloat(cardStyle.left as string) || 0) - 10,
                  (parseFloat(cardStyle.width as string) || 400) - 40
                )
              )}px`,
            }}
          />
        ) : null}

        {/* Top Bar: Badge & Close */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8A45B]/20 text-[#303A36] dark:text-[#E8A45B] text-[11px] font-extrabold uppercase tracking-wider">
            <Sparkles className="size-3 text-[#E8A45B]" />
            {currentStepIndex + 1}/{totalSteps} · {currentStep.label}
          </div>

          <button
            type="button"
            onClick={closeTour}
            className="p-1 rounded-full text-[#6B7B74] hover:text-[#303A36] hover:bg-[#E5DBD0]/50 dark:hover:bg-[#28594E]/30 dark:text-[#8FA299] transition"
            title="Skip Tour"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Mascot & Speech */}
        <div className="flex items-start gap-3.5">
          <div className="shrink-0 pt-0.5">
            <YoonieMascot mood={currentStep.mascotMood} size="sm" />
          </div>

          <div className="flex flex-col flex-1 min-w-0">
            <h3 className="font-extrabold text-base text-[#28594E] dark:text-[#F5EBDD] tracking-tight leading-snug">
              {currentStep.title}
            </h3>

            <p className="text-xs text-[#4A5752] dark:text-[#D8E6DA] leading-relaxed mt-1">
              {currentStep.speech}
            </p>

            <p className="text-[11px] font-bold text-[#E8A45B] mt-2 flex items-center gap-1">
              👉 {currentStep.actionHint}
            </p>
          </div>
        </div>

        {/* Footer Navigation Controls */}
        <div className="pt-2 border-t border-[#E5DBD0] dark:border-[#2D3D36] flex items-center justify-between gap-3">
          {/* Step indicator dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goToStep(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentStepIndex
                    ? "w-6 bg-[#28594E] dark:bg-[#E8A45B]"
                    : "w-2 bg-[#D8E6DA] dark:bg-[#3D4D46] hover:bg-[#28594E]/50"
                }`}
                title={`Go to step ${idx + 1}: ${s.title}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {!isFirst ? (
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                className="h-8 px-3 rounded-xl text-xs font-bold border-[#E5DBD0] dark:border-[#2D3D36] text-[#6B7B74] hover:text-[#303A36]"
              >
                <ArrowLeft className="size-3 mr-1" /> Back
              </Button>
            ) : (
              <button
                type="button"
                onClick={closeTour}
                className="text-[11px] font-bold text-[#6B7B74] hover:text-[#303A36] px-2 py-1"
              >
                Skip
              </button>
            )}

            <Button
              size="sm"
              onClick={nextStep}
              className="h-8 px-4 rounded-xl text-xs font-bold bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] shadow-sm transition"
            >
              {isLast ? (
                <>
                  Finish Tour <Check className="size-3 ml-1" />
                </>
              ) : (
                <>
                  Next <ArrowRight className="size-3 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
