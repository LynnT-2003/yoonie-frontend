"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { AuthResponse } from "../lib/types/auth";
import type { User } from "../lib/types/user";
import { tokenStore } from "../lib/domain/api/tokenStore";
import {
  clearPersistedSession,
  readPersistedSession,
  writePersistedSession,
} from "../lib/domain/auth/session-storage";
import {
  loginRequest,
  logoutRequest,
  registerRequest,
} from "../lib/domain/auth/auth-api";
import { getCurrentUser, userQueryKeys } from "../lib/domain/user/user-api";
import { paymentQueryKeys } from "../lib/domain/payment/paymentApi";
import { setSessionExpiredHandler } from "../lib/domain/api/NetworkManager";
import type { RegisterBody } from "../lib/types/auth";

export type AuthContextValue = {
  user: User | null;
  /** False until client has read localStorage and synced tokenStore. */
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (body: RegisterBody) => Promise<void>;
  /** After OAuth JSON paste or token refresh from elsewhere. */
  applyAuthResponse: (auth: AuthResponse) => void;
  applyOAuthTokens: (
    accessToken: string,
    refreshToken: string,
    userId: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

function userIdFromAuthUser(u: AuthResponse["user"]): string {
  return String(u._id);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [user, setUser] = React.useState<User | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const p = readPersistedSession();
    if (p) {
      tokenStore.setSession(p.accessToken, p.refreshToken, p.userId);
      setUser(p.user);
    }
    setReady(true);
  }, []);

  const clearClientSession = React.useCallback(() => {
    tokenStore.clear();
    clearPersistedSession();
    setUser(null);
    queryClient.removeQueries({ queryKey: userQueryKeys.all });
    queryClient.removeQueries({ queryKey: paymentQueryKeys.all });
  }, [queryClient]);

  React.useEffect(() => {
    setSessionExpiredHandler(() => {
      clearClientSession();
      router.replace("/login");
    });
  }, [router, clearClientSession]);

  const applyAuthResponse = React.useCallback((auth: AuthResponse) => {
    const userId = userIdFromAuthUser(auth.user);
    tokenStore.setSession(
      auth.tokens.accessToken,
      auth.tokens.refreshToken,
      userId
    );
    writePersistedSession({
      accessToken: auth.tokens.accessToken,
      refreshToken: auth.tokens.refreshToken,
      userId,
      user: auth.user,
    });
    setUser(auth.user);
    queryClient.setQueryData(userQueryKeys.current(), auth.user);
    void queryClient.invalidateQueries({ queryKey: paymentQueryKeys.all });
  }, [queryClient]);

  const login = React.useCallback(
    async (email: string, password: string) => {
      const auth = await loginRequest({ email, password });
      applyAuthResponse(auth);
      router.push("/account");
    },
    [applyAuthResponse, router]
  );

  const register = React.useCallback(
    async (body: RegisterBody) => {
      const auth = await registerRequest(body);
      applyAuthResponse(auth);
      router.push("/account");
    },
    [applyAuthResponse, router]
  );

  const applyOAuthTokens = React.useCallback(
    async (accessToken: string, refreshToken: string, userId: string) => {
      tokenStore.setSession(accessToken, refreshToken, userId);
      const user = await getCurrentUser();
      applyAuthResponse({ user, tokens: { accessToken, refreshToken } });
    },
    [applyAuthResponse]
  );

  const logout = React.useCallback(async () => {
    const p = readPersistedSession();
    const userId = p?.userId ?? tokenStore.getUserId();
    const refreshToken = p?.refreshToken ?? tokenStore.getRefreshToken();
    if (userId && refreshToken) {
      try {
        await logoutRequest({ userId, refreshToken });
      } catch {
        /* clear client session regardless */
      }
    }
    clearClientSession();
    router.push("/");
  }, [router, clearClientSession]);

  const refreshUser = React.useCallback(async () => {
    const next = await getCurrentUser();
    setUser(next);
    queryClient.setQueryData(userQueryKeys.current(), next);
    const p = readPersistedSession();
    if (p) {
      writePersistedSession({
        ...p,
        user: next,
      });
    }
  }, [queryClient]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      login,
      register,
      applyAuthResponse,
      applyOAuthTokens,
      logout,
      refreshUser,
    }),
    [
      user,
      ready,
      login,
      register,
      applyAuthResponse,
      applyOAuthTokens,
      logout,
      refreshUser,
    ]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
