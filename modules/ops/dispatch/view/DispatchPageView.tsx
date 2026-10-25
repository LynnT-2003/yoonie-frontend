"use client";

import * as React from "react";
import { AlertTriangle, BedDouble, Car, CheckCircle2, Compass, Plane } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DispatchTask, LiveRoomItem, PickupStage, RosterMember } from "@/lib/types/hospitality";
import {
  PICKUP_ISSUE,
  PICKUP_STAGE,
  PICKUP_STAGE_ORDER,
  PickupTracker,
  openIssue,
  pickupHeadline,
  pickupStage,
} from "@/modules/ops/components/pickupStage";
import { cn } from "@/lib/utils";
import { DateNav } from "@/modules/ops/components/DateNav";
import {
  EmptyState,
  LiveClock,
  LiveIndicator,
  OpsPage,
  OpsPageHeader,
  Panel,
  SegmentedControl,
} from "@/modules/ops/components/OpsPage";
import { ReasonForm } from "@/modules/ops/components/ReasonForm";
import { CLEANING_STATUS, roomTypeLabel } from "@/modules/ops/components/roomStatus";
import { formatThb, shortDate, weekday } from "@/modules/ops/components/format";
import { URGENCY_STYLE, clock, countdown, hasArrival, type Urgency } from "@/modules/ops/components/urgency";
import type { DispatchPageVm, Lane } from "../viewModel/dispatchPageVm";

const TYPE_ICON = {
  HOUSEKEEPING_TURNAROUND: BedDouble,
  AIRPORT_PICKUP: Car,
  TOUR_CONSOLIDATION: Compass,
} as const;

export function DispatchPageView({ vm }: { vm: DispatchPageVm }) {
  return (
    <OpsPage>
      <div id="tour-dispatch-header">
        <OpsPageHeader
          eyebrow={
            <>
              <span>{vm.branch?.name ?? "—"}</span>
              <span aria-hidden>·</span>
              <LiveClock timeZone={vm.branch?.timezone} />
              <span aria-hidden>·</span>
              <LiveIndicator updatedAt={vm.updatedAt} isFetching={vm.isFetching} />
            </>
          }
          title="Dispatch"
          description={`${weekday(vm.date)} ${shortDate(vm.date)}${vm.isToday ? " · today" : ""} — every job in the hotel: who has it, what's next, what's late`}
          actions={<DateNav date={vm.date} today={vm.today} onChange={vm.setDate} />}
        />
      </div>

      {vm.isToday ? <Runway vm={vm} /> : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl<Lane>
          label="Kind of work"
          value={vm.lane}
          onChange={vm.setLane}
          options={[
            {
              value: "ALL",
              label: (
                <>
                  All <Count n={vm.counts.ALL} />
                </>
              ),
            },
            {
              value: "HOUSEKEEPING_TURNAROUND",
              label: (
                <>
                  Rooms <Count n={vm.counts.HOUSEKEEPING_TURNAROUND} />
                </>
              ),
            },
            {
              value: "AIRPORT_PICKUP",
              label: (
                <>
                  Pickups <Count n={vm.counts.AIRPORT_PICKUP} />
                </>
              ),
            },
            {
              value: "TOUR_CONSOLIDATION",
              label: (
                <>
                  Tours <Count n={vm.counts.TOUR_CONSOLIDATION} />
                </>
              ),
            },
          ]}
        />
        <Select value={vm.owner} onValueChange={vm.setOwner}>
          <SelectTrigger className="h-8 w-full text-[13px] sm:w-56" aria-label="Whose work">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="ALL">Everyone&apos;s work</SelectItem>
            <SelectItem value="UNASSIGNED">Unassigned ({vm.counts.unassigned})</SelectItem>
            <SelectItem value="MINE">Mine</SelectItem>
            {vm.roster.length ? <SelectSeparator /> : null}
            {vm.roster.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div id="tour-dispatch-inbox">
          <Panel
            title="To do"
            meta={vm.open.length ? `${vm.open.length} · most urgent first` : undefined}
            bodyClassName="p-0"
          >
            {vm.isLoading ? (
              <div className="m-4 h-40 animate-pulse rounded-md bg-muted" />
            ) : vm.open.length ? (
              <ol className="divide-y divide-border">
                {vm.open.map(({ task, urgency, minutesLeft }) => (
                  <TaskRow key={task._id} vm={vm} task={task} urgency={urgency} minutesLeft={minutesLeft} />
                ))}
              </ol>
            ) : (
              <div className="p-4">
                <EmptyState
                  title="Nothing waiting"
                  description="Every job in this view is done or with someone else."
                />
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-4">
          <InspectPanel vm={vm} />
          <DonePanel tasks={vm.done} />
        </div>
      </div>
    </OpsPage>
  );
}

function Count({ n }: { n: number }) {
  return <span className="tabular-nums text-muted-foreground">{n}</span>;
}

/** Today as a runway: rooms that must be ready and flights that land, against a live "now". */
function Runway({ vm }: { vm: DispatchPageVm }) {
  const dayStart = new Date(`${vm.today}T06:00:00+07:00`).getTime();
  const dayEnd = new Date(`${vm.today}T23:59:00+07:00`).getTime();
  const pos = (t: number) => Math.min(100, Math.max(0, ((t - dayStart) / (dayEnd - dayStart)) * 100));

  const trackRef = React.useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = React.useState(1200);
  React.useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setTrackWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // stack markers that would overlap into lanes; each marker is ~120px wide on any screen
  const minGap = (120 / Math.max(1, trackWidth)) * 100;
  const lanes: number[] = [];
  const markers = vm.runway.map((m) => {
    const x = pos(new Date(m.at).getTime());
    let lane = lanes.findIndex((last) => x - last > minGap);
    if (lane === -1) {
      lane = lanes.length;
      lanes.push(x);
    } else lanes[lane] = x;
    return { ...m, x, lane };
  });

  const nowX = vm.now >= dayStart && vm.now <= dayEnd ? pos(vm.now) : null;
  const next = vm.runway.find((m) => m.urgency !== "DONE" && new Date(m.at).getTime() >= vm.now);

  const focus = (id: string) =>
    document.getElementById(`task-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-xs">
      <div className="flex flex-wrap items-end gap-x-8 gap-y-3 px-5 py-4">
        <Stat label="Open jobs" value={vm.counts.ALL} />
        <Stat label="Unassigned" value={vm.counts.unassigned} tone={vm.counts.unassigned ? "warning" : undefined} />
        <Stat label="Tight" value={vm.counts.atRisk} tone={vm.counts.atRisk ? "warning" : undefined} />
        <Stat label="Late" value={vm.counts.late} tone={vm.counts.late ? "danger" : undefined} />
        <Stat label="To inspect" value={vm.toInspect.length} tone={vm.toInspect.length ? "info" : undefined} />
        {next ? (
          <button
            type="button"
            onClick={() => focus(next.task._id)}
            className="ml-auto rounded-md bg-secondary px-3 py-2 text-left text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            <span className="block text-[11px] opacity-70">Next deadline</span>
            <span className="text-[13px] font-medium">
              {next.task.housekeeping
                ? `Room ${next.task.housekeeping.roomNumber} ready`
                : `${next.task.pickup?.flightNumber} lands`}{" "}
              {clock(next.at)} · {next.minutesLeft !== null ? countdown(next.minutesLeft) : ""}
            </span>
          </button>
        ) : null}
      </div>
      <div className="border-t border-border px-5 pb-3 pt-4">
        <div ref={trackRef} className="relative" style={{ height: `${Math.max(1, lanes.length) * 30 + 26}px` }}>
          {/* the part of the day already gone */}
          {nowX !== null ? (
            <div
              className="absolute inset-y-0 left-0 rounded-l bg-muted/70"
              style={{ width: `${nowX}%` }}
              aria-hidden
            />
          ) : null}
          {[6, 9, 12, 15, 18, 21].map((h) => {
            const x = pos(new Date(`${vm.today}T${String(h).padStart(2, "0")}:00:00+07:00`).getTime());
            const nearNow = nowX !== null && Math.abs(x - nowX) < (48 / Math.max(1, trackWidth)) * 100;
            return (
              <div
                key={h}
                className="absolute inset-y-0"
                style={{
                  left: `${pos(new Date(`${vm.today}T${String(h).padStart(2, "0")}:00:00+07:00`).getTime())}%`,
                }}
              >
                <div className="h-full w-px bg-border" />
                {nearNow ? null : (
                  <span className="absolute bottom-0 -translate-x-1/2 text-[10px] tabular-nums text-muted-foreground">
                    {String(h).padStart(2, "0")}:00
                  </span>
                )}
              </div>
            );
          })}
          {nowX !== null ? (
            <div className="absolute inset-y-0 z-10" style={{ left: `${nowX}%` }}>
              <div className="h-[calc(100%-14px)] w-0.5 bg-destructive/70" />
              <span className="absolute bottom-0 -translate-x-1/2 rounded bg-destructive px-1 text-[10px] font-medium tabular-nums text-white">
                {clock(new Date(vm.now).toISOString())}
              </span>
            </div>
          ) : null}
          {markers.map((m) => {
            const isRoom = Boolean(m.task.housekeeping);
            return (
              <button
                key={m.task._id}
                type="button"
                onClick={() => focus(m.task._id)}
                title={`${m.task.title} · ${URGENCY_STYLE[m.urgency].label}`}
                style={{ left: `${m.x}%`, top: `${m.lane * 30 + 2}px` }}
                className={cn(
                  "absolute z-20 flex h-6 -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded px-2 text-[11px] font-medium ring-1 transition-transform hover:scale-105",
                  m.urgency === "DONE" && "bg-success-soft text-success ring-success/30",
                  (m.urgency === "ON_TRACK" || m.urgency === "NO_DEADLINE") &&
                    "bg-primary text-primary-foreground ring-primary",
                  m.urgency === "AT_RISK" && "bg-warning-soft text-warning ring-warning/40",
                  m.urgency === "LATE" && "bg-danger-soft text-destructive ring-destructive/40",
                )}
              >
                {m.urgency === "DONE" ? (
                  <CheckCircle2 className="size-3" />
                ) : isRoom ? (
                  <BedDouble className="size-3" />
                ) : (
                  <Plane className="size-3" />
                )}
                <span className="font-mono">
                  {isRoom ? m.task.housekeeping!.roomNumber : m.task.pickup!.flightNumber}
                </span>
                <span className="opacity-70">{clock(m.at)}</span>
              </button>
            );
          })}
          {!markers.length ? (
            <p className="absolute inset-x-0 top-1 text-center text-[13px] text-muted-foreground">
              No arrivals or pickups with a deadline today
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "warning" | "danger" | "info" }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "text-2xl font-semibold tabular-nums tracking-tight text-foreground",
          tone === "warning" && "text-warning",
          tone === "danger" && "text-destructive",
          tone === "info" && "text-info",
        )}
      >
        {value}
      </p>
    </div>
  );
}

type Ask = "MERGE" | "CANCEL" | "KEEP_WAITING" | "NO_SHOW";

const ASK_COPY: Record<Ask, { placeholder: string; submit: string }> = {
  MERGE: { placeholder: "Merged into which departure?", submit: "Record merge" },
  CANCEL: { placeholder: "Why cancel? Guests to refund or move", submit: "Record cancellation" },
  KEEP_WAITING: { placeholder: "Tell the driver what to do, e.g. new landing 15:10, stay at door 4", submit: "Send to driver" },
  NO_SHOW: { placeholder: "What happened? e.g. guest unreachable, waited 60 min", submit: "Close as no-show" },
};

/** Where the van is: each step the driver reported, and any problem waiting on the desk. */
function PickupProgress({ task }: { task: DispatchTask }) {
  const issue = openIssue(task);
  return (
    <div className="mt-3 space-y-2 sm:pl-7">
      <PickupTracker task={task} className="max-w-xl" />
      {issue ? (
        <p className="flex items-start gap-2 rounded-md border border-destructive/30 bg-danger-soft px-3 py-2 text-xs text-destructive">
          <AlertTriangle className="mt-px size-3.5 shrink-0" aria-hidden />
          <span>
            <span className="font-medium">
              {PICKUP_ISSUE[issue.kind]} · {clock(issue.at)}
            </span>
            {issue.byName ? ` — ${issue.byName}` : ""}
            {issue.note ? `: “${issue.note}”` : ""}
          </span>
        </p>
      ) : null}
    </div>
  );
}

function TaskRow({
  vm,
  task,
  urgency,
  minutesLeft,
}: {
  vm: DispatchPageVm;
  task: DispatchTask;
  urgency: Urgency;
  minutesLeft: number | null;
}) {
  const Icon = TYPE_ICON[task.type];
  const [asking, setAsking] = React.useState<null | Ask>(null);
  const pending = vm.isPending(task._id) || (task.housekeeping ? vm.isPending(task.housekeeping.roomId) : false);

  return (
    <li id={`task-${task._id}`} className="relative py-3 pl-5 pr-4">
      <span className={cn("absolute inset-y-2 left-0 w-1 rounded-r", URGENCY_STYLE[urgency].bar)} aria-hidden />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Icon className="hidden size-4 shrink-0 text-muted-foreground sm:block" aria-hidden />
        <div className="min-w-0 flex-1">
          <TaskSummary task={task} urgency={urgency} minutesLeft={minutesLeft} />
        </div>
        {/* a tour flag is a decision for whoever is on duty, not a job someone owns */}
        {task.consolidation ? null : <Owner vm={vm} task={task} pending={pending} />}
        <div className={cn("flex shrink-0 gap-2 sm:justify-end", task.consolidation ? "sm:w-auto" : "sm:w-44")}>
          <NextAction vm={vm} task={task} pending={pending} onAsk={setAsking} />
        </div>
      </div>
      {task.pickup && task.assigneeUserId ? <PickupProgress task={task} /> : null}
      {asking ? (
        <div className="mt-3 sm:pl-7">
          <ReasonForm
            placeholder={ASK_COPY[asking].placeholder}
            submitLabel={ASK_COPY[asking].submit}
            pending={pending}
            onCancel={() => setAsking(null)}
            onSubmit={(note) => {
              if (asking === "MERGE" || asking === "CANCEL") vm.decide({ taskId: task._id, decision: asking, note });
              else vm.answerIssue(task._id, asking, note);
              setAsking(null);
            }}
          />
        </div>
      ) : null}
    </li>
  );
}

function TaskSummary({
  task,
  urgency,
  minutesLeft,
}: {
  task: DispatchTask;
  urgency: Urgency;
  minutesLeft: number | null;
}) {
  const deadline =
    minutesLeft !== null ? (
      <span
        className={cn(
          urgency === "LATE" && "font-medium text-destructive",
          urgency === "AT_RISK" && "font-medium text-warning",
        )}
      >
        {countdown(minutesLeft)}
      </span>
    ) : null;

  if (task.housekeeping) {
    const hk = task.housekeeping;
    const status = CLEANING_STATUS[task.cleaningStatus ?? "DIRTY"];
    return (
      <>
        <p className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-base font-semibold tabular-nums">Room {hk.roomNumber}</span>
          <Badge tone={status.tone} dot>
            {status.short}
          </Badge>
          {hk.isVip ? <Badge tone="warning">VIP</Badge> : null}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {hasArrival(task) ? (
            <>
              {hk.guestName ?? "Guest"}{" "}
              {hk.etaSource === "TRANSFER_FLIGHT" ? `lands on ${hk.flightNumber}` : "checks in"} · ready by{" "}
              {clock(hk.targetReadyBy)} · {deadline}
            </>
          ) : (
            "No arrival today — turn it before check-in"
          )}
        </p>
      </>
    );
  }
  if (task.pickup) {
    const p = task.pickup;
    const stage = pickupStage(task);
    const issue = openIssue(task);
    const beforeGuest = stage !== "GUEST_ON_BOARD" && stage !== "DROPPED_OFF";
    return (
      <>
        <p className="flex flex-wrap items-center gap-2">
          <span className="text-[15px] font-semibold">
            {p.flightNumber} · lands {clock(p.etaAt)}
          </span>
          {issue ? (
            <Badge tone="danger" dot>
              {PICKUP_ISSUE[issue.kind]}
            </Badge>
          ) : task.assigneeUserId ? (
            <Badge tone={PICKUP_STAGE[stage].tone} dot>
              {PICKUP_STAGE[stage].label}
            </Badge>
          ) : (
            <Badge tone="danger" dot>
              No driver
            </Badge>
          )}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          <span className="text-foreground">{pickupHeadline(task)}</span> · {p.guestName}
          {p.meetingDoor ? ` · door ${p.meetingDoor}` : ""}
          {p.vehiclePlate ? ` · ${p.vehiclePlate}` : ""}
          {beforeGuest && deadline ? <> · {deadline}</> : null}
        </p>
      </>
    );
  }
  const c = task.consolidation!;
  const belowMin = c.booked < c.minViablePax;
  return (
    <>
      <p className="flex flex-wrap items-center gap-2">
        <span className="text-[15px] font-semibold">
          {c.serviceName} · {clock(c.departsAt)}
        </span>
        <Badge tone={belowMin ? "danger" : "warning"}>
          {belowMin ? `Below minimum ${c.minViablePax}` : "Low fill"}
        </Badge>
      </p>
      <p className="mt-0.5 truncate text-xs text-muted-foreground">
        {c.booked}/{c.capacity} booked · {formatThb(c.revenueThb)} revenue vs {formatThb(c.fixedCostThb)} cost
        {c.projectedLossThb ? ` · ${formatThb(c.projectedLossThb)} loss if it runs` : ""} · decide by{" "}
        {clock(task.dueAt ?? c.departsAt)}
      </p>
    </>
  );
}

/** Radix Select can't use "" as a value, so the open pool gets a sentinel. */
const POOL = "__pool";

function Owner({ vm, task, pending }: { vm: DispatchPageVm; task: DispatchTask; pending: boolean }) {
  const roster: RosterMember[] = vm.roster;
  return (
    <div className="flex shrink-0 items-center gap-2 sm:w-52">
      <Select
        value={task.assigneeUserId ?? POOL}
        disabled={pending}
        onValueChange={(v) => vm.assign(task._id, v === POOL ? null : v)}
      >
        <SelectTrigger
          className={cn("h-8 min-w-0 flex-1 text-[13px]", !task.assigneeUserId && "text-muted-foreground")}
          aria-label={`Assign ${task.title}`}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value={POOL}>{task.housekeeping ? "Open to any housekeeper" : "Unassigned"}</SelectItem>
          <SelectSeparator />
          {task.assigneeUserId && !roster.some((p) => p.id === task.assigneeUserId) ? (
            <SelectItem value={task.assigneeUserId}>{task.assigneeName ?? "Assigned"}</SelectItem>
          ) : null}
          {roster.map((p) => (
            <SelectItem key={p.id} value={p.id} hint={p.jobTitle?.toLowerCase()}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!task.assigneeUserId && !task.consolidation ? (
        <Button size="sm" variant="ghost" disabled={pending} onClick={() => vm.claim(task._id)}>
          Take it
        </Button>
      ) : null}
    </div>
  );
}

function NextAction({
  vm,
  task,
  pending,
  onAsk,
}: {
  vm: DispatchPageVm;
  task: DispatchTask;
  pending: boolean;
  onAsk: (kind: Ask) => void;
}) {
  if (task.housekeeping) {
    const status = task.cleaningStatus ?? "DIRTY";
    const step = CLEANING_STATUS[status];
    // CLEAN rooms leave the to-do list and wait in "To inspect"
    if (!step.next || status === "CLEAN") return null;
    return (
      <Button
        className="w-full sm:w-auto"
        variant={status === "IN_PROGRESS" ? "default" : "outline"}
        disabled={pending}
        onClick={() =>
          vm.moveRoom({
            roomId: task.housekeeping!.roomId,
            toStatus: step.next!,
          })
        }
      >
        {step.action}
      </Button>
    );
  }
  if (task.pickup) {
    // the driver reports progress from the phone; the desk only steps in on a problem
    if (openIssue(task)) {
      return (
        <div className="flex w-full gap-1.5 sm:w-auto">
          <Button size="sm" variant="outline" disabled={pending} onClick={() => onAsk("KEEP_WAITING")}>
            Keep waiting
          </Button>
          <Button size="sm" variant="destructive" disabled={pending} onClick={() => onAsk("NO_SHOW")}>
            No-show
          </Button>
        </div>
      );
    }
    if (!task.assigneeUserId) return null;
    const remaining = PICKUP_STAGE_ORDER.slice(PICKUP_STAGE_ORDER.indexOf(pickupStage(task)) + 1);
    return (
      <Select value="" disabled={pending} onValueChange={(v) => vm.pickupStep(task._id, v as PickupStage)}>
        <SelectTrigger className="h-8 w-full text-[13px] text-muted-foreground sm:w-44" aria-label="Driver phoned in">
          <SelectValue placeholder="Driver phoned in…" />
        </SelectTrigger>
        <SelectContent align="end">
          {remaining.map((st) => (
            <SelectItem key={st} value={st}>
              {PICKUP_STAGE[st].step}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
  return (
    <div className="flex w-full gap-1.5 sm:w-auto">
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => vm.decide({ taskId: task._id, decision: "KEEP" })}
      >
        Keep
      </Button>
      <Button size="sm" variant="outline" disabled={pending} onClick={() => onAsk("MERGE")}>
        Merge
      </Button>
      <Button size="sm" variant="destructive" disabled={pending} onClick={() => onAsk("CANCEL")}>
        Cancel
      </Button>
    </div>
  );
}

/** Clean rooms waiting for a supervisor: pass releases them, fail sends them back with a reason. */
function InspectPanel({ vm }: { vm: DispatchPageVm }) {
  return (
    <div id="tour-dispatch-inspect">
      <Panel
        title="To inspect"
        meta={vm.toInspect.length ? String(vm.toInspect.length) : undefined}
        bodyClassName="p-0"
      >
        {vm.toInspect.length ? (
          <ul className="divide-y divide-border">
            {vm.toInspect.map((room) => (
              <InspectRow key={room._id} vm={vm} room={room} />
            ))}
          </ul>
        ) : (
          <p className="px-4 py-6 text-center text-[13px] text-muted-foreground">Nothing waiting for sign-off</p>
        )}
      </Panel>
    </div>
  );
}

function InspectRow({ vm, room }: { vm: DispatchPageVm; room: LiveRoomItem }) {
  const [failing, setFailing] = React.useState(false);
  const pending = vm.isPending(room._id);
  return (
    <li className="px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="min-w-0 flex-1">
          <span className="font-mono text-sm font-semibold">Room {room.roomNumber}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {roomTypeLabel(room.roomType)}
            {room.arrival ? ` · ${room.currentStay?.guestName ?? "guest"} by ${clock(room.arrival.readyBy)}` : ""}
          </span>
        </span>
        <Button size="sm" variant="ghost" disabled={pending} onClick={() => setFailing(true)}>
          Fail
        </Button>
        <Button size="sm" disabled={pending} onClick={() => vm.moveRoom({ roomId: room._id, toStatus: "INSPECTED" })}>
          Pass
        </Button>
      </div>
      {failing ? (
        <div className="mt-2">
          <ReasonForm
            placeholder="What needs redoing?"
            submitLabel="Send back"
            pending={pending}
            onCancel={() => setFailing(false)}
            onSubmit={(reason) => {
              vm.moveRoom({ roomId: room._id, toStatus: "DIRTY", reason });
              setFailing(false);
            }}
          />
        </div>
      ) : null}
    </li>
  );
}

function DonePanel({ tasks }: { tasks: DispatchTask[] }) {
  const [open, setOpen] = React.useState(false);
  const shown = open ? tasks : tasks.slice(0, 5);
  return (
    <Panel title="Done" meta={tasks.length ? String(tasks.length) : undefined} bodyClassName="p-0">
      {tasks.length ? (
        <>
          <ul className="divide-y divide-border">
            {shown.map((t) => {
              const Icon = TYPE_ICON[t.type];
              const decision = t.consolidation?.decision;
              return (
                <li key={t._id} className="flex items-center gap-3 px-4 py-2 text-xs">
                  <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">
                    {t.housekeeping ? `Room ${t.housekeeping.roomNumber}` : t.title}
                    {decision ? ` · ${decision.toLowerCase()}` : ""}
                  </span>
                  <span className="shrink-0 text-muted-foreground">
                    {t.assigneeName ?? ""}
                    {t.completedAt ? ` · ${clock(t.completedAt)}` : ""}
                  </span>
                </li>
              );
            })}
          </ul>
          {tasks.length > 5 ? (
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="w-full border-t border-border py-2 text-xs text-muted-foreground hover:text-foreground"
            >
              {open ? "Show less" : `Show all ${tasks.length}`}
            </button>
          ) : null}
        </>
      ) : (
        <p className="px-4 py-6 text-center text-[13px] text-muted-foreground">Nothing finished yet</p>
      )}
    </Panel>
  );
}
