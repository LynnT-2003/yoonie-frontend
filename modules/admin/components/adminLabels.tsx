import * as React from "react";
import { Badge } from "@/components/ui/badge";
import type { RoomCleaningStatus, RoomType, ServiceKind } from "@/lib/types/hospitality";

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  STANDARD_KING: "Standard King",
  DELUXE_BALCONY: "Deluxe River Balcony",
  POOL_VILLA: "Riverside Pool Villa",
};

export const SERVICE_KIND_LABELS: Record<ServiceKind, string> = {
  AIRPORT_TRANSFER: "Airport transfer",
  SCHEDULED_TOUR: "Scheduled tour",
  SPA_TREATMENT: "Spa treatment",
};

const CLEANING_STATUS: Record<
  RoomCleaningStatus,
  { label: string; tone: "danger" | "warning" | "info" | "success" }
> = {
  DIRTY: { label: "Dirty", tone: "danger" },
  IN_PROGRESS: { label: "Cleaning", tone: "warning" },
  CLEAN: { label: "Clean", tone: "info" },
  INSPECTED: { label: "Inspected", tone: "success" },
};

export const CLEANING_STATUS_OPTIONS = (Object.keys(CLEANING_STATUS) as RoomCleaningStatus[]).map(
  (value) => ({ value, label: CLEANING_STATUS[value].label })
);

export function CleaningStatusBadge({ status }: { status: RoomCleaningStatus }) {
  const s = CLEANING_STATUS[status] ?? CLEANING_STATUS.CLEAN;
  return (
    <Badge tone={s.tone} dot>
      {s.label}
    </Badge>
  );
}

/** "KING_BED" → "King bed"; leaves already-readable text untouched. */
export function humanizeCode(value: string) {
  if (!/^[A-Z0-9_]+$/.test(value)) return value;
  const words = value.toLowerCase().replace(/_/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** "฿2,200" — consistent THB formatting across the admin. */
export function formatThb(value: number | undefined | null) {
  return `฿${(value ?? 0).toLocaleString("en-US")}`;
}

/** Thumbnail used in admin list rows. */
export function RowThumb({ src, alt }: { src?: string | null; alt: string }) {
  return (
    <div className="size-10 shrink-0 overflow-hidden rounded-md border border-border bg-subtle">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : null}
    </div>
  );
}
