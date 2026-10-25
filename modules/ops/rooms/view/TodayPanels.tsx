"use client";

import * as React from "react";
import { Plane } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { LiveRoomItem, LiveService, LiveStay } from "@/lib/types/hospitality";
import { ServicesPanel } from "./ServicesPanel";
import { Panel } from "@/modules/ops/components/OpsPage";
import { CLEANING_STATUS, roomTypeLabel } from "@/modules/ops/components/roomStatus";
import { formatThb, shortDate, timeAgo } from "@/modules/ops/components/format";

/** Bookings younger than this get a "New" badge so a fresh guest booking is easy to spot. */
const NEW_BOOKING_MS = 15 * 60_000;

function StayRow({
  stay,
  room,
  aside,
  showFlight = true,
  onOpen,
}: {
  stay: LiveStay;
  room?: LiveRoomItem;
  aside?: React.ReactNode;
  showFlight?: boolean;
  onOpen: (roomId: string) => void;
}) {
  const body = (
    <>
      <span className="w-10 shrink-0 font-mono text-[13px] font-semibold tabular-nums text-foreground">
        {stay.roomNumber ?? "—"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium text-foreground">{stay.guestName}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {roomTypeLabel(stay.roomType)} · {stay.nights}n
          {showFlight && stay.flightNumber ? (
            <>
              {" · "}
              <Plane className="inline size-3 align-[-2px]" aria-hidden /> {stay.flightNumber}
              {stay.flightEta ? ` ${stay.flightEta}` : ""}
            </>
          ) : null}
        </span>
      </span>
      {aside ?? (room ? <Badge tone={CLEANING_STATUS[room.cleaningStatus].tone}>{CLEANING_STATUS[room.cleaningStatus].short}</Badge> : null)}
    </>
  );
  const cls = "flex w-full items-center gap-3 px-4 py-2.5 text-left";
  return (
    <li>
      {stay.roomId ? (
        <button type="button" onClick={() => onOpen(stay.roomId!)} className={`${cls} hover:bg-muted`}>
          {body}
        </button>
      ) : (
        <div className={cls}>{body}</div>
      )}
    </li>
  );
}

function StayList({
  title,
  stays,
  roomsById,
  empty,
  onOpen,
}: {
  title: string;
  stays: LiveStay[];
  roomsById: Map<string, LiveRoomItem>;
  empty: string;
  onOpen: (roomId: string) => void;
}) {
  return (
    <Panel title={title} meta={stays.length} bodyClassName="p-0">
      {stays.length ? (
        <ul className="divide-y divide-border">
          {stays.map((s) => (
            <StayRow key={s.lineId} stay={s} room={s.roomId ? roomsById.get(s.roomId) : undefined} onOpen={onOpen} />
          ))}
        </ul>
      ) : (
        <p className="px-4 py-6 text-center text-[13px] text-muted-foreground">{empty}</p>
      )}
    </Panel>
  );
}

export function TodayPanels({
  arrivals,
  departures,
  services,
  recentBookings,
  rooms,
  isToday,
  now,
  onOpen,
}: {
  arrivals: LiveStay[];
  departures: LiveStay[];
  services: LiveService[];
  recentBookings: LiveStay[];
  rooms: LiveRoomItem[];
  isToday: boolean;
  /** Server time of the snapshot, so "New" and "5 min ago" stay pure and refresh with each poll. */
  now: number;
  onOpen: (roomId: string) => void;
}) {
  const roomsById = React.useMemo(() => new Map(rooms.map((r) => [r._id, r])), [rooms]);
  const roomIdByNumber = React.useMemo(() => new Map(rooms.map((r) => [r.roomNumber, r._id])), [rooms]);

  return (
    <div className="space-y-4">
      <StayList
        title={isToday ? "Arriving today" : "Arrivals"}
        stays={arrivals}
        roomsById={roomsById}
        empty="No arrivals"
        onOpen={onOpen}
      />
      <StayList
        title={isToday ? "Departing today" : "Departures"}
        stays={departures}
        roomsById={roomsById}
        empty="No departures"
        onOpen={onOpen}
      />
      <ServicesPanel
        services={services}
        isToday={isToday}
        onOpenRoom={(roomNumber) => {
          const id = roomIdByNumber.get(roomNumber);
          if (id) onOpen(id);
        }}
      />
      <Panel title="Latest bookings" meta="all dates" bodyClassName="p-0">
        {recentBookings.length ? (
          <ul className="divide-y divide-border">
            {recentBookings.map((b) => {
              const isNew = now - new Date(b.bookedAt).getTime() < NEW_BOOKING_MS;
              return (
                <StayRow
                  key={b.lineId}
                  stay={b}
                  showFlight={false}
                  onOpen={onOpen}
                  aside={
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      {isNew ? <Badge tone="success">New</Badge> : null}
                      <span className="text-[11px] tabular-nums text-muted-foreground">
                        {shortDate(b.checkInDate)} · {formatThb(b.orderTotalThb)}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {timeAgo(b.bookedAt, now)}
                        {b.paymentStatus === "UNPAID" ? " · unpaid" : ""}
                      </span>
                    </span>
                  }
                />
              );
            })}
          </ul>
        ) : (
          <p className="px-4 py-6 text-center text-[13px] text-muted-foreground">No bookings yet</p>
        )}
      </Panel>
    </div>
  );
}
