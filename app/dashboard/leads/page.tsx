import { Mail, PhoneCall } from "lucide-react";
import { Badge } from "@/components/badge";
import { ButtonLink } from "@/components/button";
import { PageHeader } from "@/components/page-header";
import { getLeadListItems } from "@/lib/calculator-data";
import { formatDate, formatDollars } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const leads = await getLeadListItems();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Lead submissions"
        description="Review incoming quote requests, estimated value, customer contact details, and follow-up status."
      />
      <section className="overflow-hidden rounded-lg border border-line bg-white shadow-crisp">
        <div className="hidden grid-cols-[1.15fr_1fr_130px_120px_120px] border-b border-line bg-paper px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-coal/60 lg:grid">
          <span>Lead</span>
          <span>Calculator</span>
          <span>Quote</span>
          <span>Status</span>
          <span>Received</span>
        </div>
        <div className="divide-y divide-line">
          {leads.length > 0 ? (
            leads.map((lead) => (
              <article key={lead.id} className="grid gap-4 px-5 py-5 lg:grid-cols-[1.15fr_1fr_130px_120px_120px] lg:items-center">
                <div>
                  <p className="font-semibold text-ink">{lead.customerName}</p>
                  <p className="mt-1 text-sm text-coal/60">{lead.customerNotes ?? "No notes yet."}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-coal/60">
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      {lead.customerEmail}
                    </span>
                    {lead.customerPhone ? (
                      <span className="inline-flex items-center gap-1">
                        <PhoneCall className="h-3.5 w-3.5" />
                        {lead.customerPhone}
                      </span>
                    ) : null}
                  </div>
                </div>
                <p className="text-sm font-medium text-coal/75">{lead.calculatorName}</p>
                <p className="font-display text-lg font-bold text-ink">{formatDollars(lead.estimatedPrice)}</p>
                <Badge tone="warning">NEW</Badge>
                <p className="text-sm text-coal/60">{formatDate(lead.createdAt)}</p>
              </article>
            ))
          ) : (
            <div className="px-5 py-10 text-center">
              <h2 className="font-display text-2xl font-bold text-ink">No quote submissions yet</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-coal/70">
                Submit a public quote request from one of your calculators and it will appear here.
              </p>
            </div>
          )}
        </div>
      </section>
      <div className="rounded-lg border border-line bg-ink p-5 text-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">Submissions are stored in Neon.</h2>
            <p className="mt-2 text-sm text-white/70">
              Customer quote requests are now persisted as QuoteSubmission records and displayed from the database.
            </p>
          </div>
          <ButtonLink href="/dashboard/calculators" variant="secondary">
            View calculators
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
