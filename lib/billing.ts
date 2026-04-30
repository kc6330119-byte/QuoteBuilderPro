import { getCurrentWorkspace } from "@/lib/auth";
import { billingPlans, getBillingPlanByTier } from "@/lib/plans";
import { prisma } from "@/lib/prisma";

export async function getBillingDashboardData() {
  const workspace = await getCurrentWorkspace();
  const company = await prisma.company.findUnique({
    where: { id: workspace.companyId },
    include: {
      calculators: {
        where: { isArchived: false },
        include: {
          submissions: {
            select: { id: true, createdAt: true }
          }
        }
      }
    }
  });

  if (!company) {
    throw new Error("Workspace company not found.");
  }

  const currentPlan = getBillingPlanByTier(company.planTier);
  const leadCount = company.calculators.flatMap((calculator) => calculator.submissions).length;

  return {
    company: {
      id: company.id,
      name: company.name,
      stripeCustomerId: company.stripeCustomerId,
      stripeSubscriptionId: company.stripeSubscriptionId,
      stripePriceId: company.stripePriceId,
      planTier: company.planTier,
      subscriptionStatus: company.subscriptionStatus,
      subscriptionCurrentPeriodEnd: company.subscriptionCurrentPeriodEnd
    },
    currentPlan,
    usage: {
      calculatorCount: company.calculators.length,
      publishedCalculatorCount: company.calculators.filter((calculator) => calculator.isPublished).length,
      leadCount
    },
    plans: billingPlans
  };
}
