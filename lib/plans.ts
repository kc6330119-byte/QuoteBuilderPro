export type BillingTier = "FREE" | "STARTER" | "PRO" | "AGENCY";

export type BillingPlan = {
  tier: BillingTier;
  name: string;
  price: number;
  priceLabel: string;
  calculatorLimit: number;
  leadLimit: number;
  stripePriceId: string | undefined;
  description: string;
  features: string[];
  highlighted?: boolean;
};

// The implicit tier for every company until they subscribe (Company.planTier defaults to "FREE").
// It is intentionally NOT part of `billingPlans` so the billing page only renders purchasable plans,
// but entitlement gates resolve to it so unsubscribed companies are still limited. See lib/entitlements.ts.
export const freePlan: BillingPlan = {
  tier: "FREE",
  name: "Free",
  price: 0,
  priceLabel: "$0",
  calculatorLimit: 0,
  leadLimit: 0,
  stripePriceId: undefined,
  description: "Build calculators as drafts. Subscribe to publish them and capture leads.",
  features: ["Draft calculators", "Templates and guided builder", "Publish on a paid plan"]
};

export const billingPlans: BillingPlan[] = [
  {
    tier: "STARTER",
    name: "Starter",
    price: 29,
    priceLabel: "$29/mo",
    calculatorLimit: 1,
    leadLimit: 50,
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID,
    description: "For one service business using templates to launch a focused quote flow.",
    features: ["1 published calculator", "50 leads per month", "Templates and guided builder", "Branding and embed code"]
  },
  {
    tier: "PRO",
    name: "Pro",
    price: 59,
    priceLabel: "$59/mo",
    calculatorLimit: 5,
    leadLimit: 500,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
    description: "For established service businesses with multiple quote calculators.",
    features: ["5 published calculators", "500 leads per month", "Templates and guided builder", "Branding and embed code"],
    highlighted: true
  },
  {
    tier: "AGENCY",
    name: "Agency",
    price: 149,
    priceLabel: "$149/mo",
    calculatorLimit: 20,
    leadLimit: 2000,
    stripePriceId: process.env.STRIPE_AGENCY_PRICE_ID,
    description: "For agencies, multi-location teams, or higher-volume operators.",
    features: ["20 published calculators", "2,000 leads per month", "Client-ready embed workflows", "Priority setup support"]
  }
];

export function getBillingPlanByTier(tier: string | null | undefined) {
  return billingPlans.find((plan) => plan.tier === tier) ?? null;
}

export function getBillingPlanByPriceId(priceId: string | null | undefined) {
  if (!priceId) return null;

  return billingPlans.find((plan) => plan.stripePriceId === priceId) ?? null;
}

export function getBillingPlanLabel(tier: string | null | undefined) {
  return getBillingPlanByTier(tier)?.name ?? "No paid plan";
}

export function isPaidSubscriptionStatus(status: string | null | undefined) {
  return status === "active" || status === "trialing";
}

// Turns a Stripe status (e.g. "past_due") into a human label. `emptyLabel` covers the no-subscription case.
export function formatSubscriptionStatus(status: string | null | undefined, emptyLabel = "Not subscribed") {
  if (!status || status === "NONE") {
    return emptyLabel;
  }

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
