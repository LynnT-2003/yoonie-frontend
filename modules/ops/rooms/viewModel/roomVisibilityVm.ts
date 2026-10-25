"use client";

import * as React from "react";
import {
  useBranchesQuery,
  useLiveRoomOccupancyQuery,
  useRoomTransitionMutation,
} from "@/lib/domain/hospitality/hospitality-api";
import type { LiveRoomItem } from "@/lib/types/hospitality";
import { useNow } from "@/modules/ops/components/OpsPage";
import { businessDate } from "@/modules/ops/components/format";
import { toastRoomMoved } from "@/modules/ops/components/feedback";

export type ViewMode = "BOARD" | "FLOOR" | "TIMELINE";
export type RoomFilter = "ALL" | "ARRIVING" | "IN_HOUSE" | "DEPARTED" | "VACANT" | "HOUSEKEEPING" | "READY";

/** Days shown in the timeline, starting two days before the selected date. */
const TIMELINE_DAYS = 14;
const TIMELINE_LEAD = 2;

function addDays(date: string, n: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

const matchesFilter = (room: LiveRoomItem, filter: RoomFilter) => {
  switch (filter) {
    case "ARRIVING":
      return room.occupancyStatus === "ARRIVING_TODAY";
    case "IN_HOUSE":
      return room.occupancyStatus === "OCCUPIED";
    case "DEPARTED":
      return Boolean(room.departingStay);
    case "VACANT":
      return !room.currentStay;
    case "HOUSEKEEPING":
      return room.cleaningStatus !== "INSPECTED";
    case "READY":
      return room.cleaningStatus === "INSPECTED" && !room.currentStay;
    default:
      return true;
  }
};

export function useRoomVisibilityVm() {
  const branchesQuery = useBranchesQuery();
  const branch = branchesQuery.data?.[0];
  const branchId = branch?._id ?? "";
  const timezone = branch?.timezone || "Asia/Bangkok";
  const today = businessDate(timezone);

  const [selectedDate, setSelectedDate] = React.useState<string>(today);
  const [viewMode, setViewMode] = React.useState<ViewMode>("BOARD");
  const [filter, setFilter] = React.useState<RoomFilter>("ALL");
  const [search, setSearch] = React.useState("");
  const [selectedRoomId, setSelectedRoomId] = React.useState<string | null>(null);

  const timelineDates = React.useMemo(
    () => Array.from({ length: TIMELINE_DAYS }, (_, i) => addDays(selectedDate, i - TIMELINE_LEAD)),
    [selectedDate]
  );

  const occupancyQuery = useLiveRoomOccupancyQuery(branchId, {
    date: selectedDate,
    from: timelineDates[0],
    to: addDays(timelineDates[timelineDates.length - 1], 1),
  });
  // Rooms only report problems; the work itself is done from Dispatch
  const transition = useRoomTransitionMutation();
  const now = useNow();

  const data = occupancyQuery.data;

  const rooms = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data?.rooms ?? []).filter((room) => {
      if (!matchesFilter(room, filter)) return false;
      if (!q) return true;
      return (
        room.roomNumber.toLowerCase().includes(q) ||
        room.roomType.toLowerCase().replace(/_/g, " ").includes(q) ||
        Boolean(room.currentStay?.guestName.toLowerCase().includes(q)) ||
        Boolean(room.nextStay?.guestName.toLowerCase().includes(q))
      );
    });
  }, [data?.rooms, filter, search]);

  const roomsByFloor = React.useMemo(() => {
    const floors = new Map<number, LiveRoomItem[]>();
    for (const room of rooms) floors.set(room.floor, [...(floors.get(room.floor) ?? []), room]);
    return [...floors.entries()].sort(([a], [b]) => a - b);
  }, [rooms]);

  const selectedRoom = React.useMemo(
    () => data?.rooms.find((r) => r._id === selectedRoomId),
    [data?.rooms, selectedRoomId]
  );

  /** Arriving rooms whose key isn't inspected yet — the thing the front desk actually worries about. */
  const arrivalsNotReady = React.useMemo(
    () =>
      (data?.rooms ?? []).filter(
        (r) => r.occupancyStatus === "ARRIVING_TODAY" && r.cleaningStatus !== "INSPECTED"
      ).length,
    [data?.rooms]
  );

  return {
    branch,
    today,
    selectedDate,
    setSelectedDate,
    timelineDates,
    viewMode,
    setViewMode,
    filter,
    setFilter: (next: RoomFilter) => setFilter((cur) => (cur === next ? "ALL" : next)),
    clearFilter: () => {
      setFilter("ALL");
      setSearch("");
    },
    search,
    setSearch,
    data,
    rooms,
    roomsByFloor,
    arrivalsNotReady,
    selectedRoom,
    openRoom: setSelectedRoomId,
    closeRoom: () => setSelectedRoomId(null),
    isLoading: occupancyQuery.isLoading || branchesQuery.isLoading,
    isFetching: occupancyQuery.isFetching,
    isError: occupancyQuery.isError,
    updatedAt: occupancyQuery.dataUpdatedAt || undefined,
    refetch: occupancyQuery.refetch,
    now,
    isReporting: transition.isPending,
    reportError: transition.error instanceof Error ? transition.error.message : undefined,
    reportNeedsCleaning: (roomId: string, reason: string, onDone?: () => void) =>
      transition.mutate(
        { roomId, toStatus: "DIRTY", reason },
        {
          onSuccess: (r) => {
            toastRoomMoved(r);
            onDone?.();
          },
        }
      ),
  };
}

export type RoomVisibilityVm = ReturnType<typeof useRoomVisibilityVm>;
