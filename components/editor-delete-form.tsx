"use client";

import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";
import { deletePricingRuleAction, deleteQuestionAction } from "@/lib/actions";

export function EditorDeleteForm({
  kind,
  calculatorId,
  itemId,
  label
}: {
  kind: "question" | "pricingRule";
  calculatorId: string;
  itemId: string;
  label: string;
}) {
  const action = kind === "question" ? deleteQuestionAction : deletePricingRuleAction;
  const itemName = kind === "question" ? "question" : "pricing rule";

  return (
    <form
      action={action}
      onSubmit={(event) => {
        const extraWarning = kind === "question" ? " Pricing rules tied to this question will also be removed." : "";
        if (!window.confirm(`Delete this ${itemName}: "${label}"?${extraWarning}`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="calculatorId" value={calculatorId} />
      <input type="hidden" name={kind === "question" ? "questionId" : "ruleId"} value={itemId} />
      <DeleteButton />
    </form>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-3 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-55"
    >
      <Trash2 className="h-4 w-4" />
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}
