"use client";

import * as React from "react";
import { useBranchesQuery, useServicesBoardQuery } from "@/lib/domain/hospitality/hospitality-api";
import type { ServiceKind } from "@/lib/types/hospitality";
import { useBusinessDate } from "@/modules/ops/components/DateNav";

export type ServiceFilter = "ALL" | ServiceKind;

export function useServicesPageVm() {
  const branchesQuery = useBranchesQuery();
  const branch = branchesQuery.data?.[0];
  const { date, setDate, today, isToday } = useBusinessDate(branch?.timezone);
  const [filter, setFilter] = React.useState<ServiceFilter>("ALL");

  const boardQuery = useServicesBoardQuery(branch?._id ?? "", date);
  const board = boardQuery.data;

  const services = React.useMemo(
    () => (board?.services ?? []).filter((s) => filter === "ALL" || s.kind === filter),
    [board?.services, filter]
  );

  /** Busiest transfer hour, so the fleet's pinch point is visible at a glance. */
  const peakPickupHour = React.useMemo(() => {
    const slots = (board?.services ?? []).filter((s) => s.unit === "pickup").flatMap((s) => s.slots);
    return slots.reduce<(typeof slots)[number] | undefined>(
      (best, s) => (!best || s.booked > best.booked ? s : best),
      undefined
    );
  }, [board?.services]);

  return {
    branch,
    date,
    setDate,
    today,
    isToday,
    filter,
    setFilter,
    board,
    services,
    peakPickupHour,
    isLoading: boardQuery.isLoading || branchesQuery.isLoading,
    isFetching: boardQuery.isFetching,
    isError: boardQuery.isError,
    updatedAt: boardQuery.dataUpdatedAt || undefined,
    refetch: boardQuery.refetch,
  };
}

export type ServicesPageVm = ReturnType<typeof useServicesPageVm>;
