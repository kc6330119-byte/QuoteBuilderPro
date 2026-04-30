import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
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
  const [companies, totalUsers, totalCalculators, publishedCalculators, totalLeads, leadTotals] = await Promise.all([
    prisma.company.findMany({
      include: {
        users: {
          include: {
            userPlans: {
              include: {
                plan: true
              },
              orderBy: { startedAt: "desc" },
              take: 1
            }
          },
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
    prisma.quoteSubmission.findMany({ select: { estimatedPrice: true } })
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
    const activePlan = owner?.userPlans[0];

    return {
      id: company.id,
      name: company.name,
      ownerName: owner?.name ?? "No owner name",
      ownerEmail: owner?.email ?? "No owner email",
      planName: activePlan?.plan.name ?? "Manual / no plan",
      planStatus: activePlan?.status ?? "Not assigned",
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
      pipelineValue: leadTotals.reduce((sum, lead) => sum + Number(lead.estimatedPrice), 0)
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

function getPrimaryEmail(clerkUser: Awaited<ReturnType<typeof currentUser>>) {
  return (
    clerkUser?.primaryEmailAddress?.emailAddress ??
    clerkUser?.emailAddresses[0]?.emailAddress ??
    ""
  ).toLowerCase();
}
