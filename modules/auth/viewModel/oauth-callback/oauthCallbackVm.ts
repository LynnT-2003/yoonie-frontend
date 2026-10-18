"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { tokenStore } from "@/lib/domain/api/tokenStore";
import { useAuth } from "@/providers/auth-provider";

export type OAuthCallbackVm = {
  error: string | null;
};

export function useOAuthCallbackVm(): OAuthCallbackVm {
  const router = useRouter();
  const { applyOAuthTokens } = useAuth();
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const hash =
      typeof window !== "undefined"
        ? window.location.hash.replace(/^#/, "")
        : "";
    if (!hash) {
      setError(
        "No OAuth data in the URL hash. Set FRONTEND_OAUTH_CALLBACK_URL on the API to this page’s URL, or use OAuth import."
      );
      return;
    }

    const params = new URLSearchParams(hash);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const userId = params.get("userId");
    if (!accessToken || !refreshToken || !userId) {
      setError(
        "Invalid callback: expected accessToken, refreshToken, and userId in the hash."
      );
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        await applyOAuthTokens(accessToken, refreshToken, userId);
        if (cancelled) return;
        window.history.replaceState(null, "", "/auth/callback");
        router.replace("/account");
      } catch (e: unknown) {
        if (cancelled) return;
        tokenStore.clear();
        setError(e instanceof Error ? e.message : "Could not complete sign-in");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applyOAuthTokens, router]);

  return { error };
}
