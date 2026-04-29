import { LeadSubmissionsList } from "@/components/lead-submissions-list";
import { PageHeader } from "@/components/page-header";
import { getLeadListItems } from "@/lib/calculator-data";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const leads = await getLeadListItems();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Lead submissions"
        description="Review incoming quote requests, estimated value, customer contact details, and follow-up status."
      />
      <LeadSubmissionsList leads={leads} />
    </div>
  );
}
