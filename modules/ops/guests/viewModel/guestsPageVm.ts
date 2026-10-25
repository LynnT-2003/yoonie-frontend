"use client";

import * as React from "react";
import { useBranchesQuery, useGuestsBoardQuery } from "@/lib/domain/hospitality/hospitality-api";
import type { GuestStatus } from "@/lib/types/hospitality";
import { useBusinessDate } from "@/modules/ops/components/DateNav";

export type GuestFilter = "ALL" | GuestStatus | "VIP" | "OWES";

export function useGuestsPageVm() {
  const branchesQuery = useBranchesQuery();
  const branch = branchesQuery.data?.[0];
  const { date, setDate, today, isToday } = useBusinessDate(branch?.timezone);
  const [filter, setFilter] = React.useState<GuestFilter>("ALL");
  const [search, setSearch] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const boardQuery = useGuestsBoardQuery(branch?._id ?? "", date);
  const board = boardQuery.data;

  const guests = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return (board?.guests ?? []).filter((g) => {
      if (filter === "VIP" && g.vipTier === "NONE") return false;
      if (filter === "OWES" && g.dueThb <= 0) return false;
      if (filter !== "ALL" && filter !== "VIP" && filter !== "OWES" && g.status !== filter) return false;
      if (!q) return true;
      return (
        g.name.toLowerCase().includes(q) ||
        Boolean(g.email?.toLowerCase().includes(q)) ||
        Boolean(g.phone?.includes(q)) ||
        g.stays.some((s) => s.roomNumber?.toLowerCase().includes(q) || s.orderNumber.toLowerCase().includes(q))
      );
    });
  }, [board?.guests, filter, search]);

  return {
    branch,
    date,
    setDate,
    today,
    isToday,
    filter,
    setFilter,
    search,
    setSearch,
    board,
    guests,
    selectedGuest: board?.guests.find((g) => g.guestId === selectedId),
    openGuest: setSelectedId,
    closeGuest: () => setSelectedId(null),
    isLoading: boardQuery.isLoading || branchesQuery.isLoading,
    isFetching: boardQuery.isFetching,
    isError: boardQuery.isError,
    updatedAt: boardQuery.dataUpdatedAt || undefined,
    refetch: boardQuery.refetch,
  };
}

export type GuestsPageVm = ReturnType<typeof useGuestsPageVm>;
