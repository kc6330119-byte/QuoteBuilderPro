"use client";

import { type CSSProperties, useMemo, useState } from "react";
import {
  calculateQuote,
  getVisibleQuestions,
  type EnginePricingRule,
  type EngineQuestion,
  type QuoteAnswers,
  type VisibilityCondition
} from "@/lib/quote-engine";
import { formatDollars } from "@/lib/utils";
import type { WorkspaceQuestion } from "@/components/calculator-workspace";

const CHECKED_VALUES = ["true", "checked", "yes", "on"];

function toCondition(visibility: WorkspaceQuestion["visibility"]): VisibilityCondition | null {
  if (!visibility) return null;
  const value = visibility.value?.trim() ?? "";
  if (!value) return null;
  if (CHECKED_VALUES.includes(value.toLowerCase())) {
    return { questionId: visibility.questionClientId, operator: "checked", value: true };
  }
  return { questionId: visibility.questionClientId, operator: "equals", value };
}

// Build the same engine inputs the public quote page uses, so the preview total always matches reality.
function toEngine(questions: WorkspaceQuestion[], basePrice: number) {
  const engineQuestions: EngineQuestion[] = questions.map((question) => ({
    id: question.clientId,
    label: question.label || "Untitled question",
    questionType: question.questionType,
    options: question.options.map((option) => option.label.trim()).filter(Boolean),
    isRequired: question.isRequired,
    visibilityCondition: toCondition(question.visibility)
  }));

  const rules: EnginePricingRule[] = [{ ruleType: "base_price", amount: basePrice }];
  for (const question of questions) {
    if (question.questionType === "SELECT") {
      for (const option of question.options) {
        const label = option.label.trim();
        const price = Number(option.price) || 0;
        if (label && price > 0) {
          rules.push({ questionId: question.clientId, ruleType: "option_price", ruleConfig: { option: label }, amount: price });
        }
      }
    } else if (question.questionType === "NUMBER") {
      const price = Number(question.unitPrice) || 0;
      if (price > 0) rules.push({ questionId: question.clientId, ruleType: "quantity_multiplier", amount: price });
    } else if (question.questionType === "BOOLEAN") {
      const price = Number(question.addonPrice) || 0;
      if (price > 0) rules.push({ questionId: question.clientId, ruleType: "checkbox_addon", amount: price });
    }
  }

  return { engineQuestions, rules };
}

export function LiveQuotePreview({
  basePrice,
  questions,
  displayName,
  brandColor
}: {
  basePrice: number;
  questions: WorkspaceQuestion[];
  displayName: string;
  brandColor: string;
}) {
  const [answers, setAnswers] = useState<QuoteAnswers>({});
  const { engineQuestions, rules } = useMemo(() => toEngine(questions, basePrice), [questions, basePrice]);

  const effectiveAnswers = useMemo<QuoteAnswers>(() => {
    const next: QuoteAnswers = { ...answers };
    for (const question of engineQuestions) {
      if (question.id in next) continue;
      if (question.questionType === "SELECT") next[question.id] = question.options?.[0] ?? "";
      else if (question.questionType === "NUMBER") next[question.id] = 0;
      else if (question.questionType === "BOOLEAN") next[question.id] = false;
      else next[question.id] = "";
    }
    return next;
  }, [answers, engineQuestions]);

  const visible = useMemo(() => getVisibleQuestions(engineQuestions, effectiveAnswers), [engineQuestions, effectiveAnswers]);
  const total = useMemo(() => calculateQuote(engineQuestions, rules, effectiveAnswers), [engineQuestions, rules, effectiveAnswers]);

  const questionByClientId = useMemo(() => new Map(questions.map((question) => [question.clientId, question])), [questions]);
  const breakdown = useMemo(() => {
    const lines: { label: string; amount: number }[] = [{ label: "Starting price", amount: basePrice }];
    for (const engineQuestion of visible) {
      const question = questionByClientId.get(engineQuestion.id);
      if (!question) continue;
      const answer = effectiveAnswers[engineQuestion.id];
      if (question.questionType === "SELECT") {
        const option = question.options.find((candidate) => candidate.label.trim() === String(answer));
        const price = option ? Number(option.price) || 0 : 0;
        if (price > 0) lines.push({ label: `${question.label || "Question"}: ${answer}`, amount: price });
      } else if (question.questionType === "NUMBER") {
        const price = Number(question.unitPrice) || 0;
        const quantity = Number(answer) || 0;
        if (price > 0 && quantity > 0) {
          lines.push({ label: `${question.label || "Question"}: ${quantity} × ${formatDollars(price)}`, amount: price * quantity });
        }
      } else if (question.questionType === "BOOLEAN") {
        const price = Number(question.addonPrice) || 0;
        if (answer && price > 0) lines.push({ label: question.label || "Add-on", amount: price });
      }
    }
    return lines;
  }, [visible, questionByClientId, effectiveAnswers, basePrice]);

  const setAnswer = (id: string, value: QuoteAnswers[string]) => setAnswers((current) => ({ ...current, [id]: value }));
  const totalStyle = { background: `linear-gradient(150deg, ${brandColor}, #0f1f3d 78%)` } as CSSProperties;

  return (
    <div className="overflow-hidden rounded-lg border border-[#dbe5f4] bg-white shadow-soft">
      <div className="flex items-center justify-between gap-2 border-b border-[#dbe5f4] bg-[#f8fbff] px-4 py-3">
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-emerald-700">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Live preview
        </span>
        <span className="text-xs text-coal/50">What your customer sees</span>
      </div>

      <div className="px-4 pb-4 pt-3">
        <p className="font-display text-sm font-bold text-ink">{displayName || "Your business"}</p>
        <p className="text-xs text-coal/55">Instant estimate</p>

        <div className="mt-3 space-y-3">
          {visible.length === 0 ? (
            <p className="rounded-md border border-dashed border-[#dbe5f4] bg-[#f8fbff] px-3 py-4 text-center text-xs text-coal/60">
              Add a question to see the customer&apos;s form.
            </p>
          ) : null}
          {visible.map((engineQuestion) => {
            const question = questionByClientId.get(engineQuestion.id);
            if (!question) return null;
            const answer = effectiveAnswers[engineQuestion.id];
            return (
              <div key={engineQuestion.id}>
                {question.questionType === "BOOLEAN" ? (
                  <label className="flex items-center justify-between gap-3 rounded-md border border-[#dbe5f4] bg-[#f8fbff] px-3 py-2.5">
                    <span className="text-sm font-medium text-ink">{question.label || "Untitled question"}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(answer)}
                      onChange={(event) => setAnswer(engineQuestion.id, event.target.checked)}
                      className="h-5 w-5 accent-blue-600"
                    />
                  </label>
                ) : (
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-coal/80">
                      {question.label || "Untitled question"}
                      {question.isRequired ? <span className="ml-0.5 text-coral">*</span> : null}
                    </span>
                    {question.questionType === "SELECT" ? (
                      <select
                        value={String(answer ?? "")}
                        onChange={(event) => setAnswer(engineQuestion.id, event.target.value)}
                        className="h-10 w-full rounded-md border border-[#dbe5f4] bg-[#f8fbff] px-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                      >
                        {engineQuestion.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : question.questionType === "NUMBER" ? (
                      <input
                        type="number"
                        min={0}
                        value={Number(answer) || 0}
                        onChange={(event) => setAnswer(engineQuestion.id, event.target.value)}
                        className="h-10 w-full rounded-md border border-[#dbe5f4] bg-[#f8fbff] px-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                      />
                    ) : (
                      <input
                        value={String(answer ?? "")}
                        onChange={(event) => setAnswer(engineQuestion.id, event.target.value)}
                        placeholder="Customer types here…"
                        className="h-10 w-full rounded-md border border-[#dbe5f4] bg-[#f8fbff] px-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                      />
                    )}
                  </label>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-xl p-4 text-white shadow-soft" style={totalStyle}>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">Estimated price</p>
          <p className="mt-1 font-display text-3xl font-black tabular-nums">{formatDollars(total)}</p>
          <div className="mt-3 space-y-1.5 border-t border-white/15 pt-3">
            {breakdown.map((line, index) => (
              <div key={`${line.label}-${index}`} className="flex items-center justify-between gap-3 text-xs">
                <span className="truncate text-white/75">{line.label}</span>
                <span className="shrink-0 font-mono font-semibold text-white/90">{formatDollars(line.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
