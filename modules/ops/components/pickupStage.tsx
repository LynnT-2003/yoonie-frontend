"use client";

import * as React from "react";
import { AlertTriangle, Check } from "lucide-react";
import type { DispatchTask, PickupIssueKind, PickupStage, PickupStep } from "@/lib/types/hospitality";
import { cn } from "@/lib/utils";
import { clock } from "./urgency";

type Tone = "success" | "info" | "warning" | "danger" | "neutral" | "brand";

export const PICKUP_STAGE_ORDER: PickupStage[] = [
  "ASSIGNED",
  "CONFIRMED",
  "EN_ROUTE",
  "AT_AIRPORT",
  "GUEST_ON_BOARD",
  "DROPPED_OFF",
];

/** Copy for each step, from the desk's point of view. `step` is the tracker label. */
export const PICKUP_STAGE: Record<PickupStage, { label: string; step: string; tone: Tone }> = {
  ASSIGNED: { label: "Waiting for driver to accept", step: "Assigned", tone: "warning" },
  CONFIRMED: { label: "Driver accepted", step: "Accepted", tone: "info" },
  EN_ROUTE: { label: "Driving to the airport", step: "Left hotel", tone: "brand" },
  AT_AIRPORT: { label: "Waiting at arrivals", step: "At the door", tone: "brand" },
  GUEST_ON_BOARD: { label: "Guest on board", step: "Guest on board", tone: "brand" },
  DROPPED_OFF: { label: "At the lobby", step: "At the lobby", tone: "success" },
};

export const PICKUP_ISSUE: Record<PickupIssueKind, string> = {
  FLIGHT_DELAYED: "Flight delayed",
  GUEST_NOT_FOUND: "Can't find the guest",
  VEHICLE_PROBLEM: "Vehicle problem",
  OTHER: "Driver needs help",
};

export const pickupStage = (t: DispatchTask): PickupStage =>
  t.pickup?.stage ?? (t.status === "DONE" ? "DROPPED_OFF" : t.status === "IN_PROGRESS" ? "EN_ROUTE" : "ASSIGNED");

export const openIssue = (t: DispatchTask) => (t.pickup?.issue && !t.pickup.issue.resolvedAt ? t.pickup.issue : undefined);

/** One line on where the pickup is, naming the driver: "Prasit is waiting at door 4". */
export function pickupHeadline(t: DispatchTask): string {
  const stage = pickupStage(t);
  const driver = t.assigneeName ?? "The driver";
  if (!t.assigneeUserId) return "No driver yet";
  switch (stage) {
    case "ASSIGNED":
      return `Waiting for ${driver} to accept`;
    case "CONFIRMED":
      return `${driver} accepted`;
    case "EN_ROUTE":
      return `${driver} is driving to the airport`;
    case "AT_AIRPORT":
      return `${driver} is waiting at ${t.pickup?.meetingDoor ? `door ${t.pickup.meetingDoor}` : "arrivals"}`;
    case "GUEST_ON_BOARD":
      return `${t.pickup?.guestName ?? "Guest"} is in the car`;
    case "DROPPED_OFF":
      return `${t.pickup?.guestName ?? "Guest"} is at the lobby`;
  }
}

const lastStep = (steps: PickupStep[] | undefined, stage: PickupStage) =>
  [...(steps ?? [])].reverse().find((s) => s.stage === stage);

/** The pickup's steps with the time each was reported; the current one is highlighted. */
export function PickupTracker({ task, className }: { task: DispatchTask; className?: string }) {
  const stage = pickupStage(task);
  const current = PICKUP_STAGE_ORDER.indexOf(stage);
  const issue = openIssue(task);
  const steps = PICKUP_STAGE_ORDER.slice(1); // "assigned" is the starting point, not a step

  return (
    <ol className={cn("flex items-start", className)} aria-label="Pickup steps">
      {steps.map((s, i) => {
        const idx = i + 1;
        const done = idx <= current;
        const isCurrent = idx === current;
        const next = idx === current + 1;
        const record = lastStep(task.pickup?.steps, s);
        return (
          <li key={s} className="relative flex min-w-0 flex-1 flex-col items-center text-center">
            {/* connector to the previous step */}
            {i > 0 ? (
              <span
                className={cn("absolute right-1/2 top-2 h-0.5 w-full -translate-y-1/2", done ? "bg-primary" : "bg-border")}
                aria-hidden
              />
            ) : null}
            <span
              className={cn(
                "relative z-[1] flex size-4 items-center justify-center rounded-full border-2",
                done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface",
                next && issue && "border-destructive bg-danger-soft",
                next && !issue && "border-primary/50"
              )}
              title={record ? `${record.byName ?? ""}${record.note ? ` · ${record.note}` : ""}` : undefined}
            >
              {done ? <Check className="size-2.5" strokeWidth={3} /> : null}
              {next && issue ? <AlertTriangle className="size-2.5 text-destructive" /> : null}
            </span>
            <span
              className={cn(
                "mt-1 truncate px-0.5 text-[11px] leading-tight",
                isCurrent ? "font-medium text-foreground" : done ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {PICKUP_STAGE[s].step}
            </span>
            <span className="text-[10px] tabular-nums text-muted-foreground">
              {record ? clock(record.at) : " "}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
