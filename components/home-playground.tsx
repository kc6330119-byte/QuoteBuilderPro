"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, DollarSign, Plus, RotateCcw } from "lucide-react";
import { LiveQuotePreview } from "@/components/live-quote-preview";
import { WorkspaceQuestionCard } from "@/components/workspace-question-card";
import type { WorkspaceQuestion } from "@/components/calculator-workspace";
import { getCalculatorTemplateById } from "@/lib/templates";
import type { EngineQuestionType } from "@/lib/quote-engine";
import { cn } from "@/lib/utils";

// The homepage sandbox is the REAL editor experience: the same question cards and
// live preview the dashboard uses, seeded from the Kitchen Remodel template that
// new users can start from. The only thing missing is persistence — nothing here
// is saved or sent anywhere, so visitors can experiment freely.

const SEED_TEMPLATE_ID = "kitchen-remodel";

// A digestible subset of the template (covers choice, number, and yes/no pricing).
const SEED_QUESTION_LABELS = [
  "Finish level",
  "Cabinet package",
  "Flooring square feet",
  "Island option",
  "Change kitchen layout"
];

const TYPE_MAP: Record<"select" | "number" | "checkbox", EngineQuestionType> = {
  select: "SELECT",
  number: "NUMBER",
  checkbox: "BOOLEAN"
};

function buildSeed(): { basePrice: string; questions: WorkspaceQuestion[] } {
  const template = getCalculatorTemplateById(SEED_TEMPLATE_ID);
  if (!template) return { basePrice: "", questions: [] };

  const baseRule = template.pricingRules.find((rule) => rule.ruleType === "base_price");

  const questions = SEED_QUESTION_LABELS.flatMap<WorkspaceQuestion>((label, index) => {
    const question = template.questions.find((candidate) => candidate.label === label);
    if (!question) return [];

    const optionPrice = (option: string) =>
      template.pricingRules.find(
        (rule) => rule.ruleType === "option_price" && rule.questionLabel === label && rule.matchValue === option
      )?.amount ?? 0;
    const unitRule = template.pricingRules.find(
      (rule) => rule.ruleType === "quantity_multiplier" && rule.questionLabel === label
    );
    const addonRule = template.pricingRules.find(
      (rule) => rule.ruleType === "checkbox_addon" && rule.questionLabel === label
    );

    return [
      {
        clientId: `demo-${index + 1}`,
        savedId: null,
        label: question.label,
        questionType: TYPE_MAP[question.type],
        isRequired: question.required,
        options: question.options.map((option, optionIndex) => ({
          id: optionIndex + 1,
          label: option,
          price: optionPrice(option) > 0 ? String(optionPrice(option)) : ""
        })),
        unitPrice: unitRule ? String(unitRule.amount) : "",
        addonPrice: addonRule ? String(addonRule.amount) : "",
        visibility: null
      }
    ];
  });

  return { basePrice: baseRule ? String(baseRule.amount) : "", questions };
}

export function HomePlayground() {
  const seed = useMemo(() => buildSeed(), []);
  const [basePrice, setBasePrice] = useState(seed.basePrice);
  const [questions, setQuestions] = useState<WorkspaceQuestion[]>(seed.questions);
  const [newCount, setNewCount] = useState(0);
  const [resetVersion, setResetVersion] = useState(0);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const updateQuestion = (clientId: string, partial: Partial<WorkspaceQuestion>) => {
    setQuestions((current) => current.map((question) => (question.clientId === clientId ? { ...question, ...partial } : question)));
  };

  const addQuestion = () => {
    const clientId = `new-${newCount + 1}`;
    setNewCount((count) => count + 1);
    setQuestions((current) => [
      ...current,
      {
        clientId,
        savedId: null,
        label: "",
        questionType: "SELECT",
        isRequired: false,
        options: [
          { id: 1, label: "", price: "" },
          { id: 2, label: "", price: "" }
        ],
        unitPrice: "",
        addonPrice: "",
        visibility: null
      }
    ]);
  };

  const deleteQuestion = (clientId: string) => {
    setQuestions((current) =>
      current
        .filter((question) => question.clientId !== clientId)
        .map((question) => (question.visibility?.questionClientId === clientId ? { ...question, visibility: null } : question))
    );
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= questions.length || from === to) return;
    setQuestions((current) => {
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const handleDrop = (toIndex: number) => {
    if (dragIndex !== null) move(dragIndex, toIndex);
    setDragIndex(null);
    setDragOver(null);
  };

  const reset = () => {
    const fresh = buildSeed();
    setBasePrice(fresh.basePrice);
    setQuestions(fresh.questions);
    setResetVersion((version) => version + 1);
  };

  return (
    <div className="relative">
      <div className="absolute -bottom-6 left-8 right-8 h-24 rounded-[2rem] bg-[#60a5fa] opacity-35 blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border border-[#dbe5f4] bg-white shadow-soft">
        <div className="flex items-center justify-between gap-3 border-b border-[#dbe5f4] bg-[#f8fbff] px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded-full bg-[#ef4444]" />
            <span className="h-3 w-3 shrink-0 rounded-full bg-[#f59e0b]" />
            <span className="h-3 w-3 shrink-0 rounded-full bg-[#22c55e]" />
            <span className="ml-3 truncate text-xs font-bold uppercase tracking-[0.14em] text-[#64748b]">
              Calculator editor <span className="hidden sm:inline">— Kitchen Remodel template</span>
            </span>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-[#dbe5f4] bg-white px-2.5 py-1.5 text-xs font-semibold text-coal/65 shadow-crisp transition hover:border-[#93c5fd] hover:text-[#1d4ed8]"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset demo
          </button>
        </div>

        <div className="grid items-start gap-5 bg-[#f3f8ff] p-4 sm:p-5 lg:grid-cols-[1fr_360px]">
          <div className="max-h-[440px] space-y-4 overflow-y-auto overscroll-contain pr-1 lg:max-h-[640px]">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#dbe5f4] bg-white p-4 shadow-crisp">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                  <DollarSign className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-base font-bold text-ink">Starting price</p>
                  <p className="text-xs text-coal/65">Every quote begins here.</p>
                </div>
              </div>
              <span className="relative inline-flex items-center">
                <span className="pointer-events-none absolute left-3 font-mono font-semibold text-emerald-700">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0"
                  value={basePrice}
                  onChange={(event) => setBasePrice(event.target.value)}
                  className="w-32 rounded-md border border-emerald-100 bg-emerald-50 py-2.5 pl-7 pr-3 font-mono text-base font-semibold text-emerald-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </span>
            </div>

            {questions.map((question, index) => (
              <div
                key={question.clientId}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOver(index);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  handleDrop(index);
                }}
                onDragLeave={() => setDragOver((current) => (current === index ? null : current))}
                className={cn("rounded-lg transition", dragOver === index && dragIndex !== null && dragIndex !== index ? "ring-2 ring-blue-300" : "")}
              >
                <WorkspaceQuestionCard
                  question={question}
                  index={index}
                  total={questions.length}
                  allQuestions={questions}
                  onChange={(partial) => updateQuestion(question.clientId, partial)}
                  onDelete={() => deleteQuestion(question.clientId)}
                  onMoveUp={() => move(index, index - 1)}
                  onMoveDown={() => move(index, index + 1)}
                  dragHandleProps={{
                    draggable: true,
                    onDragStart: () => setDragIndex(index),
                    onDragEnd: () => {
                      setDragIndex(null);
                      setDragOver(null);
                    }
                  }}
                />
              </div>
            ))}

            <button
              type="button"
              onClick={addQuestion}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#c8d6ec] bg-white/60 px-4 py-4 text-sm font-semibold text-blue-700 transition hover:border-blue-400 hover:bg-blue-50"
            >
              <Plus className="h-4 w-4" /> Add a question
            </button>
          </div>

          <aside>
            <LiveQuotePreview
              key={resetVersion}
              basePrice={Number(basePrice) || 0}
              questions={questions}
              displayName="Summit Kitchen & Bath"
              brandColor="#2563eb"
            />
          </aside>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#dbe5f4] bg-white px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-sm leading-6 text-coal/60">
            <span className="font-bold text-coal/80">Sandbox:</span> your edits live only on this page — nothing is saved
            or sent. Like what you built?
          </p>
          <Link
            href="/dashboard/templates"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-[#2563eb] px-4 text-sm font-bold text-white shadow-crisp transition hover:bg-[#1d4ed8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]"
          >
            Save yours free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
