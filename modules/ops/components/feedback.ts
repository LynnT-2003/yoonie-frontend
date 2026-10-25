import { toast } from "@/components/ui/sonner";
import type { DispatchTask, RoomCleaningStatus, RoomTransitionResult } from "@/lib/types/hospitality";

/** "Noi", "Noi and Dao", "Noi, Dao and 2 others" */
export function people(names: string[]): string {
  if (names.length <= 2) return names.join(" and ");
  return `${names.slice(0, 2).join(", ")} and ${names.length - 2} other${names.length === 3 ? "" : "s"}`;
}

const notifiedLine = (names?: string[]) =>
  names?.length ? `Notified ${people(names)}` : "Nobody else needed a ping";

export const taskLabel = (t?: DispatchTask) =>
  !t ? "Job"
  : t.housekeeping ? `Room ${t.housekeeping.roomNumber}`
  : t.pickup ? `Pickup ${t.pickup.flightNumber}`
  : (t.consolidation?.serviceName ?? t.title);

const ROOM_MOVED: Record<RoomCleaningStatus, string> = {
  DIRTY: "sent back to housekeeping",
  IN_PROGRESS: "cleaning started",
  CLEAN: "marked clean",
  INSPECTED: "passed inspection — ready to sell",
};

/** What a room move did, in one toast: the change, who holds it, who was told. */
export function toastRoomMoved(r: RoomTransitionResult) {
  if (r.isNoOp) {
    toast.info(`Room ${r.roomNumber} was already ${r.cleaningStatus.toLowerCase().replace("_", " ")}`);
    return;
  }
  const holder =
    r.cleaningStatus === "DIRTY" || r.cleaningStatus === "IN_PROGRESS"
      ? r.assigneeName
        ? `${r.assigneeName} has it`
        : "Open to any housekeeper"
      : undefined;
  toast.success(`Room ${r.roomNumber} · ${ROOM_MOVED[r.cleaningStatus]}`, {
    description: [holder, notifiedLine(r.notified)].filter(Boolean).join(" · "),
  });
}

export function toastFailed(what: string) {
  return (err: unknown) =>
    toast.error(`Couldn't ${what}`, { description: err instanceof Error ? err.message : "Please try again." });
}
