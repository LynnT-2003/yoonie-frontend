"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  useCreateBillingPortalSessionMutation,
  useUserPlanQuery,
} from "@/lib/domain/payment/paymentApi";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  lifetime: "Lifetime",
};

export function PlanCard() {
  const [redirecting, setRedirecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [polling, setPolling] = React.useState(false);
  const planQuery = useUserPlanQuery();
  const billingPortalMutation = useCreateBillingPortalSessionMutation();
  const refetchPlan = planQuery.refetch;
  const plan = planQuery.data ?? null;

  React.useEffect(() => {
    let cancelled = false;

    const isReturnFromPayment =
      typeof window !== "undefined" &&
      window.location.search.includes("payment=success");

    if (!isReturnFromPayment || (plan && plan.plan !== "free")) return;

    setPolling(true);
    let attempts = 0;
    const MAX = 5;

    const interval = setInterval(async () => {
      if (cancelled) {
        clearInterval(interval);
        return;
      }
      attempts++;
      const result = await refetchPlan();
      if (result.data && result.data.plan !== "free") {
        clearInterval(interval);
        setPolling(false);
      } else if (attempts >= MAX) {
        clearInterval(interval);
        setPolling(false);
      }
    }, 2000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [plan, refetchPlan]);

  const handleManageBilling = React.useCallback(async () => {
    setError(null);
    setRedirecting(true);
    try {
      const origin = window.location.origin;
      const { url } = await billingPortalMutation.mutateAsync(
        `${origin}/account`
      );
      window.location.href = url;
    } catch (e: unknown) {
      setRedirecting(false);
      setError(e instanceof Error ? e.message : "Could not open billing portal");
    }
  }, [billingPortalMutation]);

  if (!plan) return null;

  const isExpired =
    plan.plan === "pro" &&
    plan.planExpiresAt !== null &&
    new Date(plan.planExpiresAt) < new Date();

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-100 bg-zinc-50/80 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Your Plan
        </h2>
      </div>

      <dl className="px-6 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Plan
          </dt>
          <dd className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {PLAN_LABELS[plan.plan] ?? plan.plan}
            {isExpired && (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-normal text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                Expired
              </span>
            )}
          </dd>
        </div>

        {plan.plan === "lifetime" && (
          <div className="flex items-center justify-between">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Access
            </dt>
            <dd className="text-sm text-zinc-900 dark:text-zinc-100">Lifetime access</dd>
          </div>
        )}

        {plan.plan === "pro" && plan.planExpiresAt && (
          <div className="flex items-center justify-between">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {isExpired ? "Expired" : "Renews"}
            </dt>
            <dd className="text-sm text-zinc-900 dark:text-zinc-100">
              {formatDate(plan.planExpiresAt)}
            </dd>
          </div>
        )}
      </dl>

      {polling && (
        <p className="px-6 pb-3 text-xs text-zinc-400">Confirming payment…</p>
      )}

      {error && (
        <p className="mx-6 mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          {error}
        </p>
      )}

      {plan.plan !== "free" && (
        <div className="border-t border-zinc-100 px-6 py-4 dark:border-zinc-800">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManageBilling}
            disabled={redirecting}
          >
            {redirecting ? "Redirecting…" : "Manage billing →"}
          </Button>
        </div>
      )}
    </div>
  );
}
