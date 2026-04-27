import { ArrowUpRight, ClipboardList, DollarSign, FilePlus2, TrendingUp, Users } from "lucide-react";
import { ButtonLink } from "@/components/button";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { calculators, leads } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const published = calculators.filter((calculator) => calculator.status === "PUBLISHED").length;
  const leadTotal = leads.length;
  const pipeline = leads.reduce((sum, lead) => sum + lead.totalCents, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="A mock-auth workspace for creating quote calculators, publishing them, and tracking incoming leads."
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
        <StatCard label="Published calculators" value={String(published)} detail="One draft is waiting for review." icon={<ClipboardList className="h-5 w-5" />} />
        <StatCard label="Lead submissions" value={String(leadTotal)} detail="Mock records for the MVP dashboard." icon={<Users className="h-5 w-5" />} />
        <StatCard label="Pipeline quoted" value={formatCurrency(pipeline)} detail="Total value from visible submissions." icon={<DollarSign className="h-5 w-5" />} />
        <StatCard label="Avg conversion" value="18%" detail="Based on sample calculator performance." icon={<TrendingUp className="h-5 w-5" />} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-line bg-white shadow-crisp">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-display text-xl font-bold text-ink">Recent leads</h2>
            <ButtonLink href="/dashboard/leads" variant="ghost" size="sm">
              Open all
            </ButtonLink>
          </div>
          <div className="divide-y divide-line">
            {leads.slice(0, 4).map((lead) => (
              <div key={lead.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_180px_140px] md:items-center">
                <div>
                  <p className="font-semibold text-ink">{lead.customerName}</p>
                  <p className="mt-1 text-sm text-coal/60">{lead.company} via {lead.calculatorName}</p>
                </div>
                <p className="font-semibold text-ink">{formatCurrency(lead.totalCents)}</p>
                <p className="text-sm text-coal/60">{formatDate(lead.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-line bg-ink p-5 text-white shadow-soft">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-100">Next step</p>
          <h2 className="mt-3 font-display text-2xl font-bold">Connect Neon when you are ready.</h2>
          <p className="mt-3 text-sm leading-6 text-white/70">
            Prisma is already modeled for users, calculators, fields, and quote submissions. Add your Neon URLs, run
            the migration, then replace mock data with Prisma reads.
          </p>
          <ButtonLink href="/dashboard/calculators" variant="secondary" className="mt-5">
            Manage calculators <ArrowUpRight className="h-4 w-4" />
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
