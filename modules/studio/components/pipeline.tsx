"use client";

import * as React from "react";
import {
  AlertOctagon,
  Check,
  CircleAlert,
  FileSpreadsheet,
  Info,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";
import type { Anomaly, ExtractedField, Resolution, Severity, StageId } from "@/lib/types/studio";
import { STAGES } from "@/lib/types/studio";
import type { StageState } from "@/providers/studio-provider";
import { cn } from "@/lib/utils";

/* ----------------------------------------------------------------- dropzone */

const ACCEPT = ".xlsx,.xlsm,.xls,.csv";

export function Dropzone({
  files,
  onFiles,
  onRemove,
  disabled,
}: {
  files: File[];
  onFiles: (files: File[]) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
}) {
  const [over, setOver] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const take = (list: FileList | null) => {
    if (!list) return;
    onFiles([...list].filter((f) => /\.(xlsx|xlsm|xls|csv)$/i.test(f.name)));
  };
  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          if (!disabled) take(e.dataTransfer.files);
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          over ? "border-primary bg-secondary/60" : "border-input bg-surface hover:border-primary/50 hover:bg-linen/40",
          disabled && "pointer-events-none opacity-60"
        )}
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
          <UploadCloud className="size-6" />
        </span>
        <span className="text-base font-semibold">Drop your spreadsheets here</span>
        <span className="max-w-sm text-sm text-muted-foreground">
          Bookings, expenses, guest reviews: as many files as you have, messy is fine. Excel or CSV, up to 4 MB in total.
        </span>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => {
            take(e.target.files);
            e.target.value = "";
          }}
        />
      </button>
      {files.length ? (
        <ul className="space-y-1.5">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center gap-2.5 rounded-xl border border-border bg-surface px-3 py-2 text-sm">
              <FileSpreadsheet className="size-4 shrink-0 text-primary" />
              <span className="min-w-0 flex-1 truncate">{f.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{(f.size / 1024).toFixed(0)} KB</span>
              <button
                type="button"
                onClick={() => onRemove(i)}
                disabled={disabled}
                aria-label={`Remove ${f.name}`}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------ stage tracker */

export function StageTracker({ stages, active }: { stages: Record<StageId, StageState>; active?: boolean }) {
  return (
    <ol className="grid gap-2 sm:grid-cols-4">
      {STAGES.map((st, i) => {
        const s = stages[st.id];
        return (
          <li
            key={st.id}
            className={cn(
              "relative rounded-2xl border px-4 py-3 transition-colors",
              s.status === "running" ? "border-primary/40 bg-secondary/50" : s.status === "done" ? "border-border bg-surface" : "border-border/70 bg-surface/60"
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                  s.status === "done" ? "bg-primary text-primary-foreground" : s.status === "running" ? "bg-amber text-[#303a36]" : "bg-muted text-muted-foreground"
                )}
              >
                {s.status === "done" ? <Check className="size-3.5" /> : s.status === "running" && active ? <Loader2 className="size-3.5 animate-spin" /> : i + 1}
              </span>
              <span className="text-sm font-semibold">{st.label}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{s.summary ?? st.purpose}</p>
            {st.id === "structure" && s.status === "running" && s.pct !== undefined ? (
              <div className="mt-2 space-y-1">
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-[width] duration-200" style={{ width: `${Math.round(s.pct * 100)}%` }} />
                </div>
                <p className="truncate text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------- anomaly feed */

export const SEVERITY: Record<Severity, { label: string; icon: typeof Info; tone: string; dot: string }> = {
  critical: { label: "Check now", icon: AlertOctagon, tone: "text-destructive bg-danger-soft", dot: "bg-destructive" },
  review: { label: "Review", icon: CircleAlert, tone: "text-warning bg-warning-soft", dot: "bg-warning" },
  info: { label: "Tidied", icon: Info, tone: "text-info bg-info-soft", dot: "bg-info" },
};

export const RESOLUTION: Record<Resolution, string> = {
  excluded: "Left out",
  normalised: "Format fixed, value unchanged",
  kept_flagged: "Kept, flagged",
  needs_owner: "Needs your confirmation",
};

export function AnomalyRow({ a, compact }: { a: Anomaly; compact?: boolean }) {
  const sev = SEVERITY[a.severity];
  const Icon = sev.icon;
  const where = [a.file && !compact ? a.file : null, a.sheet ? `sheet ${a.sheet}` : null, a.row ? `row ${a.row}` : null, a.count ? `${a.count.toLocaleString("en-US")} rows` : null]
    .filter(Boolean)
    .join(" · ");
  return (
    <li className="flex gap-3 rounded-xl border border-border bg-surface px-3 py-2.5 animate-in fade-in slide-in-from-top-1 duration-300">
      <span className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg", sev.tone)}>
        <Icon className="size-4" />
        <span className="sr-only">{sev.label}</span>
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <p className="text-sm font-semibold">{a.title}</p>
          {a.value ? <code className="truncate rounded bg-muted px-1.5 text-[11px] text-muted-foreground">{a.value}</code> : null}
        </div>
        <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">{a.detail}</p>
        <p className="mt-1 flex flex-wrap gap-x-2 text-[11px] text-muted-foreground">
          {where ? <span>{where}</span> : null}
          <span className={cn("font-medium", a.resolution === "needs_owner" ? "text-warning" : "text-foreground/70")}>→ {RESOLUTION[a.resolution]}</span>
        </p>
      </div>
    </li>
  );
}

export function AnomalyFeed({ anomalies, limit }: { anomalies: Anomaly[]; limit?: number }) {
  const shown = limit ? anomalies.slice(-limit).reverse() : [...anomalies].reverse();
  return (
    <ul className="space-y-2" aria-live="polite">
      {shown.map((a) => (
        <AnomalyRow key={a.id} a={a} />
      ))}
    </ul>
  );
}

export function SeverityCounts({ anomalies }: { anomalies: Anomaly[] }) {
  const n = (s: Severity) => anomalies.filter((a) => a.severity === s).length;
  return (
    <div className="flex flex-wrap gap-1.5">
      {(["critical", "review", "info"] as Severity[]).map((s) => (
        <span key={s} className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", SEVERITY[s].tone)}>
          <span className={cn("size-1.5 rounded-full", SEVERITY[s].dot)} />
          {n(s)} {SEVERITY[s].label.toLowerCase()}
        </span>
      ))}
    </div>
  );
}

/* --------------------------------------------------------- extracted fields */

export function FieldList({ fields }: { fields: ExtractedField[] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {fields.map((f) => (
        <li key={f.key} className="rounded-xl border border-border bg-surface px-3 py-2.5 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-sm font-semibold">
              <Check className="size-3.5 text-primary" />
              {f.label}
            </span>
            <span className={cn("text-xs font-medium tabular-nums", f.coverage < 0.95 ? "text-warning" : "text-muted-foreground")}>
              {Math.round(f.coverage * 100)}% covered
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{f.source}</p>
        </li>
      ))}
    </ul>
  );
}
