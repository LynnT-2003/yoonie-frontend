"use client";

import * as React from "react";
import { useAuth } from "@/providers/auth-provider";
import {
  useModerationUsersQuery,
  useSuspendModerationUserMutation,
  useUnsuspendModerationUserMutation,
} from "@/lib/domain/admin/moderation-api";
import type { ModerationUser } from "@/lib/types/admin";
import { ApiError } from "@/lib/domain/api/ApiError";

export type SuspendedFilter = "all" | "active" | "suspended";

const DEFAULT_LIMIT = 20;

export type ModerationPageVm = {
  items: ModerationUser[];
  total: number;
  page: number;
  limit: number;
  searchDraft: string;
  suspendedFilter: SuspendedFilter;
  loading: boolean;
  listError: string | null;
  actionError: string | null;
  actionUserId: string | null;
  currentUserId: string | undefined;
  suspendTarget: ModerationUser | null;
  suspendReason: string;
  totalPages: number;
  setSearchDraft: (v: string) => void;
  setSuspendedFilter: (v: SuspendedFilter) => void;
  setSuspendReason: (v: string) => void;
  applyFilters: () => void;
  goPage: (p: number) => void;
  refresh: () => Promise<void>;
  openSuspend: (u: ModerationUser) => void;
  closeSuspend: () => void;
  submitSuspend: () => Promise<void>;
  submitUnsuspend: (u: ModerationUser) => Promise<void>;
};

function suspendedParam(
  f: SuspendedFilter
): boolean | undefined {
  if (f === "active") return false;
  if (f === "suspended") return true;
  return undefined;
}

export function useModerationPageVm(): ModerationPageVm {
  const { user } = useAuth();
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(DEFAULT_LIMIT);
  const [searchDraft, setSearchDraft] = React.useState("");
  const [committedSearch, setCommittedSearch] = React.useState("");
  const [suspendedFilter, setSuspendedFilterState] =
    React.useState<SuspendedFilter>("all");
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [actionUserId, setActionUserId] = React.useState<string | null>(null);
  const [suspendTarget, setSuspendTarget] = React.useState<ModerationUser | null>(
    null
  );
  const [suspendReason, setSuspendReason] = React.useState("");

  const listParams = React.useMemo(
    () => ({
      page,
      limit,
      search: committedSearch || undefined,
      suspended: suspendedParam(suspendedFilter),
    }),
    [page, limit, committedSearch, suspendedFilter]
  );
  const usersQuery = useModerationUsersQuery(listParams);
  const suspendMutation = useSuspendModerationUserMutation();
  const unsuspendMutation = useUnsuspendModerationUserMutation();
  const items = usersQuery.data?.items ?? [];
  const total = usersQuery.data?.total ?? 0;
  const listError =
    usersQuery.error instanceof ApiError
      ? usersQuery.error.message
      : usersQuery.error instanceof Error
        ? usersQuery.error.message
        : null;

  const setSuspendedFilter = React.useCallback((v: SuspendedFilter) => {
    setSuspendedFilterState(v);
    setPage(1);
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const applyFilters = React.useCallback(() => {
    setCommittedSearch(searchDraft);
    setPage(1);
  }, [searchDraft]);

  const goPage = React.useCallback((p: number) => {
    setPage(Math.max(1, p));
  }, []);

  const openSuspend = React.useCallback((u: ModerationUser) => {
    setActionError(null);
    setSuspendReason("");
    setSuspendTarget(u);
  }, []);

  const closeSuspend = React.useCallback(() => {
    setSuspendTarget(null);
    setSuspendReason("");
  }, []);

  const submitSuspend = React.useCallback(async () => {
    if (!suspendTarget) return;
    setActionError(null);
    setActionUserId(suspendTarget._id);
    try {
      await suspendMutation.mutateAsync({
        userId: suspendTarget._id,
        reason: suspendReason,
      });
      closeSuspend();
    } catch (e) {
      setActionError(
        e instanceof ApiError ? e.message : "Could not suspend user"
      );
    } finally {
      setActionUserId(null);
    }
  }, [suspendTarget, suspendReason, suspendMutation, closeSuspend]);

  const submitUnsuspend = React.useCallback(async (u: ModerationUser) => {
    if (!window.confirm(`Restore access for ${u.displayName}?`)) return;
    setActionError(null);
    setActionUserId(u._id);
    try {
      await unsuspendMutation.mutateAsync(u._id);
    } catch (e) {
      setActionError(
        e instanceof ApiError ? e.message : "Could not unsuspend user"
      );
    } finally {
      setActionUserId(null);
    }
  }, [unsuspendMutation]);

  return {
    items,
    total,
    page,
    limit,
    searchDraft,
    suspendedFilter,
    loading: usersQuery.isLoading,
    listError,
    actionError,
    actionUserId,
    currentUserId: user?._id,
    suspendTarget,
    suspendReason,
    totalPages,
    setSearchDraft,
    setSuspendedFilter,
    setSuspendReason,
    applyFilters,
    goPage,
    refresh: async () => {
      await usersQuery.refetch();
    },
    openSuspend,
    closeSuspend,
    submitSuspend,
    submitUnsuspend,
  };
}
