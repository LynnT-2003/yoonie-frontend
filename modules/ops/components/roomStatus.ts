import type { OccupancyStatus, RoomCleaningStatus } from "@/lib/types/hospitality";

type Tone = "success" | "info" | "warning" | "danger" | "neutral" | "brand";

/** Single source of truth for housekeeping status copy and colour across every ops screen. */
export const CLEANING_STATUS: Record<
  RoomCleaningStatus,
  { label: string; short: string; tone: Tone; swatch: string; next?: RoomCleaningStatus; action?: string }
> = {
  DIRTY: {
    label: "Dirty",
    short: "Dirty",
    tone: "danger",
    swatch: "bg-destructive",
    next: "IN_PROGRESS",
    action: "Start cleaning",
  },
  IN_PROGRESS: {
    label: "Cleaning",
    short: "Cleaning",
    tone: "warning",
    swatch: "bg-yoonie-amber",
    next: "CLEAN",
    action: "Mark clean",
  },
  CLEAN: {
    label: "Clean · needs inspection",
    short: "Clean",
    tone: "info",
    swatch: "bg-info",
    next: "INSPECTED",
    action: "Inspect & release",
  },
  INSPECTED: {
    label: "Inspected · ready",
    short: "Ready",
    tone: "success",
    swatch: "bg-success",
  },
};

export const CLEANING_ORDER: RoomCleaningStatus[] = ["DIRTY", "IN_PROGRESS", "CLEAN", "INSPECTED"];

export const OCCUPANCY_STATUS: Record<OccupancyStatus, { label: string; tone: Tone }> = {
  OCCUPIED: { label: "In house", tone: "brand" },
  ARRIVING_TODAY: { label: "Arriving", tone: "warning" },
  DEPARTING_TODAY: { label: "Departed", tone: "neutral" },
  VACANT: { label: "Vacant", tone: "neutral" },
};

export const ROOM_TYPE_LABEL: Record<string, string> = {
  STANDARD_KING: "Standard King",
  DELUXE_BALCONY: "Deluxe Balcony",
  POOL_VILLA: "Pool Villa",
};

/** Villas sit on floor 0 in room data; label them by what they are. */
export const floorLabel = (floor: number) => (floor === 0 ? "Villas" : `Floor ${floor}`);

export const roomTypeLabel = (type: string) =>
  ROOM_TYPE_LABEL[type] ?? type.replace(/_/g, " ").toLowerCase();

export const SERVICE_KIND_LABEL: Record<string, string> = {
  AIRPORT_TRANSFER: "Transfer",
  SCHEDULED_TOUR: "Tour",
  SPA_TREATMENT: "Spa",
};

export const DISPATCH_STATUS: Record<string, { label: string; tone: Tone }> = {
  OPEN: { label: "Scheduled", tone: "neutral" },
  ACKNOWLEDGED: { label: "Scheduled", tone: "neutral" },
  IN_PROGRESS: { label: "En route", tone: "warning" },
  DONE: { label: "Done", tone: "success" },
  DISMISSED: { label: "Dismissed", tone: "neutral" },
};

/**
 * Rough minutes of work left in each state, used to judge whether a room will make its deadline.
 * Estimates, not measurements — tune per property once real turnaround times are logged.
 */
export const WORK_LEFT_MIN: Record<RoomCleaningStatus, number> = {
  DIRTY: 45,
  IN_PROGRESS: 25,
  CLEAN: 10,
  INSPECTED: 0,
};

/** Soft tile fills for the floor map, one per housekeeping state. */
export const CLEANING_TILE: Record<RoomCleaningStatus, string> = {
  DIRTY: "bg-danger-soft text-destructive border-destructive/25",
  IN_PROGRESS: "bg-warning-soft text-warning border-warning/30",
  CLEAN: "bg-info-soft text-info border-info/25",
  INSPECTED: "bg-success-soft text-success border-success/25",
};
