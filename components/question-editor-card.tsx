"use client";

import { type ReactNode, useRef, useState } from "react";
import { DollarSign, Hash, ListChecks, Plus, Save, ToggleRight, Type, X } from "lucide-react";
import { BranchConditionFields } from "@/components/branch-condition-fields";
import { EditorDeleteForm } from "@/components/editor-delete-form";
import { FieldHelp } from "@/components/field-help";
import { SubmitButton } from "@/components/submit-button";
import { addCalculatorQuestionAction, saveCalculatorQuestionAction } from "@/lib/actions";
import type { EditorQuestion } from "@/lib/calculator-data";
import { cn } from "@/lib/utils";

type QuestionType = EditorQuestion["questionType"];
type BranchQuestion = { id: string; label: string; questionType: QuestionType; options: string[] };
type OptionRow = { id: number; label: string; price: string };

const TYPES: { value: QuestionType; label: string; icon: typeof Hash }[] = [
  { value: "SELECT", label: "Choice", icon: ListChecks },
  { value: "NUMBER", label: "Number", icon: Hash },
  { value: "BOOLEAN", label: "Yes / No", icon: ToggleRight },
  { value: "TEXT", label: "Text", icon: Type }
];

export function QuestionEditorCard({
  calculatorId,
  question,
  allQuestions
}: {
  calculatorId: string;
  question?: EditorQuestion;
  allQuestions: BranchQuestion[];
}) {
  const isEdit = Boolean(question);
  const [type, setType] = useState<QuestionType>(question?.questionType ?? "SELECT");
  const [options, setOptions] = useState<OptionRow[]>(() => {
    const initial = question?.pricedOptions ?? [];
    if (initial.length) {
      return initial.map((option, index) => ({ id: index, label: option.label, price: option.price ? String(option.price) : "" }));
    }
    return [
      { id: 0, label: "", price: "" },
      { id: 1, label: "", price: "" }
    ];
  });
  const nextId = useRef(options.length);

  const updateOption = (id: number, key: "label" | "price", value: string) =>
    setOptions((rows) => rows.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  const addOption = () => setOptions((rows) => [...rows, { id: nextId.current++, label: "", price: "" }]);
  const removeOption = (id: number) => setOptions((rows) => (rows.length > 1 ? rows.filter((row) => row.id !== id) : rows));

  return (
    <div className="rounded-lg border border-[#dbe5f4] bg-white shadow-crisp">
      <form action={isEdit ? saveCalculatorQuestionAction : addCalculatorQuestionAction} className="p-5">
        <input type="hidden" name="calculatorId" value={calculatorId} />
        {question ? <input type="hidden" name="questionId" value={question.id} /> : null}
        <input type="hidden" name="questionType" value={type} />

        <label className="block">
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-coal/50">
            {isEdit ? "Question" : "New question"}
            <FieldHelp title="Question label">
              <p>Write the question exactly how the customer should read it.</p>
              <p>Example: &quot;What type of kitchen remodel do you need?&quot;</p>
            </FieldHelp>
          </span>
          <input
            required
            name="label"
            defaultValue={question?.label ?? ""}
            placeholder="What service do you need?"
            className="mt-2 w-full rounded-md border border-[#dbe5f4] bg-[#f8fbff] px-3 py-2.5 font-display text-lg font-bold text-ink outline-none transition focus:border-blue-500 focus:bg-white"
          />
        </label>

        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Answer type">
          {TYPES.map((option) => {
            const Icon = option.icon;
            const active = type === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => setType(option.value)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition",
                  active
                    ? "border-blue-300 bg-blue-50 text-blue-700 shadow-[inset_0_0_0_1px_rgba(37,99,235,0.18)]"
                    : "border-[#dbe5f4] bg-[#f8fbff] text-coal/70 hover:border-blue-200 hover:text-ink"
                )}
              >
                <Icon className="h-4 w-4" /> {option.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          {type === "SELECT" ? (
            <PriceZone title="Price each choice">
              <div className="space-y-2">
                {options.map((option) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <input
                      name="optionLabel"
                      value={option.label}
                      onChange={(event) => updateOption(option.id, "label", event.target.value)}
                      placeholder="Option name"
                      className="min-w-0 flex-1 rounded-md border border-[#dbe5f4] bg-white px-3 py-2 text-sm font-medium text-ink outline-none transition focus:border-blue-500"
                    />
                    <span className="font-mono text-sm font-bold text-emerald-700">+</span>
                    <MoneyInput name="optionPrice" value={option.price} onChange={(value) => updateOption(option.id, "price", value)} />
                    <button
                      type="button"
                      onClick={() => removeOption(option.id)}
                      title="Remove choice"
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-coal/45 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addOption}
                className="mt-2.5 inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
              >
                <Plus className="h-3.5 w-3.5" /> Add choice
              </button>
            </PriceZone>
          ) : type === "NUMBER" ? (
            <PriceZone title="Price per unit">
              <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-coal/80">
                <span>Charge</span>
                <MoneyInput name="unitPrice" defaultValue={question?.unitPrice ? String(question.unitPrice) : ""} />
                <span>for each unit the customer enters.</span>
              </div>
            </PriceZone>
          ) : type === "BOOLEAN" ? (
            <PriceZone title="Price the add-on">
              <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-coal/80">
                <span>Add</span>
                <MoneyInput name="addonPrice" defaultValue={question?.addonPrice ? String(question.addonPrice) : ""} />
                <span>when the customer checks &quot;yes&quot;.</span>
              </div>
            </PriceZone>
          ) : (
            <div className="rounded-lg border border-dashed border-[#dbe5f4] bg-[#f8fbff] px-4 py-3 text-sm text-coal/70">
              Text answers are collected for context and don&apos;t change the price.
            </div>
          )}
        </div>

        <div className="mt-4 border-t border-[#dbe5f4] pt-4">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="isRequired" defaultChecked={question?.isRequired ?? false} className="h-4 w-4 accent-blue-600" />
            <span className="text-sm font-semibold text-coal">Required</span>
            <FieldHelp title="Required question">
              <p>Required questions must be answered before a customer can submit.</p>
            </FieldHelp>
          </label>
          <BranchConditionFields questions={allQuestions} currentQuestionId={question?.id} condition={question?.visibilityCondition ?? null} />
        </div>

        <div className="mt-4">
          <SubmitButton variant="secondary" pendingLabel={isEdit ? "Saving..." : "Adding question..."}>
            {isEdit ? (
              <>
                <Save className="h-4 w-4" /> Save question
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Add question
              </>
            )}
          </SubmitButton>
        </div>
      </form>

      {question ? (
        <div className="border-t border-[#dbe5f4] px-5 py-3">
          <EditorDeleteForm kind="question" calculatorId={calculatorId} itemId={question.id} label={question.label} />
        </div>
      ) : null}
    </div>
  );
}

function PriceZone({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-emerald-200 bg-emerald-50/60 p-3.5">
      <div className="mb-2.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-700">
        <DollarSign className="h-3.5 w-3.5" /> {title}
      </div>
      {children}
    </div>
  );
}

function MoneyInput({
  name,
  value,
  onChange,
  defaultValue
}: {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
}) {
  const controlled = onChange !== undefined;
  return (
    <span className="relative inline-flex items-center">
      <span className="pointer-events-none absolute left-2.5 font-mono text-sm font-semibold text-emerald-700">$</span>
      <input
        name={name}
        type="number"
        min="0"
        step="0.01"
        inputMode="decimal"
        placeholder="0"
        {...(controlled ? { value: value ?? "", onChange: (event) => onChange!(event.target.value) } : { defaultValue: defaultValue ?? "" })}
        className="w-28 rounded-md border border-emerald-100 bg-emerald-50 py-2 pl-6 pr-2.5 font-mono text-sm font-semibold text-emerald-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
      />
    </span>
  );
}
