"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  useAssignTaskMutation,
  useBranchesQuery,
  useClaimTaskMutation,
  useDispatchTasksQuery,
  useLiveRoomOccupancyQuery,
  usePickupStepMutation,
  useResolvePickupIssueMutation,
  useRoomTransitionMutation,
  useStaffRosterQuery,
  useTourDecisionMutation,
} from "@/lib/domain/hospitality/hospitality-api";
import type {
  DispatchTask,
  DispatchTaskType,
  PickupStage,
  RoomCleaningStatus,
  TourDecision,
} from "@/lib/types/hospitality";
import { PICKUP_STAGE } from "@/modules/ops/components/pickupStage";
import { toast } from "@/components/ui/sonner";
import { people, taskLabel, toastFailed, toastRoomMoved } from "@/modules/ops/components/feedback";
import { useAuth } from "@/providers/auth-provider";
import { useBusinessDate } from "@/modules/ops/components/DateNav";
import { useNow } from "@/modules/ops/components/OpsPage";
import { URGENCY_RANK, taskDeadline, taskUrgency } from "@/modules/ops/components/urgency";

export type Lane = "ALL" | DispatchTaskType;
/** "ALL", "UNASSIGNED", "MINE", or a staff member's id */
export type OwnerFilter = string;

const LANES: Record<string, Lane> = {
  rooms: "HOUSEKEEPING_TURNAROUND",
  pickups: "AIRPORT_PICKUP",
  tours: "TOUR_CONSOLIDATION",
};

const isOpen = (t: DispatchTask) => t.status !== "DONE" && t.status !== "DISMISSED";

export function useDispatchPageVm() {
  const { user } = useAuth();
  const params = useSearchParams();
  const branchesQuery = useBranchesQuery();
  const branch = branchesQuery.data?.[0];
  const branchId = branch?._id ?? "";
  const { date, setDate, today, isToday } = useBusinessDate(branch?.timezone);
  const now = useNow();

  const [lane, setLane] = React.useState<Lane>(() => LANES[params.get("lane") ?? ""] ?? "ALL");
  const [owner, setOwner] = React.useState<OwnerFilter>("ALL");

  const tasksQuery = useDispatchTasksQuery(branchId, date);
  // rooms feed the "To inspect" list: clean rooms waiting for sign-off, whatever day they were cleaned
  const roomsQuery = useLiveRoomOccupancyQuery(branchId, { date, from: date, to: date });
  const rosterQuery = useStaffRosterQuery(branchId);

  const claim = useClaimTaskMutation();
  const assign = useAssignTaskMutation();
  const transition = useRoomTransitionMutation();
  const pickup = usePickupStepMutation();
  const answerIssue = useResolvePickupIssueMutation();
  const decide = useTourDecisionMutation();

  const tasks = React.useMemo(() => tasksQuery.data ?? [], [tasksQuery.data]);
  const myId = user?._id;

  const open = React.useMemo(
    () =>
      tasks
        .filter(isOpen)
        .filter((t) => lane === "ALL" || t.type === lane)
        .filter((t) =>
          owner === "ALL"
            ? true
            : owner === "UNASSIGNED"
              ? !t.assigneeUserId
              : owner === "MINE"
                ? t.assigneeUserId === myId
                : t.assigneeUserId === owner
        )
        .map((t) => ({ task: t, ...taskUrgency(t, now) }))
        .sort(
          (a, b) =>
            URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency] ||
            (a.minutesLeft ?? Infinity) - (b.minutesLeft ?? Infinity) ||
            b.task.priorityScore - a.task.priorityScore
        ),
    [tasks, lane, owner, myId, now]
  );

  const counts = React.useMemo(() => {
    const live = tasks.filter(isOpen);
    return {
      ALL: live.length,
      HOUSEKEEPING_TURNAROUND: live.filter((t) => t.type === "HOUSEKEEPING_TURNAROUND").length,
      AIRPORT_PICKUP: live.filter((t) => t.type === "AIRPORT_PICKUP").length,
      TOUR_CONSOLIDATION: live.filter((t) => t.type === "TOUR_CONSOLIDATION").length,
      unassigned: live.filter((t) => !t.assigneeUserId).length,
      late: live.filter((t) => taskUrgency(t, now).urgency === "LATE").length,
      atRisk: live.filter((t) => taskUrgency(t, now).urgency === "AT_RISK").length,
    };
  }, [tasks, now]);

  /** Deadlines on today's runway: rooms that must be ready and flights that land. */
  const runway = React.useMemo(
    () =>
      tasks
        .filter((t) => t.type !== "TOUR_CONSOLIDATION" && taskDeadline(t))
        .map((t) => ({ task: t, at: taskDeadline(t)!, ...taskUrgency(t, now) }))
        .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()),
    [tasks, now]
  );

  const toInspect = React.useMemo(
    () => (roomsQuery.data?.rooms ?? []).filter((r) => r.cleaningStatus === "CLEAN"),
    [roomsQuery.data?.rooms]
  );

  const done = React.useMemo(
    () =>
      tasks
        .filter((t) => !isOpen(t))
        .sort((a, b) => new Date(b.completedAt ?? 0).getTime() - new Date(a.completedAt ?? 0).getTime()),
    [tasks]
  );

  const pendingIds = new Set(
    [
      claim.isPending ? claim.variables : undefined,
      assign.isPending ? assign.variables?.taskId : undefined,
      pickup.isPending ? pickup.variables?.taskId : undefined,
      answerIssue.isPending ? answerIssue.variables?.taskId : undefined,
      decide.isPending ? decide.variables?.taskId : undefined,
      transition.isPending ? transition.variables?.roomId : undefined,
    ].filter(Boolean) as string[]
  );
  const byId = (id: string) => tasks.find((t) => t._id === id);
  const nameOf = (id: string) => rosterQuery.data?.find((p) => p.id === id)?.name;

  return {
    branch,
    myId,
    /** cancelling a departure loses revenue and means refunds: managers only */
    canCancelTour: user?.role !== "DISPATCHER",
    date,
    setDate,
    today,
    isToday,
    now,
    lane,
    setLane,
    owner,
    setOwner,
    roster: rosterQuery.data ?? [],
    open,
    counts,
    runway,
    toInspect,
    done,
    isLoading: tasksQuery.isLoading || branchesQuery.isLoading,
    isFetching: tasksQuery.isFetching,
    updatedAt: tasksQuery.dataUpdatedAt || undefined,
    isPending: (id: string) => pendingIds.has(id),
    claim: (taskId: string) =>
      claim.mutate(taskId, {
        onSuccess: () => toast.success(`${taskLabel(byId(taskId))} is yours`, { description: "Everyone else now sees it as taken" }),
        onError: toastFailed("take this job"),
      }),
    assign: (taskId: string, assigneeUserId: string | null) => {
      const label = taskLabel(byId(taskId));
      assign.mutate(
        { taskId, assigneeUserId },
        {
          onSuccess: (r) =>
            assigneeUserId
              ? toast.success(`${label} → ${r.assigneeName ?? nameOf(assigneeUserId) ?? "assigned"}`, {
                  description: r.notified?.length
                    ? `Notified ${people(r.notified)} on their phone`
                    : assigneeUserId === myId
                      ? "Assigned to you"
                      : "Already theirs — nobody re-notified",
                })
              : toast.success(`${label} is back in the pool`, { description: "Anyone on shift can take it" }),
          onError: toastFailed(`assign ${label}`),
        }
      );
    },
    moveRoom: (vars: { roomId: string; toStatus: RoomCleaningStatus; reason?: string }) =>
      transition.mutate(vars, { onSuccess: toastRoomMoved, onError: toastFailed("update the room") }),
    /** For a driver who phoned the desk: record the step they reached on their behalf. */
    pickupStep: (taskId: string, stage: PickupStage) => {
      const label = taskLabel(byId(taskId));
      pickup.mutate(
        { taskId, stage },
        {
          onSuccess: (r) =>
            toast.success(`${label} · ${PICKUP_STAGE[stage].label.toLowerCase()}`, {
              description: r.notified?.length
                ? `Notified ${people(r.notified)}`
                : "Recorded for the driver · shows live on the board",
            }),
          onError: toastFailed(`update ${label}`),
        }
      );
    },
    answerIssue: (taskId: string, resolution: "KEEP_WAITING" | "NO_SHOW", note?: string) => {
      const label = taskLabel(byId(taskId));
      answerIssue.mutate(
        { taskId, resolution, note },
        {
          onSuccess: (r) =>
            toast.success(resolution === "NO_SHOW" ? `${label} closed as a no-show` : `${label} · driver told to keep waiting`, {
              description: r.notified?.length ? `Notified ${people(r.notified)}` : "Shows in the driver's app",
            }),
          onError: toastFailed(`answer the driver on ${label}`),
        }
      );
    },
    decide: (vars: { taskId: string; decision: TourDecision; note?: string }) => {
      const label = taskLabel(byId(vars.taskId));
      decide.mutate(vars, {
        onSuccess: () =>
          vars.decision === "KEEP"
            ? toast.success(`${label} runs as planned`)
            : toast.success(`${label} · ${vars.decision === "MERGE" ? "merge" : "cancellation"} recorded`, {
                description: "Move or refund the booked guests at the front desk",
              }),
        onError: toastFailed(`record the decision for ${label}`),
      });
    },
  };
}

export type DispatchPageVm = ReturnType<typeof useDispatchPageVm>;
