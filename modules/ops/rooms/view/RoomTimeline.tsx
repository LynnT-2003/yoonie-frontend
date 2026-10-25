"use client";

import * as React from "react";
import type { LiveRoomItem, LiveStay } from "@/lib/types/hospitality";
import { cn } from "@/lib/utils";
import { CLEANING_STATUS } from "@/modules/ops/components/roomStatus";
import { shortDate, weekday } from "@/modules/ops/components/format";

const ROOM_COL = "7.5rem";

/** Tape chart: one row per room, one bar per stay spanning the nights it occupies. */
export function RoomTimeline({
  rooms,
  stays,
  dates,
  selectedDate,
  today,
  now,
  onOpen,
}: {
  rooms: LiveRoomItem[];
  stays: LiveStay[];
  dates: string[];
  selectedDate: string;
  today: string;
  now: number;
  onOpen: (roomId: string) => void;
}) {
  // how far through today we are (hotel time, UTC+7), for the "now" line in today's column
  const dayFraction = (((now + 7 * 3_600_000) % 86_400_000) / 86_400_000) * 100;
  const nowLine = (
    <div className="pointer-events-none absolute inset-y-0 z-[2] w-0.5 bg-destructive/70" style={{ left: `${dayFraction}%` }} aria-hidden />
  );
  const staysByRoom = React.useMemo(() => {
    const map = new Map<string, LiveStay[]>();
    for (const s of stays) if (s.roomId) map.set(s.roomId, [...(map.get(s.roomId) ?? []), s]);
    return map;
  }, [stays]);

  const grid = { gridTemplateColumns: `${ROOM_COL} repeat(${dates.length}, minmax(3.25rem, 1fr))` };
  const first = dates[0];
  const last = dates[dates.length - 1];
  const indexOf = (date: string) => dates.indexOf(date);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[52rem]">
        {/* date header */}
        <div className="sticky top-0 z-10 grid border-b border-border bg-surface" style={grid}>
          <div className="sticky left-0 bg-surface px-3 py-2 text-xs font-medium text-muted-foreground">Room</div>
          {dates.map((d) => (
            <div
              key={d}
              className={cn(
                "border-l border-border px-1 py-2 text-center text-[11px] leading-tight",
                d === selectedDate ? "bg-secondary font-medium text-secondary-foreground" : "text-muted-foreground"
              )}
            >
              <div>{weekday(d)}</div>
              <div className="tabular-nums">{shortDate(d)}</div>
              {d === today ? (
                <div className="text-[10px] font-medium tabular-nums text-destructive">
                  {new Date(now).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Bangkok" })}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        {rooms.map((room) => {
          const roomStays = staysByRoom.get(room._id) ?? [];
          return (
            <div key={room._id} className="relative grid border-b border-border last:border-0" style={grid}>
              <button
                type="button"
                onClick={() => onOpen(room._id)}
                style={{ gridColumn: 1, gridRow: 1 }}
                className="sticky left-0 z-[1] flex items-center gap-2 bg-surface px-3 py-2 text-left hover:bg-muted"
              >
                <span className={cn("size-2 shrink-0 rounded-full", CLEANING_STATUS[room.cleaningStatus].swatch)} aria-hidden />
                <span className="font-mono text-[13px] font-semibold tabular-nums">{room.roomNumber}</span>
              </button>
              {dates.map((d, i) => (
                <div
                  key={d}
                  style={{ gridColumn: i + 2, gridRow: 1 }}
                  className={cn("relative h-10 border-l border-border", d === selectedDate && "bg-secondary/50")}
                  aria-hidden
                >
                  {d === today ? nowLine : null}
                </div>
              ))}
              {roomStays.map((s) => {
                const start = s.checkInDate < first ? 0 : indexOf(s.checkInDate);
                const endExclusive = s.checkOutDate > last ? dates.length : indexOf(s.checkOutDate);
                if (start < 0 || endExclusive <= start) return null;
                const paid = s.paymentStatus === "PAID";
                return (
                  <button
                    key={s.lineId}
                    type="button"
                    onClick={() => onOpen(room._id)}
                    title={`${s.guestName} · ${shortDate(s.checkInDate)} – ${shortDate(s.checkOutDate)} · ${s.orderNumber}${paid ? "" : " · unpaid"}`}
                    style={{ gridColumn: `${start + 2} / ${endExclusive + 2}`, gridRow: 1 }}
                    className={cn(
                      "z-[1] mx-0.5 my-1.5 flex min-w-0 items-center gap-1.5 rounded px-2 text-left text-[11px] font-medium",
                      paid
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border border-dashed border-primary/50 bg-secondary text-secondary-foreground hover:bg-secondary/80",
                      s.checkInDate < first && "rounded-l-none",
                      s.checkOutDate > last && "rounded-r-none"
                    )}
                  >
                    <span className="truncate">{s.guestName}</span>
                    <span className="shrink-0 opacity-70 tabular-nums">{s.nights}n</span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
