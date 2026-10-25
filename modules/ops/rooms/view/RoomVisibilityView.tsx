"use client";

import * as React from "react";
import { AlertTriangle, Building, CalendarRange, LayoutGrid, Search, X } from "lucide-react";
import { FloorMap } from "@/modules/ops/components/FloorMap";
import { DateNav } from "@/modules/ops/components/DateNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import {
  EmptyState,
  LiveClock,
  LiveIndicator,
  OpsPage,
  OpsPageHeader,
  Panel,
  SegmentedControl,
  StatTile,
} from "@/modules/ops/components/OpsPage";
import { formatThb, shortDate, weekday } from "@/modules/ops/components/format";
import type { RoomFilter, RoomVisibilityVm, ViewMode } from "../viewModel/roomVisibilityVm";
import { RoomBoard, RoomLegend } from "./RoomBoard";
import { RoomSheet } from "./RoomSheet";
import { RoomTimeline } from "./RoomTimeline";
import { TodayPanels } from "./TodayPanels";

const FILTERS: { value: RoomFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "ARRIVING", label: "Arriving" },
  { value: "IN_HOUSE", label: "In house" },
  { value: "VACANT", label: "Vacant" },
  { value: "HOUSEKEEPING", label: "Housekeeping" },
  { value: "READY", label: "Ready to sell" },
];

export function RoomVisibilityView({ vm }: { vm: RoomVisibilityVm }) {
  const { data, selectedDate, today } = vm;
  const summary = data?.summary;
  const isToday = selectedDate === today;
  const openTasks = summary ? summary.dirty + summary.inProgress + summary.clean : 0;

  return (
    <OpsPage>
      <OpsPageHeader
        eyebrow={
          <>
            <span>{data?.branchName || vm.branch?.name || "—"}</span>
            <span aria-hidden>·</span>
            <LiveClock timeZone={vm.branch?.timezone} />
            <span aria-hidden>·</span>
            <LiveIndicator updatedAt={vm.updatedAt} isFetching={vm.isFetching} />
          </>
        }
        title="Rooms"
        description={`${weekday(selectedDate)} ${shortDate(selectedDate)}${isToday ? " · today" : ""} — occupancy, arrivals and housekeeping`}
        actions={
          <>
            <DateNav date={selectedDate} today={today} onChange={vm.setSelectedDate} />
            <SegmentedControl<ViewMode>
              label="View"
              value={vm.viewMode}
              onChange={vm.setViewMode}
              options={[
                { value: "BOARD", label: <><LayoutGrid className="size-3.5" /> Board</> },
                { value: "FLOOR", label: <><Building className="size-3.5" /> Floor map</> },
                { value: "TIMELINE", label: <><CalendarRange className="size-3.5" /> Timeline</> },
              ]}
            />
          </>
        }
      />

      {vm.isError && !data ? (
        <EmptyState
          title="Couldn't load rooms"
          description="The operations API didn't respond."
          action={<Button size="sm" variant="outline" onClick={() => vm.refetch()}>Try again</Button>}
        />
      ) : null}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatTile
          label="Occupancy tonight"
          value={summary ? `${summary.occupancyRate}%` : "—"}
          detail={summary ? `${summary.occupiedTonight} of ${summary.totalRooms} rooms` : undefined}
          active={vm.filter === "IN_HOUSE"}
          onClick={() => vm.setFilter("IN_HOUSE")}
        >
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500"
              style={{ width: `${summary?.occupancyRate ?? 0}%` }}
            />
          </div>
        </StatTile>
        <StatTile
          label="Arrivals"
          value={summary?.arrivalsToday ?? "—"}
          detail={
            vm.arrivalsNotReady
              ? `${vm.arrivalsNotReady} room${vm.arrivalsNotReady === 1 ? "" : "s"} not ready`
              : summary?.arrivalsToday
                ? "All rooms ready"
                : "None expected"
          }
          tone={vm.arrivalsNotReady ? "warning" : "default"}
          active={vm.filter === "ARRIVING"}
          onClick={() => vm.setFilter("ARRIVING")}
        />
        <StatTile
          label="Departures"
          value={summary?.departuresToday ?? "—"}
          detail="Check-outs"
          active={vm.filter === "DEPARTED"}
          onClick={() => vm.setFilter("DEPARTED")}
        />
        <StatTile
          label="Housekeeping open"
          value={summary ? openTasks : "—"}
          detail={summary ? `${summary.dirty} dirty · ${summary.inProgress} cleaning · ${summary.clean} to inspect` : undefined}
          tone={summary?.dirty ? "danger" : "default"}
          active={vm.filter === "HOUSEKEEPING"}
          onClick={() => vm.setFilter("HOUSEKEEPING")}
        />
        <StatTile
          label="Services"
          value={summary?.servicesToday ?? "—"}
          detail={
            summary?.servicesNeedingDetails
              ? `${summary.servicesNeedingDetails} transfer${summary.servicesNeedingDetails === 1 ? "" : "s"} missing flight`
              : summary
                ? `${summary.pickupsToday} pickup${summary.pickupsToday === 1 ? "" : "s"} · ${formatThb(summary.servicesTodayThb)}`
                : undefined
          }
          tone={summary?.servicesNeedingDetails ? "danger" : "default"}
        />
        <StatTile
          label="Booked today"
          value={summary?.bookedToday ?? "—"}
          detail={summary ? `${formatThb(summary.bookedTodayThb)} incl. tax & extras` : undefined}
        />
      </div>

      {summary?.unassigned ? (
        <div role="alert" className="flex items-center gap-2 rounded-lg border border-warning/40 bg-warning-soft px-4 py-3 text-[13px] text-warning">
          <AlertTriangle className="size-4 shrink-0" />
          {summary.unassigned} booking{summary.unassigned === 1 ? " has" : "s have"} no free room of their type in this
          period — check for overbooking.
        </div>
      ) : null}

      <div id="tour-rooms-board" className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Panel
          title={vm.viewMode === "BOARD" ? "Room board" : vm.viewMode === "FLOOR" ? "Floor map" : "Timeline"}
          meta={data ? `${vm.rooms.length} of ${data.rooms.length} rooms` : undefined}
          actions={vm.viewMode === "FLOOR" ? undefined : <RoomLegend />}
          bodyClassName={vm.viewMode === "TIMELINE" ? "p-0" : undefined}
        >
          <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", vm.viewMode === "TIMELINE" && "border-b border-border p-4")}>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter rooms">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  aria-pressed={vm.filter === f.value}
                  onClick={() => (f.value === "ALL" ? vm.clearFilter() : vm.setFilter(f.value))}
                  className={cn(
                    "h-7 rounded-md px-2.5 text-[13px] transition-colors",
                    vm.filter === f.value
                      ? "bg-secondary font-medium text-secondary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative sm:w-56">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={vm.search}
                onChange={(e) => vm.setSearch(e.target.value)}
                placeholder="Room, type or guest"
                className="h-8 pl-8 text-[13px]"
                aria-label="Search rooms"
              />
              {vm.search ? (
                <button
                  type="button"
                  onClick={() => vm.setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </div>
          </div>

          <div className={vm.viewMode !== "TIMELINE" ? "mt-4" : undefined}>
            {vm.isLoading ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
                {Array.from({ length: 12 }, (_, i) => (
                  <div key={i} className="h-[76px] animate-pulse rounded-md bg-muted" />
                ))}
              </div>
            ) : vm.rooms.length === 0 ? (
              <div className={vm.viewMode === "TIMELINE" ? "p-4" : undefined}>
                <EmptyState
                  title="No rooms match"
                  description="Try a different filter or search."
                  action={<Button size="sm" variant="outline" onClick={vm.clearFilter}>Clear filters</Button>}
                />
              </div>
            ) : vm.viewMode === "BOARD" ? (
              <RoomBoard floors={vm.roomsByFloor} now={vm.now} isToday={isToday} onOpen={vm.openRoom} />
            ) : vm.viewMode === "FLOOR" ? (
              <FloorMap rooms={vm.rooms} now={vm.now} onOpen={vm.openRoom} />
            ) : (
              <RoomTimeline
                rooms={vm.rooms}
                stays={data?.stays ?? []}
                dates={vm.timelineDates}
                selectedDate={selectedDate}
                today={today}
                now={vm.now}
                onOpen={vm.openRoom}
              />
            )}
          </div>
        </Panel>

        <TodayPanels
          arrivals={data?.arrivals ?? []}
          departures={data?.departures ?? []}
          services={data?.services ?? []}
          recentBookings={data?.recentBookings ?? []}
          rooms={data?.rooms ?? []}
          isToday={isToday}
          now={data ? new Date(data.generatedAt).getTime() : 0}
          onOpen={vm.openRoom}
        />
      </div>

      <RoomSheet
        room={vm.selectedRoom}
        onClose={vm.closeRoom}
        onReportNeedsCleaning={vm.reportNeedsCleaning}
        isReporting={vm.isReporting}
        reportError={vm.reportError}
      />
    </OpsPage>
  );
}
