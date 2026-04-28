"use client";

import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";
import { deleteLeadAction, updateLeadStatusAction } from "@/lib/actions";
import type { LeadStatus } from "@/lib/calculator-data";
import { cn } from "@/lib/utils";

const statuses: Array<{ value: LeadStatus; label: string }> = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "WON", label: "Won" },
  { value: "LOST", label: "Lost" }
];

const statusStyles: Record<LeadStatus, string> = {
  NEW: "border-amber-200 bg-amber-50 text-amber-800",
  CONTACTED: "border-blue-200 bg-blue-50 text-blue-800",
  WON: "border-teal-200 bg-teal-50 text-teal-800",
  LOST: "border-slate-200 bg-slate-50 text-slate-700"
};

export function LeadManagementControls({
  leadId,
  status,
  customerName
}: {
  leadId: string;
  status: LeadStatus;
  customerName: string;
}) {
  return (
    <div className="space-y-2">
      <form action={updateLeadStatusAction} className="flex items-center gap-2">
        <input type="hidden" name="leadId" value={leadId} />
        <label className="sr-only" htmlFor={`status-${leadId}`}>
          Lead status
        </label>
        <select
          id={`status-${leadId}`}
          name="status"
          defaultValue={status}
          className={cn(
            "h-9 min-w-0 flex-1 rounded-full border px-3 text-xs font-bold outline-none transition focus:border-teal-600 focus:bg-white",
            statusStyles[status]
          )}
        >
          {statuses.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <StatusSubmitButton />
      </form>
      <form
        action={deleteLeadAction}
        onSubmit={(event) => {
          if (!window.confirm(`Delete the lead for ${customerName}? This removes the submission permanently.`)) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="leadId" value={leadId} />
        <DeleteLeadButton />
      </form>
    </div>
  );
}

function StatusSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="h-9 rounded-full border border-[#dbe5f4] bg-white px-3 text-xs font-bold text-coal shadow-sm transition hover:border-blue-500 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-55"
    >
      {pending ? "Saving" : "Save"}
    </button>
  );
}

function DeleteLeadButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-8 w-full items-center justify-center gap-2 rounded-full border border-red-100 bg-white px-3 text-xs font-bold text-red-700 transition hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-55"
    >
      <Trash2 className="h-3.5 w-3.5" />
      {pending ? "Deleting" : "Delete lead"}
    </button>
  );
}
