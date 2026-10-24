"use client";

import * as React from "react";
import {
  useBranchesQuery,
  useHousekeepingBoardQuery,
  useUpdateRoomCleaningMutation,
} from "@/lib/domain/hospitality/hospitality-api";
import type { RoomCleaningStatus } from "@/lib/types/hospitality";

export function useHousekeepingPageVm() {
  const branchesQuery = useBranchesQuery();
  const branch = branchesQuery.data?.[0];
  const branchId = branch?._id || "665a1b2c3d4e5f6a7b8c9d0e";

  const boardQuery = useHousekeepingBoardQuery(branchId, { refetchInterval: 10_000 });
  const updateCleaningMutation = useUpdateRoomCleaningMutation(branchId);

  const [activeFloor, setActiveFloor] = React.useState<number | "ALL">("ALL");

  const board = boardQuery.data || {
    dirty: [],
    inProgress: [],
    clean: [],
    inspected: [],
  };

  const totalRooms =
    board.dirty.length +
    board.inProgress.length +
    board.clean.length +
    board.inspected.length;

  const inspectedPercentage =
    totalRooms > 0 ? Math.round((board.inspected.length / totalRooms) * 100) : 100;

  const advanceRoomStatus = (roomId: string, currentStatus: RoomCleaningStatus) => {
    let nextStatus: RoomCleaningStatus = "DIRTY";
    if (currentStatus === "DIRTY") nextStatus = "IN_PROGRESS";
    else if (currentStatus === "IN_PROGRESS") nextStatus = "CLEAN";
    else if (currentStatus === "CLEAN") nextStatus = "INSPECTED";
    else if (currentStatus === "INSPECTED") nextStatus = "DIRTY";

    updateCleaningMutation.mutate({ roomId, status: nextStatus });
  };

  return {
    branch,
    branchId,
    board,
    isLoading: boardQuery.isLoading,
    totalRooms,
    inspectedPercentage,
    activeFloor,
    setActiveFloor,
    advanceRoomStatus,
    isUpdating: updateCleaningMutation.isPending,
  };
}

export type HousekeepingPageVm = ReturnType<typeof useHousekeepingPageVm>;
