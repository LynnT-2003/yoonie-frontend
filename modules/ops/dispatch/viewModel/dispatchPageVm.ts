"use client";

import * as React from "react";
import {
  useBranchesQuery,
  useDispatchTasksQuery,
  useUpdateDispatchStatusMutation,
} from "@/lib/domain/hospitality/hospitality-api";
import type { DispatchStatus, DispatchTaskType } from "@/lib/types/hospitality";

export function useDispatchPageVm() {
  const branchesQuery = useBranchesQuery();
  const branch = branchesQuery.data?.[0];
  const branchId = branch?._id || "665a1b2c3d4e5f6a7b8c9d0e";

  const [serviceDate, setServiceDate] = React.useState(() => {
    try {
      // Bangkok hotel operating timezone: UTC+7 (420 minutes)
      const bkkNow = new Date(Date.now() + 420 * 60_000);
      return bkkNow.toISOString().slice(0, 10);
    } catch {
      return "2026-10-19";
    }
  });
  const [activeFilter, setActiveFilter] = React.useState<DispatchTaskType | "ALL">("ALL");

  const dispatchQuery = useDispatchTasksQuery(branchId, serviceDate);
  const updateStatusMutation = useUpdateDispatchStatusMutation(branchId, serviceDate);

  const tasks = React.useMemo(() => dispatchQuery.data || [], [dispatchQuery.data]);

  const filteredTasks = React.useMemo(() => {
    if (activeFilter === "ALL") return tasks;
    return tasks.filter((t) => t.type === activeFilter);
  }, [tasks, activeFilter]);

  const advanceTaskStatus = (taskId: string, current: DispatchStatus) => {
    let next: DispatchStatus = "OPEN";
    if (current === "OPEN") next = "ACKNOWLEDGED";
    else if (current === "ACKNOWLEDGED") next = "IN_PROGRESS";
    else if (current === "IN_PROGRESS") next = "DONE";
    else if (current === "DONE") next = "OPEN";

    updateStatusMutation.mutate({ taskId, status: next });
  };

  const criticalCount = tasks.filter((t) => t.severity === "CRITICAL" || t.severity === "WARN").length;
  const completedCount = tasks.filter((t) => t.status === "DONE").length;
  const pickupCount = tasks.filter((t) => t.type === "AIRPORT_PICKUP").length;
  const housekeepingCount = tasks.filter((t) => t.type === "HOUSEKEEPING_TURNAROUND").length;
  const tourCount = tasks.filter((t) => t.type === "TOUR_CONSOLIDATION").length;

  return {
    branch,
    branchId,
    serviceDate,
    setServiceDate,
    activeFilter,
    setActiveFilter,
    tasks: filteredTasks,
    allTasks: tasks,
    allTasksCount: tasks.length,
    criticalCount,
    completedCount,
    pickupCount,
    housekeepingCount,
    tourCount,
    isLoading: dispatchQuery.isLoading,
    advanceTaskStatus,
  };
}

export type DispatchPageVm = ReturnType<typeof useDispatchPageVm>;
