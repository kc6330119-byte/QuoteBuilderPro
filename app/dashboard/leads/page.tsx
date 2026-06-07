import { Download } from "lucide-react";
import { LeadLimitNotice } from "@/components/lead-limit-notice";
import { LeadSubmissionsList } from "@/components/lead-submissions-list";
import { PageHeader } from "@/components/page-header";
import { getLeadListItems, getWorkspaceLeadUsage } from "@/lib/calculator-data";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const [leads, leadUsage] = await Promise.all([getLeadListItems(), getWorkspaceLeadUsage()]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Lead submissions"
        description="Review incoming quote requests, estimated value, customer contact details, and follow-up status."
        actions={
          leads.length > 0 ? (
            // Plain anchor (not ButtonLink) so the browser performs a real navigation and downloads the file.
            <a
              href="/dashboard/leads/export"
              download
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#dbe5f4] bg-white px-4 text-sm font-semibold text-coal transition duration-200 hover:border-blue-500 hover:text-blue-700"
            >
              <Download className="h-4 w-4" /> Download CSV
            </a>
          ) : undefined
        }
      />
      <LeadLimitNotice usage={leadUsage} />
      <LeadSubmissionsList leads={leads} />
    </div>
  );
}
