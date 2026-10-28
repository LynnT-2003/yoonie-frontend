"use client";

import * as React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[GlobalError] Unhandled layout exception:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F5EBDD] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-[#28594E]/15 shadow-xl flex flex-col items-center">
          <h1 className="mt-4 font-extrabold text-2xl text-[#28594E] tracking-tight">
            System Error
          </h1>
          <p className="mt-2 text-xs text-[#7A8B84] leading-relaxed">
            {error?.message || "A critical error occurred while rendering the interface."}
          </p>
          <button
            onClick={() => reset()}
            className="mt-6 px-6 py-2.5 bg-[#28594E] text-[#F5EBDD] font-bold text-xs rounded-xl hover:bg-[#1E433A] transition-colors"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
