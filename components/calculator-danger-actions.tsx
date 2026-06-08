"use client";

import { Archive, Trash2 } from "lucide-react";
import { SubmitButton } from "@/components/submit-button";
import { archiveCalculatorAction, deleteCalculatorAction } from "@/lib/actions";

export function CalculatorDangerActions({
  calculatorId,
  calculatorName
}: {
  calculatorId: string;
  calculatorName: string;
}) {
  return (
    <section className="rounded-lg border border-red-100 bg-red-50/60 p-5 shadow-crisp">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-700">Danger zone</p>
      <h2 className="mt-2 font-display text-xl font-bold text-ink">Manage calculator access</h2>
      <p className="mt-2 text-sm leading-6 text-coal/70">
        Archive hides this calculator from the active dashboard and public quote page while preserving its lead history.
        Permanent delete removes the calculator, questions, rules, and its submitted leads.
      </p>
      <div className="mt-5 grid gap-3">
        <form
          action={archiveCalculatorAction}
          onSubmit={(event) => {
            if (!window.confirm(`Archive "${calculatorName}"? Its public quote page will no longer be available.`)) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="calculatorId" value={calculatorId} />
          <SubmitButton
            variant="outline"
            className="w-full border-amber-200 bg-white text-amber-800 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-900"
            pendingLabel="Archiving..."
          >
            <Archive className="h-4 w-4" /> Archive calculator
          </SubmitButton>
        </form>
        <form
          action={deleteCalculatorAction}
          onSubmit={(event) => {
            if (
              !window.confirm(
                `Permanently delete "${calculatorName}"? This also deletes its questions, pricing, and submitted leads.`
              )
            ) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="calculatorId" value={calculatorId} />
          <SubmitButton
            variant="outline"
            className="w-full border-red-200 bg-white text-red-700 hover:border-red-300 hover:bg-red-50 hover:text-red-800"
            pendingLabel="Deleting..."
          >
            <Trash2 className="h-4 w-4" /> Delete permanently
          </SubmitButton>
        </form>
      </div>
    </section>
  );
}
