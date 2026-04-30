import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Activity, Building2, ClipboardList, DollarSign, LayoutDashboard, ShieldCheck, Users } from "lucide-react";
import { Badge } from "@/components/badge";
import { ButtonLink } from "@/components/button";
import { StatCard } from "@/components/stat-card";
import { getAdminDashboardData, getCurrentAdmin } from "@/lib/admin";
import { formatDate, formatDollars } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    notFound();
  }

  const data = await getAdminDashboardData();

  return (
    <main className="min-h-screen bg-[#f7faff] text-ink">
      <section className="border-b border-[#dbe5f4] bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_34%),linear-gradient(135deg,#ffffff,#eef6ff)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <ButtonLink href="/dashboard" variant="outline">
              <LayoutDashboard className="h-4 w-4" />
              Back to workspace
            </ButtonLink>
            <div className="flex items-center gap-3 rounded-full border border-[#dbe5f4] bg-white px-3 py-2 shadow-sm">
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-700">Admin</p>
                <p className="text-sm font-semibold text-coal/70">{admin.email}</p>
              </div>
              <UserButton />
            </div>
          </div>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-700 shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5" />
              QuoteBuilder Pro operator view
            </div>
            <h1 className="mt-5 font-display text-4xl font-black leading-tight md:text-6xl">Admin command center</h1>
            <p className="mt-4 text-base leading-8 text-coal/70">
              Monitor customer accounts, calculator usage, lead volume, and contact details from one read-only internal
              dashboard.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Customer accounts"
            value={String(data.totals.accountCount)}
            detail={`${data.totals.userCount} signed-in users across all workspaces.`}
            icon={<Building2 className="h-5 w-5" />}
          />
          <StatCard
            label="Calculators"
            value={String(data.totals.calculatorCount)}
            detail={`${data.totals.publishedCalculatorCount} published calculators.`}
            icon={<ClipboardList className="h-5 w-5" />}
          />
          <StatCard
            label="Leads captured"
            value={String(data.totals.leadCount)}
            detail="Total quote submissions across all accounts."
            icon={<Users className="h-5 w-5" />}
          />
          <StatCard
            label="Quoted pipeline"
            value={formatDollars(data.totals.pipelineValue)}
            detail="Total estimated value submitted through calculators."
            icon={<DollarSign className="h-5 w-5" />}
          />
        </div>

        <section className="overflow-hidden rounded-xl border border-[#dbe5f4] bg-white shadow-crisp">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dbe5f4] bg-[#f8fbff] px-5 py-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Accounts</p>
              <h2 className="mt-1 font-display text-2xl font-bold text-ink">Customer workspaces</h2>
            </div>
            <Badge tone="neutral">Read-only MVP</Badge>
          </div>

          <div className="hidden grid-cols-[1.1fr_1.2fr_0.8fr_0.8fr_0.9fr] border-b border-[#dbe5f4] px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-coal/55 lg:grid">
            <span>Account</span>
            <span>Contact</span>
            <span>Plan</span>
            <span>Usage</span>
            <span>Activity</span>
          </div>

          <div className="divide-y divide-[#dbe5f4]">
            {data.accounts.length > 0 ? (
              data.accounts.map((account) => (
                <article key={account.id} className="grid gap-4 px-5 py-5 lg:grid-cols-[1.1fr_1.2fr_0.8fr_0.8fr_0.9fr] lg:items-center">
                  <div>
                    <p className="font-display text-lg font-bold text-ink">{account.name}</p>
                    <p className="mt-1 text-xs font-semibold text-coal/50">Created {formatDate(account.createdAt)}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-ink">{account.ownerName}</p>
                    <p className="mt-1 text-sm text-coal/65">{account.ownerEmail}</p>
                    <p className="mt-1 text-xs text-coal/45">{account.userCount} workspace user{account.userCount === 1 ? "" : "s"}</p>
                  </div>
                  <div>
                    <Badge tone="neutral">{account.planName}</Badge>
                    <p className="mt-2 text-xs font-semibold text-coal/50">{account.planStatus}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center lg:block lg:space-y-1 lg:text-left">
                    <Metric label="Calculators" value={String(account.calculatorCount)} />
                    <Metric label="Published" value={String(account.publishedCount)} />
                    <Metric label="Leads" value={String(account.leadCount)} />
                  </div>
                  <div>
                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
                      <Activity className="h-4 w-4 text-blue-700" />
                      {formatDate(account.latestActivityAt)}
                    </p>
                    <p className="mt-1 text-sm font-bold text-coal/70">{formatDollars(account.pipelineValue)} quoted</p>
                  </div>
                </article>
              ))
            ) : (
              <div className="px-5 py-10 text-center">
                <h2 className="font-display text-2xl font-bold text-ink">No customer accounts yet</h2>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-coal/70">
                  Accounts will appear here as users sign in and create workspaces.
                </p>
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-display text-lg font-bold text-ink">{value}</p>
      <p className="text-xs font-semibold text-coal/50">{label}</p>
    </div>
  );
}
