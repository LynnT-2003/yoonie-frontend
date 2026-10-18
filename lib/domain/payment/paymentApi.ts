import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRequest, postRequest } from "@/lib/domain/api/NetworkManager";
import { apiPath } from "@/lib/config/api-path";
import type {
  UserPlan,
  CheckoutSession,
  BillingPortalSession,
  CreateBillingPortalSessionBody,
  CreateCheckoutSessionBody,
} from "@/lib/types/payment";

export const PRICE_IDS = {
  pro: "price_1TIndpEfoimMU6KcjxoXbkHw",
  lifetime: "price_1TIneDEfoimMU6KcvftufKGL",
} as const;

export const paymentQueryKeys = {
  all: ["payment"] as const,
  plan: () => [...paymentQueryKeys.all, "plan"] as const,
};

export const getUserPlan = () =>
  getRequest<UserPlan>(apiPath("payment/plan"));

export const createCheckoutSession = (body: CreateCheckoutSessionBody) =>
  postRequest<CheckoutSession, CreateCheckoutSessionBody>(
    apiPath("payment/checkout"),
    body
  );

export const createBillingPortalSession = (returnUrl: string) =>
  postRequest<BillingPortalSession, CreateBillingPortalSessionBody>(
    apiPath("payment/billing-portal"),
    { returnUrl }
  );

export function useUserPlanQuery() {
  return useQuery({
    queryKey: paymentQueryKeys.plan(),
    queryFn: getUserPlan,
    staleTime: 30_000,
  });
}

export function useCreateCheckoutSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: paymentQueryKeys.all });
    },
  });
}

export function useCreateBillingPortalSessionMutation() {
  return useMutation({
    mutationFn: createBillingPortalSession,
  });
}
