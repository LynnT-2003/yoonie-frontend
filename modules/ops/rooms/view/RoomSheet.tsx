"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Mail, Phone, Plane } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogDescription, DialogTitle, SheetContent } from "@/components/ui/dialog";
import type { LiveRoomItem, LiveStay } from "@/lib/types/hospitality";
import {
  CLEANING_STATUS,
  OCCUPANCY_STATUS,
  floorLabel,
  roomTypeLabel,
} from "@/modules/ops/components/roomStatus";
import { formatThb, shortDate } from "@/modules/ops/components/format";
import { ServiceState, serviceDetail } from "./ServicesPanel";
import { Folio } from "@/modules/ops/components/Folio";
import { ReasonForm } from "@/modules/ops/components/ReasonForm";
import { clock } from "@/modules/ops/components/urgency";
import { FlightEditor } from "@/modules/ops/components/FrontDesk";
import { useYoonieFocus } from "@/components/assistant/YooniePalette";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-medium text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}

function StayCard({ stay }: { stay: LiveStay }) {
  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{stay.guestName}</p>
          <p className="font-mono text-xs text-muted-foreground">{stay.orderNumber}</p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          {stay.vipTier !== "NONE" ? <Badge tone="warning">{stay.vipTier.toLowerCase()}</Badge> : null}
          <Badge tone={stay.paymentStatus === "PAID" ? "success" : "neutral"}>
            {stay.paymentStatus === "PAID" ? "Paid" : "Pay at hotel"}
          </Badge>
        </div>
      </div>
      <dl className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <dt className="text-muted-foreground">Check-in</dt>
          <dd className="font-medium tabular-nums">{shortDate(stay.checkInDate)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Check-out</dt>
          <dd className="font-medium tabular-nums">{shortDate(stay.checkOutDate)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Stay</dt>
          <dd className="font-medium tabular-nums">
            {stay.nights}n · {stay.pax} pax
          </dd>
        </div>
      </dl>
      {stay.flightNumber ? (
        <p className="flex items-center gap-1.5 text-xs text-foreground">
          <Plane className="size-3.5 text-muted-foreground" aria-hidden />
          {stay.flightNumber}
          {stay.flightEta ? ` · lands ${stay.flightEta}` : ""}
          {stay.meetingDoor ? ` · door ${stay.meetingDoor}` : ""}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
        {stay.guestEmail ? (
          <a href={`mailto:${stay.guestEmail}`} className="flex items-center gap-1 hover:text-foreground">
            <Mail className="size-3" aria-hidden /> {stay.guestEmail}
          </a>
        ) : null}
        {stay.guestPhone ? (
          <a href={`tel:${stay.guestPhone}`} className="flex items-center gap-1 hover:text-foreground">
            <Phone className="size-3" aria-hidden /> {stay.guestPhone}
          </a>
        ) : null}
      </div>
      {stay.extras.length ? (
        <div className="space-y-2 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">Services on this booking</p>
          <ul className="space-y-2">
            {stay.extras.map((x) => (
              <li key={x.lineId} className="text-xs">
                <div className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-foreground">{x.serviceName}</span>
                    <span className="block truncate text-muted-foreground">
                      {shortDate(x.date)} {x.needsDetails ? "" : x.time} · {serviceDetail(x)}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <ServiceState service={x} />
                    <span className="tabular-nums text-muted-foreground">{formatThb(x.totalThb)}</span>
                  </span>
                </div>
                {x.serviceKind === "AIRPORT_TRANSFER" ? (
                  <div className="mt-1.5 flex flex-wrap justify-end">
                    <FlightEditor
                      key={`${x.flightNumber}-${x.startsAt}`}
                      orderId={x.orderId}
                      lineId={x.lineId}
                      flightNumber={x.flightNumber}
                      landingAt={x.flightNumber ? x.startsAt : undefined}
                      meetingDoor={x.meetingDoor}
                      defaultDate={stay.checkInDate}
                    />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="border-t border-border pt-3">
        <p className="mb-2 text-xs text-muted-foreground">Folio</p>
        <Folio charges={stay.charges} orderId={stay.orderId} />
      </div>
    </div>
  );
}

type ReportNeedsCleaning = (roomId: string, reason: string, onDone?: () => void) => void;

export function RoomSheet({
  room,
  onClose,
  onReportNeedsCleaning,
  isReporting,
  reportError,
}: {
  room?: LiveRoomItem;
  onClose: () => void;
  onReportNeedsCleaning: ReportNeedsCleaning;
  isReporting: boolean;
  reportError?: string;
}) {
  return (
    <Dialog open={Boolean(room)} onOpenChange={(open) => (open ? null : onClose())}>
      <SheetContent size="md">
        {room ? (
          <RoomSheetBody
            room={room}
            onReportNeedsCleaning={onReportNeedsCleaning}
            isReporting={isReporting}
            reportError={reportError}
          />
        ) : null}
      </SheetContent>
    </Dialog>
  );
}

const TASK_STATUS: Record<string, string> = {
  OPEN: "To do",
  ACKNOWLEDGED: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
  DISMISSED: "Dismissed",
};

function RoomSheetBody({
  room,
  onReportNeedsCleaning,
  isReporting,
  reportError,
}: {
  room: LiveRoomItem;
  onReportNeedsCleaning: ReportNeedsCleaning;
  isReporting: boolean;
  reportError?: string;
}) {
  const cleaning = CLEANING_STATUS[room.cleaningStatus];
  const occupancy = OCCUPANCY_STATUS[room.occupancyStatus];
  useYoonieFocus(room.roomNumber);
  const task = room.activeDispatch;
  const [reporting, setReporting] = React.useState(false);

  return (
    <>
      <div className="border-b border-border px-6 py-5 pr-14">
        <DialogTitle className="flex items-center gap-3 text-lg font-semibold">
          <span className="font-mono tabular-nums">Room {room.roomNumber}</span>
          <Badge tone={occupancy.tone}>{occupancy.label}</Badge>
        </DialogTitle>
        <DialogDescription className="mt-1 text-[13px]">
          {roomTypeLabel(room.roomType)} · {floorLabel(room.floor)} · up to {room.maxOccupancy} guests ·{" "}
          {formatThb(room.baseRateThb)}/night
        </DialogDescription>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
        {/* Read-only: the room's state. Work on it happens in Dispatch. */}
        <Section title="Readiness">
          <div className="space-y-3 rounded-lg border border-border p-4">
            <div className="flex items-center justify-between gap-3">
              <Badge tone={cleaning.tone} dot>
                {cleaning.label}
              </Badge>
              {room.arrival ? (
                <span className="text-xs text-muted-foreground">
                  ready by <span className="font-medium text-foreground">{clock(room.arrival.readyBy)}</span>
                </span>
              ) : null}
            </div>
            {task ? (
              <div className="flex items-center justify-between gap-3 border-t border-border pt-3 text-xs">
                <span className="min-w-0">
                  <span className="block truncate text-foreground">{task.title}</span>
                  <span className="text-muted-foreground">
                    {TASK_STATUS[task.status] ?? task.status} · {task.assigneeName ?? "open to any housekeeper"}
                  </span>
                </span>
                <Link
                  href="/ops/dispatch?lane=rooms"
                  className="inline-flex shrink-0 items-center gap-1 font-medium text-primary hover:underline"
                >
                  Open in Dispatch <ArrowUpRight className="size-3" />
                </Link>
              </div>
            ) : room.cleaningStatus === "INSPECTED" ? null : (
              <p className="border-t border-border pt-3 text-xs text-muted-foreground">
                {room.cleaningStatus === "CLEAN" ? "Waiting for inspection in Dispatch." : "No job today yet."}
              </p>
            )}
          </div>
          {room.cleaningStatus !== "DIRTY" ? (
            reporting ? (
              <ReasonForm
                placeholder="What's wrong? e.g. guest checked out, spill in bathroom"
                submitLabel="Send to housekeeping"
                pending={isReporting}
                onCancel={() => setReporting(false)}
                onSubmit={(reason) => onReportNeedsCleaning(room._id, reason, () => setReporting(false))}
              />
            ) : (
              <Button size="sm" variant="outline" onClick={() => setReporting(true)}>
                Needs cleaning…
              </Button>
            )
          ) : null}
          {reportError && reporting ? <p className="text-xs text-destructive">{reportError}</p> : null}
        </Section>

        <Section title={room.occupancyStatus === "ARRIVING_TODAY" ? "Arriving today" : "Tonight"}>
          {room.currentStay ? (
            <StayCard stay={room.currentStay} />
          ) : (
            <p className="rounded-lg border border-dashed border-border px-4 py-5 text-center text-[13px] text-muted-foreground">
              No guest tonight
            </p>
          )}
        </Section>

        {room.departingStay ? (
          <Section title="Checked out today">
            <StayCard stay={room.departingStay} />
          </Section>
        ) : null}

        {room.nextStay ? (
          <Section title="Next arrival">
            <StayCard stay={room.nextStay} />
          </Section>
        ) : null}
      </div>
    </>
  );
}
