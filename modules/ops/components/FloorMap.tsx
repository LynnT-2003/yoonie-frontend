"use client";

import * as React from "react";
import { BedDouble, Plane } from "lucide-react";
import type { LiveRoomItem } from "@/lib/types/hospitality";
import { cn } from "@/lib/utils";
import { CLEANING_ORDER, CLEANING_STATUS, CLEANING_TILE, floorLabel } from "./roomStatus";
import { roomUrgency } from "./urgency";

/** The building as it is: floors top-down, each room a tile coloured by readiness. Read-only. */
export function FloorMap({
  rooms,
  now,
  onOpen,
}: {
  rooms: LiveRoomItem[];
  now: number;
  onOpen: (roomId: string) => void;
}) {
  const floors = React.useMemo(() => {
    const map = new Map<number, LiveRoomItem[]>();
    for (const r of rooms) map.set(r.floor, [...(map.get(r.floor) ?? []), r]);
    return [...map.entries()].sort(([a], [b]) => b - a);
  }, [rooms]);

  return (
    <div>
      <div className="space-y-3">
        {floors.map(([floor, floorRooms]) => (
          <div key={floor} className="flex items-start gap-3">
            <span className="w-14 shrink-0 pt-2 text-[11px] text-muted-foreground">{floorLabel(floor)}</span>
            <div className="grid flex-1 grid-cols-6 gap-1.5 sm:grid-cols-8 lg:grid-cols-12">
              {floorRooms.map((r) => {
                const { urgency } = roomUrgency(r, now);
                return (
                  <button
                    key={r._id}
                    type="button"
                    onClick={() => onOpen(r._id)}
                    title={`${r.roomNumber} · ${CLEANING_STATUS[r.cleaningStatus].label}`}
                    className={cn(
                      "relative flex aspect-square items-center justify-center rounded-md border text-[11px] font-semibold tabular-nums transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      CLEANING_TILE[r.cleaningStatus],
                      (urgency === "LATE" || urgency === "AT_RISK") &&
                        (urgency === "LATE" ? "ring-2 ring-destructive ring-offset-1 ring-offset-surface" : "ring-2 ring-warning ring-offset-1 ring-offset-surface")
                    )}
                  >
                    <span className="font-mono">{r.roomNumber}</span>
                    {r.arrival ? (
                      <Plane className="absolute right-0.5 top-0.5 size-2.5 text-warning" aria-label="Arriving today" />
                    ) : null}
                    {r.currentStay && !r.arrival ? (
                      <BedDouble className="absolute bottom-0.5 left-0.5 size-2.5 opacity-60" aria-label="Occupied" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3 text-[11px] text-muted-foreground">
        {CLEANING_ORDER.map((s) => (
          <span key={s} className="flex items-center gap-1.5">
            <span className={cn("size-2.5 rounded-sm border", CLEANING_TILE[s])} />
            {CLEANING_STATUS[s].short}
          </span>
        ))}
        <span className="flex items-center gap-1">
          <Plane className="size-3 text-warning" /> arriving
        </span>
        <span className="flex items-center gap-1">
          <BedDouble className="size-3" /> occupied
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2.5 rounded-sm ring-2 ring-warning" /> tight
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2.5 rounded-sm ring-2 ring-destructive" /> late
        </span>
      </div>
    </div>
  );
}
