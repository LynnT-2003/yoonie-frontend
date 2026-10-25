"use client";

import * as React from "react";
import type { LiveRoomItem } from "@/lib/types/hospitality";
import { cn } from "@/lib/utils";
import { CLEANING_ORDER, CLEANING_STATUS, floorLabel, roomTypeLabel } from "@/modules/ops/components/roomStatus";
import { shortDate } from "@/modules/ops/components/format";
import { clock, roomUrgency, shortCountdown } from "@/modules/ops/components/urgency";

export function RoomLegend() {
  return (
    <ul className="hidden flex-wrap items-center gap-x-4 sm:flex gap-y-1 text-xs text-muted-foreground">
      {CLEANING_ORDER.map((s) => (
        <li key={s} className="flex items-center gap-1.5">
          <span className={cn("size-2 rounded-full", CLEANING_STATUS[s].swatch)} aria-hidden />
          {CLEANING_STATUS[s].short}
        </li>
      ))}
      <li className="flex items-center gap-1.5">
        <span className="h-2 w-3 rounded-sm bg-primary" aria-hidden />
        Guest tonight
      </li>
    </ul>
  );
}

export function RoomBoard({
  floors,
  now,
  isToday,
  onOpen,
}: {
  floors: [number, LiveRoomItem[]][];
  now: number;
  isToday: boolean;
  onOpen: (roomId: string) => void;
}) {
  return (
    <div className="space-y-5">
      {floors.map(([floor, rooms]) => (
        <section key={floor} aria-label={floorLabel(floor)}>
          <div className="mb-2 flex items-baseline justify-between">
            <h3 className="text-xs font-medium text-muted-foreground">{floorLabel(floor)}</h3>
            <span className="text-xs tabular-nums text-muted-foreground">
              {rooms.filter((r) => r.currentStay).length}/{rooms.length} occupied
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
            {rooms.map((room) => (
              <RoomTile key={room._id} room={room} now={isToday ? now : null} onOpen={onOpen} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function RoomTile({ room, now, onOpen }: { room: LiveRoomItem; now: number | null; onOpen: (id: string) => void }) {
  const cleaning = CLEANING_STATUS[room.cleaningStatus];
  const stay = room.currentStay;
  const arriving = room.occupancyStatus === "ARRIVING_TODAY";
  const unpaid = stay?.paymentStatus === "UNPAID";
  // only today has a clock to race: ready-by against now
  const { urgency, minutesLeft } = now !== null ? roomUrgency(room, now) : { urgency: "NO_DEADLINE" as const, minutesLeft: null };
  const racing = room.arrival && minutesLeft !== null;

  let detail: React.ReactNode = <span className="text-muted-foreground">Vacant</span>;
  if (stay) {
    detail = (
      <>
        <span className="truncate font-medium text-foreground">{stay.guestName}</span>
        {unpaid ? (
          <span className="shrink-0 font-medium text-gold">Unpaid</span>
        ) : (
          <span className="shrink-0 text-muted-foreground">
            {arriving ? "arr" : "out"} {arriving ? `${stay.nights}n` : shortDate(stay.checkOutDate)}
          </span>
        )}
      </>
    );
  } else if (room.departingStay) {
    detail = <span className="text-muted-foreground">Checked out today</span>;
  } else if (room.nextStay) {
    detail = <span className="truncate text-muted-foreground">Next {shortDate(room.nextStay.checkInDate)}</span>;
  }

  return (
    <button
      type="button"
      onClick={() => onOpen(room._id)}
      className={cn(
        "group relative flex h-[76px] flex-col justify-between overflow-hidden rounded-md border bg-surface px-3 py-2 text-left transition-colors",
        "hover:border-primary/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        urgency === "LATE"
          ? "border-destructive/60"
          : urgency === "AT_RISK"
            ? "border-warning/70"
            : "border-border"
      )}
      aria-label={`Room ${room.roomNumber}, ${cleaning.label}${stay ? `, ${stay.guestName}` : ", vacant"}`}
    >
      {/* occupancy bar: solid when a guest sleeps here tonight */}
      <span
        className={cn("absolute inset-y-0 left-0 w-1", stay ? "bg-primary" : "bg-transparent")}
        aria-hidden
      />
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-sm font-semibold tabular-nums text-foreground">{room.roomNumber}</span>
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          {racing ? (
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[11px] font-medium tabular-nums",
                urgency === "LATE"
                  ? "bg-destructive text-white"
                  : urgency === "AT_RISK"
                    ? "bg-warning-soft text-warning"
                    : "bg-secondary text-secondary-foreground"
              )}
              title={`Ready by ${clock(room.arrival!.readyBy)}`}
            >
              {shortCountdown(minutesLeft!)}
            </span>
          ) : arriving ? (
            <span className="font-medium text-warning">Arriving</span>
          ) : null}
          <span className={cn("size-2 rounded-full", cleaning.swatch)} title={cleaning.label} />
        </span>
      </div>
      <div className="flex min-w-0 items-baseline justify-between gap-2 text-xs">{detail}</div>
      <span className="sr-only">{roomTypeLabel(room.roomType)}</span>
    </button>
  );
}
