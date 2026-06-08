"use client";

import { ChevronDown, ChevronUp, DollarSign, GripVertical, Hash, ListChecks, Plus, ToggleRight, Trash2, Type, X } from "lucide-react";
import type { EngineQuestionType } from "@/lib/quote-engine";
import { cn } from "@/lib/utils";
import type { WorkspaceOption, WorkspaceQuestion } from "@/components/calculator-workspace";

const TYPES: { value: EngineQuestionType; label: string; icon: typeof Hash }[] = [
  { value: "SELECT", label: "Choice", icon: ListChecks },
  { value: "NUMBER", label: "Number", icon: Hash },
  { value: "BOOLEAN", label: "Yes / No", icon: ToggleRight },
  { value: "TEXT", label: "Text", icon: Type }
];

const CHECKED_VALUES = ["true", "checked", "yes", "on"];

export function WorkspaceQuestionCard({
  question,
  index,
  total,
  allQuestions,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  dragHandleProps
}: {
  question: WorkspaceQuestion;
  index: number;
  total: number;
  allQuestions: WorkspaceQuestion[];
  onChange: (partial: Partial<WorkspaceQuestion>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  dragHandleProps: { draggable: boolean; onDragStart: () => void; onDragEnd: () => void };
}) {
  const parents = allQuestions.filter((candidate) => candidate.clientId !== question.clientId);
  const nextOptionId = question.options.reduce((max, option) => Math.max(max, option.id), 0) + 1;

  const setOptions = (options: WorkspaceOption[]) => onChange({ options });
  const updateOption = (id: number, key: "label" | "price", value: string) =>
    setOptions(question.options.map((option) => (option.id === id ? { ...option, [key]: value } : option)));

  const changeType = (questionType: EngineQuestionType) => {
    if (questionType === "SELECT" && question.options.length === 0) {
      onChange({ questionType, options: [{ id: 1, label: "", price: "" }, { id: 2, label: "", price: "" }] });
    } else {
      onChange({ questionType });
    }
  };

  const condition = question.visibility;
  const parentQuestion = condition ? allQuestions.find((candidate) => candidate.clientId === condition.questionClientId) : undefined;

  return (
    <div className="rounded-lg border border-[#dbe5f4] bg-white shadow-crisp transition hover:border-[#c8d6ec]">
      <div className="flex items-start gap-2 p-4 pb-2">
        <div className="flex flex-col items-center gap-1 pt-1">
          <button
            type="button"
            {...dragHandleProps}
            title="Drag to reorder"
            className="grid h-7 w-6 cursor-grab place-items-center rounded text-coal/35 transition hover:bg-[#f8fbff] hover:text-coal/60 active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="font-mono text-[10px] font-bold text-coal/35">{index + 1}</span>
        </div>

        <input
          value={question.label}
          onChange={(event) => onChange({ label: event.target.value })}
          placeholder="Type your question…"
          className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1.5 font-display text-lg font-bold text-ink outline-none transition placeholder:text-coal/35 hover:bg-[#f8fbff] focus:border-[#dbe5f4] focus:bg-[#f8fbff]"
        />

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            title="Move up"
            className="grid h-8 w-8 place-items-center rounded-md text-coal/40 transition hover:bg-[#f8fbff] hover:text-coal/70 disabled:opacity-30"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            title="Move down"
            className="grid h-8 w-8 place-items-center rounded-md text-coal/40 transition hover:bg-[#f8fbff] hover:text-coal/70 disabled:opacity-30"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            title="Delete question"
            className="grid h-8 w-8 place-items-center rounded-md text-coal/40 transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 px-4 pb-3 pl-12">
        {TYPES.map((option) => {
          const Icon = option.icon;
          const active = question.questionType === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => changeType(option.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition",
                active
                  ? "border-blue-300 bg-blue-50 text-blue-700"
                  : "border-[#dbe5f4] bg-[#f8fbff] text-coal/65 hover:border-blue-200 hover:text-ink"
              )}
            >
              <Icon className="h-3.5 w-3.5" /> {option.label}
            </button>
          );
        })}
      </div>

      <div className="px-4 pb-3 pl-12">
        {question.questionType === "SELECT" ? (
          <PriceZone title="Price each choice">
            <div className="space-y-2">
              {question.options.map((option) => (
                <div key={option.id} className="flex items-center gap-2">
                  <input
                    value={option.label}
                    onChange={(event) => updateOption(option.id, "label", event.target.value)}
                    placeholder="Option name"
                    className="min-w-0 flex-1 rounded-md border border-[#dbe5f4] bg-white px-3 py-2 text-sm font-medium text-ink outline-none transition focus:border-blue-500"
                  />
                  <span className="font-mono text-sm font-bold text-emerald-700">+</span>
                  <MoneyField value={option.price} onChange={(value) => updateOption(option.id, "price", value)} />
                  <button
                    type="button"
                    onClick={() => setOptions(question.options.length > 1 ? question.options.filter((row) => row.id !== option.id) : question.options)}
                    title="Remove choice"
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-coal/40 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setOptions([...question.options, { id: nextOptionId, label: "", price: "" }])}
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              <Plus className="h-3.5 w-3.5" /> Add choice
            </button>
          </PriceZone>
        ) : question.questionType === "NUMBER" ? (
          <PriceZone title="Price per unit">
            <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-coal/80">
              <span>Charge</span>
              <MoneyField value={question.unitPrice} onChange={(value) => onChange({ unitPrice: value })} />
              <span>for each unit the customer enters.</span>
            </div>
          </PriceZone>
        ) : question.questionType === "BOOLEAN" ? (
          <PriceZone title="Price the add-on">
            <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-coal/80">
              <span>Add</span>
              <MoneyField value={question.addonPrice} onChange={(value) => onChange({ addonPrice: value })} />
              <span>when the customer checks &quot;yes&quot;.</span>
            </div>
          </PriceZone>
        ) : (
          <div className="rounded-lg border border-dashed border-[#dbe5f4] bg-[#f8fbff] px-4 py-3 text-sm text-coal/70">
            Text answers are collected for context and don&apos;t change the price.
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-[#dbe5f4] px-4 py-3 pl-12">
        <label className="inline-flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={question.isRequired}
            onChange={(event) => onChange({ isRequired: event.target.checked })}
            className="h-4 w-4 accent-blue-600"
          />
          <span className="text-sm font-semibold text-coal">Required</span>
        </label>

        {parents.length > 0 ? (
          condition ? (
            <div className="flex flex-wrap items-center gap-2 text-sm text-coal/75">
              <span>Only show when</span>
              <select
                value={condition.questionClientId}
                onChange={(event) => {
                  const parent = allQuestions.find((candidate) => candidate.clientId === event.target.value);
                  onChange({ visibility: { questionClientId: event.target.value, value: defaultConditionValue(parent) } });
                }}
                className="rounded-md border border-[#dbe5f4] bg-[#f8fbff] px-2.5 py-1.5 text-sm outline-none focus:border-blue-500"
              >
                {parents.map((parent) => (
                  <option key={parent.clientId} value={parent.clientId}>
                    {parent.label || "Untitled question"}
                  </option>
                ))}
              </select>
              <span>is</span>
              <ConditionValueField
                parent={parentQuestion}
                value={condition.value}
                onChange={(value) => onChange({ visibility: { questionClientId: condition.questionClientId, value } })}
              />
              <button
                type="button"
                onClick={() => onChange({ visibility: null })}
                className="grid h-7 w-7 place-items-center rounded-md text-coal/40 transition hover:bg-red-50 hover:text-red-600"
                title="Remove condition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                const parent = parents[0];
                onChange({ visibility: { questionClientId: parent.clientId, value: defaultConditionValue(parent) } });
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-[#c8d6ec] px-2.5 py-1.5 text-xs font-semibold text-coal/60 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              Only show this sometimes
            </button>
          )
        ) : null}
      </div>
    </div>
  );
}

function ConditionValueField({
  parent,
  value,
  onChange
}: {
  parent: WorkspaceQuestion | undefined;
  value: string;
  onChange: (value: string) => void;
}) {
  if (parent?.questionType === "SELECT") {
    const labels = parent.options.map((option) => option.label.trim()).filter(Boolean);
    return (
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-[#dbe5f4] bg-[#f8fbff] px-2.5 py-1.5 text-sm outline-none focus:border-blue-500"
      >
        {labels.length === 0 ? <option value="">(add choices first)</option> : null}
        {labels.map((label) => (
          <option key={label} value={label}>
            {label}
          </option>
        ))}
      </select>
    );
  }

  if (parent?.questionType === "BOOLEAN") {
    return (
      <select
        value={CHECKED_VALUES.includes(value.toLowerCase()) ? "true" : "false"}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-[#dbe5f4] bg-[#f8fbff] px-2.5 py-1.5 text-sm outline-none focus:border-blue-500"
      >
        <option value="true">Checked / Yes</option>
        <option value="false">Not checked / No</option>
      </select>
    );
  }

  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="exact answer"
      className="w-32 rounded-md border border-[#dbe5f4] bg-[#f8fbff] px-2.5 py-1.5 text-sm outline-none focus:border-blue-500"
    />
  );
}

function defaultConditionValue(parent: WorkspaceQuestion | undefined) {
  if (parent?.questionType === "SELECT") return parent.options[0]?.label.trim() ?? "";
  if (parent?.questionType === "BOOLEAN") return "true";
  return "";
}

function PriceZone({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-emerald-200 bg-emerald-50/60 p-3.5">
      <div className="mb-2.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-700">
        <DollarSign className="h-3.5 w-3.5" /> {title}
      </div>
      {children}
    </div>
  );
}

function MoneyField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <span className="relative inline-flex items-center">
      <span className="pointer-events-none absolute left-2.5 font-mono text-sm font-semibold text-emerald-700">$</span>
      <input
        type="number"
        min="0"
        step="0.01"
        inputMode="decimal"
        placeholder="0"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-28 rounded-md border border-emerald-100 bg-emerald-50 py-2 pl-6 pr-2.5 font-mono text-sm font-semibold text-emerald-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
      />
    </span>
  );
}
