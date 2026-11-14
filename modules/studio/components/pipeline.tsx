"use client";

import * as React from "react";
import { FileSpreadsheet, UploadCloud, X } from "lucide-react";
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
          "flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
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
