import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRequest, patchRequest } from "../api/NetworkManager";
import { apiPath } from "../../config/api-path";
import type { UpdateProfileBody, User } from "../../types/user";

export const userQueryKeys = {
  all: ["user"] as const,
  current: () => [...userQueryKeys.all, "current"] as const,
};

export async function getCurrentUser(): Promise<User> {
  return getRequest<User>(apiPath("users/me"));
}

export async function updateCurrentUser(
  body: UpdateProfileBody
): Promise<User> {
  return patchRequest<User, UpdateProfileBody>(apiPath("users/me"), body);
}

export function useCurrentUserQuery(enabled = true) {
  return useQuery({
    queryKey: userQueryKeys.current(),
    queryFn: getCurrentUser,
    enabled,
    staleTime: 30_000,
  });
}

export function useUpdateCurrentUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCurrentUser,
    onSuccess: (user) => {
      queryClient.setQueryData(userQueryKeys.current(), user);
    },
  });
}
