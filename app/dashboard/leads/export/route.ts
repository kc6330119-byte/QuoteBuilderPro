import { getLeadListItems, type LeadListItem } from "@/lib/calculator-data";

export const dynamic = "force-dynamic";

// getLeadListItems is scoped to the signed-in workspace, and /dashboard is auth-protected by proxy.ts,
// so this export only ever returns the current company's leads.
export async function GET() {
  const leads = await getLeadListItems();

  return new Response(toCsv(leads), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="quotebuilder-leads.csv"'
    }
  });
}

const CSV_HEADERS = ["Created", "Calculator", "Name", "Email", "Phone", "Estimate", "Status", "Notes", "Answers"];

function toCsv(leads: LeadListItem[]) {
  const rows = leads.map((lead) => [
    new Date(lead.createdAt).toISOString(),
    lead.calculatorName,
    lead.customerName,
    lead.customerEmail,
    lead.customerPhone ?? "",
    lead.estimatedPrice.toFixed(2),
    lead.status,
    lead.customerNotes ?? "",
    lead.answersSummary
  ]);

  return [CSV_HEADERS, ...rows].map((row) => row.map(toCsvCell).join(",")).join("\r\n");
}

function toCsvCell(value: string) {
  // Neutralize spreadsheet formula injection from untrusted lead input, then quote/escape as needed.
  const guarded = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(guarded) ? `"${guarded.replace(/"/g, '""')}"` : guarded;
}
