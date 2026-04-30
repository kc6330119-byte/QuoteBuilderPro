export type BillingTier = "STARTER" | "PRO" | "AGENCY";

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

export const billingPlans: BillingPlan[] = [
  {
    tier: "STARTER",
    name: "Starter",
    price: 29,
    priceLabel: "$29/mo",
    calculatorLimit: 1,
    leadLimit: 50,
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID,
    description: "For one service business testing a focused quote flow.",
    features: ["1 published calculator", "50 leads per month", "Branding and embed code", "Lead dashboard"]
  },
  {
    tier: "PRO",
    name: "Pro",
    price: 79,
    priceLabel: "$79/mo",
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
    price: 199,
    priceLabel: "$199/mo",
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
