import { ArrowUpRight, ClipboardList, DollarSign, FilePlus2, TrendingUp, Users } from "lucide-react";
import { ButtonLink } from "@/components/button";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { getDashboardStats, getLeadListItems } from "@/lib/calculator-data";
import { formatDate, formatDollars } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, leads] = await Promise.all([getDashboardStats(), getLeadListItems(4)]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Create quote calculators, publish them, and track customer submissions from your Neon-backed workspace."
        actions={
          <>
            <ButtonLink href="/dashboard/calculators/new">
              <FilePlus2 className="h-4 w-4" /> New calculator
            </ButtonLink>
            <ButtonLink href="/dashboard/leads" variant="outline">
              View leads <ArrowUpRight className="h-4 w-4" />
            </ButtonLink>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Published calculators" value={String(stats.publishedCount)} detail={`${stats.calculatorCount} total calculators saved.`} icon={<ClipboardList className="h-5 w-5" />} />
        <StatCard label="Lead submissions" value={String(stats.leadCount)} detail="Persisted quote requests from public pages." icon={<Users className="h-5 w-5" />} />
        <StatCard label="Pipeline quoted" value={formatDollars(stats.pipeline)} detail="Total estimated value from submissions." icon={<DollarSign className="h-5 w-5" />} />
        <StatCard label="Avg conversion" value="Soon" detail="Conversion tracking comes after real traffic." icon={<TrendingUp className="h-5 w-5" />} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-[#dbe5f4] bg-white shadow-crisp">
          <div className="flex items-center justify-between border-b border-[#dbe5f4] bg-[#f8fbff] px-5 py-4">
            <h2 className="font-display text-xl font-bold text-ink">Recent leads</h2>
            <ButtonLink href="/dashboard/leads" variant="ghost" size="sm">
              Open all
            </ButtonLink>
          </div>
          <div className="divide-y divide-[#dbe5f4]">
            {leads.length > 0 ? (
              leads.map((lead) => (
                <div key={lead.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_180px_140px] md:items-center">
                  <div>
                    <p className="font-semibold text-ink">{lead.customerName}</p>
                    <p className="mt-1 text-sm text-coal/60">via {lead.calculatorName}</p>
                  </div>
                  <p className="font-semibold text-ink">{formatDollars(lead.estimatedPrice)}</p>
                  <p className="text-sm text-coal/60">{formatDate(lead.createdAt)}</p>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-sm text-coal/70">
                No leads yet. Create a calculator, open its public quote page, and submit a test quote request.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-blue-900/20 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.38),transparent_42%),linear-gradient(135deg,#111827,#172554)] p-5 text-white shadow-soft">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100">Live workflow</p>
          <h2 className="mt-3 font-display text-2xl font-bold">Calculators now write to Neon.</h2>
          <p className="mt-3 text-sm leading-6 text-white/70">
            The create form saves calculators and questions, public quote pages save submissions, and the leads table
            reads from the database.
          </p>
          <ButtonLink href="/dashboard/calculators" variant="secondary" className="mt-5">
            Manage calculators <ArrowUpRight className="h-4 w-4" />
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
