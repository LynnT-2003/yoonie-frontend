import type { DispatchTask, LiveRoomItem, RoomCleaningStatus } from "@/lib/types/hospitality";
import { WORK_LEFT_MIN } from "./roomStatus";

/** How a piece of work stands against its deadline. */
export type Urgency = "LATE" | "AT_RISK" | "ON_TRACK" | "NO_DEADLINE" | "DONE";

export const URGENCY_RANK: Record<Urgency, number> = { LATE: 0, AT_RISK: 1, ON_TRACK: 2, NO_DEADLINE: 3, DONE: 4 };

export const URGENCY_STYLE: Record<Urgency, { label: string; bar: string }> = {
  LATE: { label: "Late", bar: "bg-destructive" },
  AT_RISK: { label: "Tight", bar: "bg-warning" },
  ON_TRACK: { label: "On track", bar: "bg-primary" },
  NO_DEADLINE: { label: "Anytime", bar: "bg-border" },
  DONE: { label: "Done", bar: "bg-success" },
};

const minutesUntil = (iso: string, now: number) => Math.round((new Date(iso).getTime() - now) / 60_000);

/** Tight when the work left plus a 15-minute buffer won't fit before the deadline. */
function judge(minutesLeft: number, workLeftMin: number): Urgency {
  if (minutesLeft < 0) return "LATE";
  if (minutesLeft < workLeftMin + 15) return "AT_RISK";
  return "ON_TRACK";
}

export function roomUrgency(room: LiveRoomItem, now: number): { urgency: Urgency; minutesLeft: number | null } {
  if (room.cleaningStatus === "INSPECTED") return { urgency: "DONE", minutesLeft: null };
  if (!room.arrival) return { urgency: "NO_DEADLINE", minutesLeft: null };
  const minutesLeft = minutesUntil(room.arrival.readyBy, now);
  return { urgency: judge(minutesLeft, WORK_LEFT_MIN[room.cleaningStatus]), minutesLeft };
}

/** A turnaround only has a real deadline when a guest is arriving; otherwise it's "anytime today". */
export const hasArrival = (t: DispatchTask) => Boolean(t.housekeeping?.orderId || t.housekeeping?.guestName);

export function taskDeadline(t: DispatchTask): string | undefined {
  if (t.housekeeping) return hasArrival(t) ? t.housekeeping.targetReadyBy : undefined;
  if (t.pickup) return t.pickup.etaAt;
  return t.dueAt;
}

export function taskUrgency(t: DispatchTask, now: number): { urgency: Urgency; minutesLeft: number | null } {
  if (t.status === "DONE" || t.status === "DISMISSED") return { urgency: "DONE", minutesLeft: null };
  // a pickup's promise is "driver at the door by landing": once they're there, the clock stops
  const stage = t.pickup?.stage;
  if (stage === "AT_AIRPORT" || stage === "GUEST_ON_BOARD" || stage === "DROPPED_OFF") {
    return { urgency: "ON_TRACK", minutesLeft: null };
  }
  const deadline = taskDeadline(t);
  if (!deadline) return { urgency: "NO_DEADLINE", minutesLeft: null };
  const minutesLeft = minutesUntil(deadline, now);
  const work =
    t.housekeeping ? WORK_LEFT_MIN[(t.cleaningStatus ?? "DIRTY") as RoomCleaningStatus]
    : t.pickup ? (t.status === "IN_PROGRESS" ? 0 : 60) // the drive to the airport
    : 0;
  return { urgency: judge(minutesLeft, work), minutesLeft };
}

export const clock = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Bangkok" });

export const countdown = (min: number) => {
  const m = Math.abs(min);
  const text = m >= 60 ? `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m` : `${m} min`;
  return min < 0 ? `${text} late` : `${text} left`;
};

/** Compact countdown for tight spaces: "1h20", "40m", "15m late". */
export const shortCountdown = (min: number) => {
  const m = Math.abs(min);
  const text = m >= 60 ? `${Math.floor(m / 60)}h${String(m % 60).padStart(2, "0")}` : `${m}m`;
  return min < 0 ? `${text} late` : text;
};
