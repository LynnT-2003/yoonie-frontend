"use client";

import * as React from "react";
import { YoonieMascot } from "@/components/mascot/YoonieMascot";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[RootErrorBoundary] Unhandled client exception:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F5EBDD] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full p-8 rounded-3xl bg-white/80 dark:bg-[#202C27]/80 backdrop-blur-xl border border-[#28594E]/15 shadow-xl flex flex-col items-center">
        <YoonieMascot mood="worried" size="lg" />
        <h1 className="mt-6 font-extrabold text-2xl text-[#28594E] tracking-tight">
          Something went wrong
        </h1>
        <p className="mt-2 text-xs text-[#7A8B84] leading-relaxed">
          {error?.message || "An unexpected error occurred while loading this page."}
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5 w-full">
          <Button
            onClick={() => reset()}
            className="w-full sm:flex-1 bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] font-bold text-xs rounded-xl"
          >
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="w-full sm:flex-1 border-[#28594E]/20 text-[#28594E] font-bold text-xs rounded-xl"
          >
            Reload Page
          </Button>
        </div>
      </div>
    </div>
  );
}
