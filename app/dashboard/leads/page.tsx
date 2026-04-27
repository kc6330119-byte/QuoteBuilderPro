import { Mail, PhoneCall } from "lucide-react";
import { Badge } from "@/components/badge";
import { ButtonLink } from "@/components/button";
import { PageHeader } from "@/components/page-header";
import { leads } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

const leadTone = {
  NEW: "warning",
  CONTACTED: "neutral",
  WON: "success",
  LOST: "danger"
} as const;

export default function LeadsPage() {
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
          {leads.map((lead) => (
            <article key={lead.id} className="grid gap-4 px-5 py-5 lg:grid-cols-[1.15fr_1fr_130px_120px_120px] lg:items-center">
              <div>
                <p className="font-semibold text-ink">{lead.customerName}</p>
                <p className="mt-1 text-sm text-coal/60">{lead.company}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-coal/60">
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {lead.email}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <PhoneCall className="h-3.5 w-3.5" />
                    Mock phone
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium text-coal/75">{lead.calculatorName}</p>
              <p className="font-display text-lg font-bold text-ink">{formatCurrency(lead.totalCents)}</p>
              <Badge tone={leadTone[lead.status]}>{lead.status}</Badge>
              <p className="text-sm text-coal/60">{formatDate(lead.createdAt)}</p>
            </article>
          ))}
        </div>
      </section>
      <div className="rounded-lg border border-line bg-ink p-5 text-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">Submission storage comes next.</h2>
            <p className="mt-2 text-sm text-white/70">
              The Prisma schema includes QuoteSubmission so this page can switch from mock records to Neon rows cleanly.
            </p>
          </div>
          <ButtonLink href="/quote/managed-it-services" variant="secondary">
            Test public form
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
