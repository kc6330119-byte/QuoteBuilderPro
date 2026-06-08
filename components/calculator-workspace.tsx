"use client";

import { useState } from "react";
import { Check, DollarSign, Loader2, Plus, Save } from "lucide-react";
import { LiveQuotePreview } from "@/components/live-quote-preview";
import { WorkspaceQuestionCard } from "@/components/workspace-question-card";
import { saveCalculatorWorkspaceAction } from "@/lib/actions";
import type { CalculatorEditor, EditorQuestion } from "@/lib/calculator-data";
import type { EngineQuestionType } from "@/lib/quote-engine";
import { cn } from "@/lib/utils";

export type WorkspaceOption = { id: number; label: string; price: string };
export type WorkspaceQuestion = {
  clientId: string;
  savedId: string | null;
  label: string;
  questionType: EngineQuestionType;
  isRequired: boolean;
  options: WorkspaceOption[];
  unitPrice: string;
  addonPrice: string;
  visibility: { questionClientId: string; value: string } | null;
};

function fromEditorQuestion(question: EditorQuestion): WorkspaceQuestion {
  const condition = question.visibilityCondition;
  return {
    clientId: question.id,
    savedId: question.id,
    label: question.label,
    questionType: question.questionType,
    isRequired: question.isRequired,
    options: (question.pricedOptions ?? []).map((option, index) => ({
      id: index + 1,
      label: option.label,
      price: option.price ? String(option.price) : ""
    })),
    unitPrice: question.unitPrice ? String(question.unitPrice) : "",
    addonPrice: question.addonPrice ? String(question.addonPrice) : "",
    visibility: condition
      ? { questionClientId: condition.questionId, value: condition.operator === "checked" ? "true" : String(condition.value ?? "") }
      : null
  };
}

export function CalculatorWorkspace({ calculator }: { calculator: CalculatorEditor }) {
  const [basePrice, setBasePrice] = useState(calculator.basePrice ? String(calculator.basePrice) : "");
  const [questions, setQuestions] = useState<WorkspaceQuestion[]>(() => calculator.questions.map(fromEditorQuestion));
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [dirty, setDirty] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const markDirty = () => {
    setDirty(true);
    setJustSaved(false);
  };

  const updateBasePrice = (value: string) => {
    setBasePrice(value);
    markDirty();
  };

  const updateQuestion = (clientId: string, partial: Partial<WorkspaceQuestion>) => {
    setQuestions((current) => current.map((question) => (question.clientId === clientId ? { ...question, ...partial } : question)));
    markDirty();
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
    markDirty();
  };

  const deleteQuestion = (clientId: string) => {
    setQuestions((current) => {
      const target = current.find((question) => question.clientId === clientId);
      if (target?.savedId) setDeletedIds((ids) => [...ids, target.savedId as string]);
      return current
        .filter((question) => question.clientId !== clientId)
        .map((question) => (question.visibility?.questionClientId === clientId ? { ...question, visibility: null } : question));
    });
    markDirty();
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= questions.length || from === to) return;
    setQuestions((current) => {
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    markDirty();
  };

  const handleDrop = (toIndex: number) => {
    if (dragIndex !== null) move(dragIndex, toIndex);
    setDragIndex(null);
    setDragOver(null);
  };

  const save = async () => {
    setPending(true);
    try {
      const result = await saveCalculatorWorkspaceAction({
        calculatorId: calculator.id,
        basePrice: Number(basePrice) || 0,
        deletedIds,
        questions: questions.map((question) => ({
          clientId: question.clientId,
          savedId: question.savedId,
          label: question.label,
          questionType: question.questionType,
          isRequired: question.isRequired,
          options: question.options.map((option) => ({ label: option.label, price: Number(option.price) || 0 })),
          unitPrice: Number(question.unitPrice) || 0,
          addonPrice: Number(question.addonPrice) || 0,
          visibility: question.visibility
        }))
      });

      if (result.ok) {
        setQuestions(result.questions.map(fromEditorQuestion));
        setBasePrice(result.basePrice ? String(result.basePrice) : "");
        setDeletedIds([]);
        setDirty(false);
        setJustSaved(true);
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="sticky top-4 z-20 flex items-center justify-between gap-3 rounded-lg border border-[#dbe5f4] bg-white/90 px-4 py-2.5 shadow-crisp backdrop-blur">
        <div className="text-sm">
          {dirty ? (
            <span className="font-semibold text-amber-700">Unsaved changes</span>
          ) : justSaved ? (
            <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
              <Check className="h-4 w-4" /> All changes saved
            </span>
          ) : (
            <span className="text-coal/55">The preview on the right updates as you build.</span>
          )}
        </div>
        <button
          type="button"
          onClick={save}
          disabled={!dirty || pending}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-crisp transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
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
                onChange={(event) => updateBasePrice(event.target.value)}
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

        <aside className="xl:sticky xl:top-24 xl:self-start">
          <LiveQuotePreview
            basePrice={Number(basePrice) || 0}
            questions={questions}
            displayName={calculator.branding.displayName}
            brandColor={calculator.branding.primaryColor}
          />
        </aside>
      </div>
    </div>
  );
}
