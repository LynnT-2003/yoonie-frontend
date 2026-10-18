export type PaymentPlanId = "free" | "pro" | "lifetime";

export type UserPlan = {
  stripeCustomerId: string | null;
  plan: PaymentPlanId;
  planExpiresAt: string | null;
};

export type CheckoutSession = {
  url: string;
  sessionId: string;
};

export type BillingPortalSession = {
  url: string;
};

export type CreateCheckoutSessionBody = {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
};

export type CreateBillingPortalSessionBody = {
  returnUrl: string;
};
