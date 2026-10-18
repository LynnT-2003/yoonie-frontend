import { Construction } from "lucide-react";

/**
 * REMOVE WHEN READY TO SHIP:
 * 1. Delete this file (modules/scaffold/ScaffoldBanner.tsx)
 * 2. Remove the <ScaffoldBanner /> import and usage from app/layout.tsx
 */
export function ScaffoldBanner() {
  return (
    <div
      role="status"
      aria-label="Yulio scaffold banner"
      className="relative w-full border-b border-amber-500/30 bg-amber-500/10 text-amber-200"
      style={{
        backgroundImage:
          "repeating-linear-gradient(45deg, transparent 0 12px, rgba(245,158,11,0.06) 12px 24px)",
      }}
    >
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2 text-sm sm:px-6">
        <Construction className="h-4 w-4 shrink-0 text-amber-400" aria-hidden />
        <span className="font-mono text-[11px] uppercase tracking-widest text-amber-400">
          Beta / Scaffold
        </span>
        <span className="text-amber-100/90">
          This is your Yulio scaffold. Start building in{" "}
          <code className="font-mono text-amber-200">/app</code> and{" "}
          <code className="font-mono text-amber-200">/modules</code>. Remove
          this banner from{" "}
          <code className="font-mono text-amber-200">app/layout.tsx</code> when
          you&apos;re ready.
        </span>
      </div>
    </div>
  );
}
