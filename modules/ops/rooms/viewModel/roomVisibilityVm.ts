"use client";

import * as React from "react";
import {
  useBranchesQuery,
  useLiveRoomOccupancyQuery,
  useUpdateRoomCleaningMutation,
} from "@/lib/domain/hospitality/hospitality-api";
import type {
  LiveRoomItem,
  LiveOccupancyResponse,
  RoomCleaningStatus,
  TimelineBooking,
} from "@/lib/types/hospitality";

export type ViewMode = "MATRIX" | "TAPE_CHART";
export type StatusFilter =
  | "ALL"
  | "OCCUPIED"
  | "VACANT"
  | "ARRIVING"
  | "TURNOVER_NEEDED"
  | "INSPECTED";

export function useRoomVisibilityVm() {
  const branchesQuery = useBranchesQuery();
  const branch = branchesQuery.data?.[0];
  const branchId = branch?._id || "665a1b2c3d4e5f6a7b8c9d0e";

  // Today's business date
  const [selectedDate, setSelectedDate] = React.useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });

  // Timeline window: 10 days centered around selectedDate (-2 to +8)
  const timelineDates = React.useMemo(() => {
    const dates: string[] = [];
    const base = new Date(`${selectedDate}T00:00:00Z`);
    for (let i = -2; i <= 7; i++) {
      const d = new Date(base);
      d.setUTCDate(base.getUTCDate() + i);
      dates.push(d.toISOString().slice(0, 10));
    }
    return dates;
  }, [selectedDate]);

  const fromDate = timelineDates[0];
  const toDate = timelineDates[timelineDates.length - 1];

  const occupancyQuery = useLiveRoomOccupancyQuery(
    branchId,
    { date: selectedDate, from: fromDate, to: toDate },
    { refetchInterval: 10_000 }
  );

  const updateCleaningMutation = useUpdateRoomCleaningMutation(branchId);

  // UI state
  const [viewMode, setViewMode] = React.useState<ViewMode>("MATRIX");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("ALL");
  const [floorFilter, setFloorFilter] = React.useState<number | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedRoomId, setSelectedRoomId] = React.useState<string | null>(null);

  const data: LiveOccupancyResponse | undefined = occupancyQuery.data;

  const roomsList = data?.rooms;

  // Filtered rooms
  const filteredRooms = React.useMemo(() => {
    if (!roomsList) return [];
    return roomsList.filter((room) => {
      // Floor filter
      if (floorFilter !== "ALL" && room.floor !== floorFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === "OCCUPIED") {
        if (room.occupancyStatus !== "OCCUPIED") return false;
      } else if (statusFilter === "VACANT") {
        if (room.occupancyStatus !== "VACANT") return false;
      } else if (statusFilter === "ARRIVING") {
        if (room.occupancyStatus !== "ARRIVING_TODAY") return false;
      } else if (statusFilter === "TURNOVER_NEEDED") {
        if (
          room.cleaningStatus !== "DIRTY" &&
          room.cleaningStatus !== "IN_PROGRESS"
        )
          return false;
      } else if (statusFilter === "INSPECTED") {
        if (room.cleaningStatus !== "INSPECTED") return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesNumber = room.roomNumber.toLowerCase().includes(q);
        const matchesType = room.roomType.toLowerCase().includes(q);
        const matchesGuest =
          room.currentBooking?.guestName.toLowerCase().includes(q) || false;
        if (!matchesNumber && !matchesType && !matchesGuest) return false;
      }

      return true;
    });
  }, [roomsList, floorFilter, statusFilter, searchQuery]);

  // Selected room details for Drawer
  const selectedRoom: LiveRoomItem | undefined = React.useMemo(() => {
    if (!selectedRoomId || !roomsList) return undefined;
    return roomsList.find((r) => r._id === selectedRoomId);
  }, [selectedRoomId, roomsList]);

  // Room status advance logic
  const advanceRoomStatus = (
    roomId: string,
    currentStatus: RoomCleaningStatus
  ) => {
    let nextStatus: RoomCleaningStatus = "DIRTY";
    if (currentStatus === "DIRTY") nextStatus = "IN_PROGRESS";
    else if (currentStatus === "IN_PROGRESS") nextStatus = "CLEAN";
    else if (currentStatus === "CLEAN") nextStatus = "INSPECTED";
    else if (currentStatus === "INSPECTED") nextStatus = "DIRTY";

    updateCleaningMutation.mutate({ roomId, status: nextStatus });
  };

  const setRoomStatus = (roomId: string, status: RoomCleaningStatus) => {
    updateCleaningMutation.mutate({ roomId, status });
  };

  return {
    branch,
    branchId,
    selectedDate,
    setSelectedDate,
    timelineDates,
    viewMode,
    setViewMode,
    statusFilter,
    setStatusFilter,
    floorFilter,
    setFloorFilter,
    searchQuery,
    setSearchQuery,
    selectedRoomId,
    setSelectedRoomId,
    selectedRoom,
    summary: data?.summary,
    rooms: filteredRooms,
    allRooms: data?.rooms || [],
    timeline: data?.timeline || [],
    isLoading: occupancyQuery.isLoading,
    isUpdating: updateCleaningMutation.isPending,
    advanceRoomStatus,
    setRoomStatus,
    refetch: occupancyQuery.refetch,
  };
}

export type RoomVisibilityVm = ReturnType<typeof useRoomVisibilityVm>;
