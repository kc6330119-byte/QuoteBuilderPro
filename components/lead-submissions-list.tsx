"use client";

import { useState } from "react";
import { ChevronDown, ClipboardList, Mail, PhoneCall } from "lucide-react";
import { LeadManagementControls } from "@/components/lead-management-controls";
import type { LeadListItem } from "@/lib/calculator-data";
import { cn, formatDate, formatDollars } from "@/lib/utils";

export function LeadSubmissionsList({ leads }: { leads: LeadListItem[] }) {
  const [openLeadId, setOpenLeadId] = useState<string | null>(leads[0]?.id ?? null);

  if (leads.length === 0) {
    return (
      <section className="overflow-hidden rounded-lg border border-[#dbe5f4] bg-white shadow-crisp">
        <div className="px-5 py-10 text-center">
          <h2 className="font-display text-2xl font-bold text-ink">No quote submissions yet</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-coal/70">
            Submit a public quote request from one of your calculators and it will appear here.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-[#dbe5f4] bg-white shadow-crisp">
      <div className="hidden grid-cols-[1.15fr_0.9fr_130px_190px_1.1fr] border-b border-[#dbe5f4] bg-[#f8fbff] px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-coal/60 lg:grid">
        <span>Lead</span>
        <span>Calculator</span>
        <span>Quote</span>
        <span>Manage</span>
        <span>Answers</span>
      </div>
      <div className="divide-y divide-[#dbe5f4]">
        {leads.map((lead) => {
          const isOpen = openLeadId === lead.id;

          return (
            <article key={lead.id} className={cn("bg-white transition", isOpen && "bg-[linear-gradient(180deg,#ffffff,#f8fbff)]")}>
              <div className="grid gap-4 px-5 py-5 lg:grid-cols-[1.15fr_0.9fr_130px_190px_1.1fr] lg:items-center">
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
                <LeadManagementControls leadId={lead.id} status={lead.status} customerName={lead.customerName} />
                <div>
                  <p className="text-sm text-coal/60">{formatDate(lead.createdAt)}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-coal/70">{lead.answersSummary}</p>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`lead-details-${lead.id}`}
                    onClick={() => setOpenLeadId((current) => (current === lead.id ? null : lead.id))}
                    className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#dbe5f4] bg-white px-3 py-1.5 text-xs font-bold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
                  >
                    {isOpen ? "Hide details" : "View details"}
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")} />
                  </button>
                </div>
              </div>

              {isOpen ? (
                <div id={`lead-details-${lead.id}`} className="px-5 pb-5">
                  <div className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">Lead detail</p>
                        <h3 className="mt-1 font-display text-xl font-bold text-ink">{lead.customerName}</h3>
                      </div>
                      <div className="rounded-lg border border-[#dbe5f4] bg-[#f8fbff] px-3 py-2 text-right">
                        <p className="text-xs font-semibold text-coal/55">Estimated value</p>
                        <p className="font-display text-lg font-bold text-ink">{formatDollars(lead.estimatedPrice)}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
                      <div className="rounded-lg border border-[#dbe5f4] bg-[#f8fbff] p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-coal/50">Follow-up info</p>
                        <div className="mt-3 space-y-2 text-sm leading-6 text-coal/75">
                          <p>
                            <strong className="text-ink">Calculator:</strong> {lead.calculatorName}
                          </p>
                          <p>
                            <strong className="text-ink">Submitted:</strong> {formatDate(lead.createdAt)}
                          </p>
                          <p>
                            <strong className="text-ink">Email:</strong> {lead.customerEmail}
                          </p>
                          {lead.customerPhone ? (
                            <p>
                              <strong className="text-ink">Phone:</strong> {lead.customerPhone}
                            </p>
                          ) : null}
                          <p>
                            <strong className="text-ink">Notes:</strong> {lead.customerNotes ?? "No notes provided."}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-lg border border-[#dbe5f4] bg-[#f8fbff] p-4">
                        <div className="flex items-center gap-2">
                          <ClipboardList className="h-4 w-4 text-blue-700" />
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-coal/50">Submitted answers</p>
                        </div>
                        {lead.answerItems.length > 0 ? (
                          <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                            {lead.answerItems.map((answer) => (
                              <div key={`${lead.id}-${answer.label}`} className="rounded-md border border-white bg-white px-3 py-2">
                                <dt className="text-xs font-bold uppercase tracking-[0.08em] text-coal/45">{answer.label}</dt>
                                <dd className="mt-1 text-sm font-semibold text-ink">{answer.value}</dd>
                              </div>
                            ))}
                          </dl>
                        ) : (
                          <p className="mt-3 rounded-md border border-white bg-white px-3 py-3 text-sm text-coal/60">
                            No answers were captured for this submission.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
