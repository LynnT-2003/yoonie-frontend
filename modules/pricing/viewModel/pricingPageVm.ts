"use client";

import * as React from "react";
import {
  PRICE_IDS,
  useCreateBillingPortalSessionMutation,
  useCreateCheckoutSessionMutation,
  useUserPlanQuery,
} from "@/lib/domain/payment/paymentApi";
import type { UserPlan } from "@/lib/types/payment";

export type PricingPageVm = {
  plan: UserPlan | null;
  loading: boolean;
  redirecting: boolean;
  error: string | null;
  handleCheckoutPro: () => void;
  handleCheckoutLifetime: () => void;
  handleManageBilling: () => void;
};

export function usePricingPageVm(): PricingPageVm {
  const [redirecting, setRedirecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const planQuery = useUserPlanQuery();
  const checkoutMutation = useCreateCheckoutSessionMutation();
  const billingPortalMutation = useCreateBillingPortalSessionMutation();

  React.useEffect(() => {
    setRedirecting(false);
  }, []);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "cancelled") {
      setRedirecting(false);
    }
  }, []);

  const handleCheckout = React.useCallback(async (priceId: string) => {
    setError(null);
    setRedirecting(true);
    try {
      const origin = window.location.origin;
      const { url } = await checkoutMutation.mutateAsync({
        priceId,
        successUrl: `${origin}/account?payment=success`,
        cancelUrl: `${origin}/pricing?checkout=cancelled`,
      });
      window.location.href = url;
    } catch (e: unknown) {
      setRedirecting(false);
      setError(e instanceof Error ? e.message : "Could not start checkout");
    }
  }, [checkoutMutation]);

  const handleCheckoutPro = React.useCallback(
    () => handleCheckout(PRICE_IDS.pro),
    [handleCheckout]
  );

  const handleCheckoutLifetime = React.useCallback(
    () => handleCheckout(PRICE_IDS.lifetime),
    [handleCheckout]
  );

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

  return {
    plan: planQuery.data ?? null,
    loading: planQuery.isLoading,
    redirecting,
    error,
    handleCheckoutPro,
    handleCheckoutLifetime,
    handleManageBilling,
  };
}
