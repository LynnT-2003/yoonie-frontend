"use client";

import { useUserPlanQuery } from "@/lib/domain/payment/paymentApi";
import type { PaymentPlanId } from "@/lib/types/payment";

export type ProDemoPageVm = {
  plan: PaymentPlanId | null;
  loading: boolean;
};

export function useProDemoPageVm(): ProDemoPageVm {
  const planQuery = useUserPlanQuery();

  return {
    plan: planQuery.data?.plan ?? (planQuery.isError ? "free" : null),
    loading: planQuery.isLoading,
  };
}
