import { freePlan, getBillingPlanByTier, isPaidSubscriptionStatus, type BillingPlan } from "@/lib/plans";

// Pure plan-limit policy. No database access here so the rules stay easy to reason about and reuse;
// callers pass in the counts they have already fetched. The workspace-bound async reads that feed
// these (current published count, monthly lead count) live in lib/calculator-data.ts.

type CompanyPlanState = {
  planTier: string | null | undefined;
  subscriptionStatus: string | null | undefined;
};

// Resolves any tier (including "FREE", null, or an unknown value) to a concrete plan so every gate
// evaluates. `getBillingPlanByTier` returns null for "FREE"/unknown by design, hence the fallback.
export function resolvePlan(planTier: string | null | undefined): BillingPlan {
  return getBillingPlanByTier(planTier) ?? freePlan;
}

export type PublishGate = { allowed: true } | { allowed: false; reason: "plan-required" | "calculator-limit" };

export function checkCanPublish(
  company: CompanyPlanState & {
    // Number of OTHER calculators in the company that are already published (excludes the one being toggled).
    otherPublishedCount: number;
  }
): PublishGate {
  const plan = resolvePlan(company.planTier);

  if (!isPaidSubscriptionStatus(company.subscriptionStatus)) {
    return { allowed: false, reason: "plan-required" };
  }

  if (company.otherPublishedCount >= plan.calculatorLimit) {
    return { allowed: false, reason: "calculator-limit" };
  }

  return { allowed: true };
}

export type CreateGate = { allowed: true } | { allowed: false; reason: "calculator-create-limit" };

export function checkCanCreateCalculator(company: { planTier: string | null | undefined; totalCalculatorCount: number }): CreateGate {
  if (company.totalCalculatorCount >= getCalculatorCreateLimit(resolvePlan(company.planTier))) {
    return { allowed: false, reason: "calculator-create-limit" };
  }

  return { allowed: true };
}

// Drafts do not leak revenue (they are private and capture no leads), so creation is generous: it leaves
// drafting headroom above the published limit while still capping runaway/abusive creation.
export function getCalculatorCreateLimit(plan: BillingPlan) {
  return Math.max(plan.calculatorLimit + 2, 3);
}

export type LeadUsage = { used: number; limit: number; overLimit: boolean; remaining: number };

export function getLeadUsage(company: { planTier: string | null | undefined; usedThisPeriod: number }): LeadUsage {
  const limit = resolvePlan(company.planTier).leadLimit;
  const used = company.usedThisPeriod;
  // FREE has a 0 limit (it cannot publish, so it should not receive leads) — any usage is "over".
  // Paid plans are "over" once usage reaches the monthly cap.
  const overLimit = limit > 0 ? used >= limit : used > 0;

  return { used, limit, overLimit, remaining: Math.max(0, limit - used) };
}

// Start of the current UTC calendar month — the window leads are metered against ("X leads per month").
export function getCurrentPeriodStart(now: Date = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}
