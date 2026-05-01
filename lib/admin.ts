import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getBillingPlanLabel } from "@/lib/plans";
import { prisma } from "@/lib/prisma";

export type AdminUser = {
  email: string;
  name: string;
};

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const email = getPrimaryEmail(clerkUser);
  if (!email || !isAdminEmail(email)) {
    return null;
  }

  return {
    email,
    name: clerkUser.fullName || clerkUser.firstName || email.split("@")[0] || "Admin"
  };
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;

  return getAdminEmails().includes(email.toLowerCase().trim());
}

export async function getAdminDashboardData() {
  const [companies, totalUsers, totalCalculators, publishedCalculators, totalLeads, pipelineTotal] = await Promise.all([
    prisma.company.findMany({
      where: {
        OR: [
          { users: { some: {} } },
          { calculators: { some: {} } }
        ]
      },
      include: {
        users: {
          orderBy: { createdAt: "asc" }
        },
        calculators: {
          include: {
            submissions: {
              select: {
                createdAt: true,
                estimatedPrice: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.user.count(),
    prisma.calculator.count({ where: { isArchived: false } }),
    prisma.calculator.count({ where: { isPublished: true, isArchived: false } }),
    prisma.quoteSubmission.count(),
    prisma.quoteSubmission.aggregate({
      _sum: {
        estimatedPrice: true
      }
    })
  ]);

  const accounts = companies.map((company) => {
    const owner = company.users[0] ?? null;
    const calculators = company.calculators.filter((calculator) => !calculator.isArchived);
    const publishedCount = calculators.filter((calculator) => calculator.isPublished).length;
    const submissions = calculators.flatMap((calculator) => calculator.submissions);
    const latestLeadAt = submissions.reduce<Date | null>((latest, submission) => {
      if (!latest || submission.createdAt > latest) return submission.createdAt;
      return latest;
    }, null);
    const latestCalculatorAt = calculators.reduce<Date | null>((latest, calculator) => {
      if (!latest || calculator.updatedAt > latest) return calculator.updatedAt;
      return latest;
    }, null);
    const latestActivityAt = latestLeadAt ?? latestCalculatorAt ?? company.updatedAt;

    return {
      id: company.id,
      name: company.name,
      ownerName: owner?.name ?? "No owner name",
      ownerEmail: owner?.email ?? "No owner email",
      planName: getBillingPlanLabel(company.planTier),
      planStatus: formatSubscriptionStatus(company.subscriptionStatus),
      userCount: company.users.length,
      calculatorCount: calculators.length,
      publishedCount,
      leadCount: submissions.length,
      pipelineValue: submissions.reduce((sum, submission) => sum + Number(submission.estimatedPrice), 0),
      createdAt: company.createdAt,
      latestActivityAt
    };
  });

  return {
    totals: {
      accountCount: companies.length,
      userCount: totalUsers,
      calculatorCount: totalCalculators,
      publishedCalculatorCount: publishedCalculators,
      leadCount: totalLeads,
      pipelineValue: Number(pipelineTotal._sum.estimatedPrice ?? 0)
    },
    accounts
  };
}

function getAdminEmails() {
  return String(process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function formatSubscriptionStatus(status: string | null | undefined) {
  if (!status || status === "NONE") {
    return "Not subscribed";
  }

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getPrimaryEmail(clerkUser: Awaited<ReturnType<typeof currentUser>>) {
  return (
    clerkUser?.primaryEmailAddress?.emailAddress ??
    clerkUser?.emailAddresses[0]?.emailAddress ??
    ""
  ).toLowerCase();
}
