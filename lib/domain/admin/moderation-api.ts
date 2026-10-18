import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRequest, postRequest } from "../api/NetworkManager";
import { apiPath } from "../../config/api-path";
import type {
  ModerationUser,
  ModerationUserListParams,
  ModerationUserListResult,
  SuspendModerationUserBody,
} from "../../types/admin";

export const moderationQueryKeys = {
  all: ["admin", "moderation"] as const,
  users: () => [...moderationQueryKeys.all, "users"] as const,
  userList: (params: ModerationUserListParams) =>
    [...moderationQueryKeys.users(), params] as const,
  user: (userId: string) => [...moderationQueryKeys.users(), userId] as const,
};

function moderationUsersPath(params: ModerationUserListParams): string {
  const sp = new URLSearchParams();
  sp.set("page", String(params.page));
  sp.set("limit", String(params.limit));
  const q = params.search?.trim();
  if (q) sp.set("search", q);
  if (params.suspended === true) sp.set("suspended", "true");
  if (params.suspended === false) sp.set("suspended", "false");
  const qs = sp.toString();
  return qs ? `admin/moderation/users?${qs}` : "admin/moderation/users";
}

export function listModerationUsers(
  params: ModerationUserListParams
): Promise<ModerationUserListResult> {
  return getRequest<ModerationUserListResult>(apiPath(moderationUsersPath(params)));
}

export function getModerationUser(userId: string): Promise<ModerationUser> {
  return getRequest<ModerationUser>(
    apiPath(`admin/moderation/users/${encodeURIComponent(userId)}`)
  );
}

export function suspendModerationUser(
  userId: string,
  reason?: string
): Promise<ModerationUser> {
  const trimmed = reason?.trim();
  return postRequest<ModerationUser, SuspendModerationUserBody>(
    apiPath(`admin/moderation/users/${encodeURIComponent(userId)}/suspend`),
    trimmed ? { reason: trimmed } : {}
  );
}

export function unsuspendModerationUser(userId: string): Promise<ModerationUser> {
  return postRequest<ModerationUser, Record<string, never>>(
    apiPath(`admin/moderation/users/${encodeURIComponent(userId)}/unsuspend`),
    {}
  );
}

export function useModerationUsersQuery(params: ModerationUserListParams) {
  return useQuery({
    queryKey: moderationQueryKeys.userList(params),
    queryFn: () => listModerationUsers(params),
    staleTime: 15_000,
  });
}

export function useModerationUserQuery(userId: string | null) {
  return useQuery({
    queryKey: moderationQueryKeys.user(userId ?? ""),
    queryFn: () => getModerationUser(userId ?? ""),
    enabled: !!userId,
    staleTime: 15_000,
  });
}

export function useSuspendModerationUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      suspendModerationUser(userId, reason),
    onSuccess: (user) => {
      queryClient.setQueryData(moderationQueryKeys.user(user._id), user);
      void queryClient.invalidateQueries({ queryKey: moderationQueryKeys.users() });
    },
  });
}

export function useUnsuspendModerationUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unsuspendModerationUser,
    onSuccess: (user) => {
      queryClient.setQueryData(moderationQueryKeys.user(user._id), user);
      void queryClient.invalidateQueries({ queryKey: moderationQueryKeys.users() });
    },
  });
}
