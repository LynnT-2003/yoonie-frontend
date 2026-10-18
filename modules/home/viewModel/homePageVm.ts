"use client";

import type { User } from "@/lib/types/user";
import { useAuth } from "@/providers/auth-provider";

export type HomePageVm = {
  user: User | null;
  ready: boolean;
};

export function useHomePageVm(): HomePageVm {
  const { user, ready } = useAuth();
  return { user, ready };
}
