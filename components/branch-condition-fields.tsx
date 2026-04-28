"use client";

import { useMemo, useState } from "react";
import type { QuoteQuestion } from "@/lib/calculator-data";
import type { VisibilityCondition } from "@/lib/quote-engine";

type BranchQuestion = Pick<QuoteQuestion, "id" | "label" | "questionType" | "options">;

export function BranchConditionFields({
  questions,
  currentQuestionId,
  condition
}: {
  questions: BranchQuestion[];
  currentQuestionId?: string;
  condition?: VisibilityCondition | null;
}) {
  const candidateQuestions = useMemo(
    () => questions.filter((question) => question.id !== currentQuestionId),
    [currentQuestionId, questions]
  );
  const [parentQuestionId, setParentQuestionId] = useState(condition?.questionId ?? "");
  const [answerValue, setAnswerValue] = useState(getInitialAnswerValue(condition));
  const parentQuestion = candidateQuestions.find((question) => question.id === parentQuestionId);
  const hasInvalidSelectValue =
    parentQuestion?.questionType === "SELECT" &&
    answerValue.length > 0 &&
    !parentQuestion.options.includes(answerValue);

  function handleParentChange(nextParentQuestionId: string) {
    const nextParentQuestion = candidateQuestions.find((question) => question.id === nextParentQuestionId);
    setParentQuestionId(nextParentQuestionId);
    setAnswerValue(getDefaultAnswerValue(nextParentQuestion));
  }

  return (
    <div className="mt-4 rounded-md border border-dashed border-line bg-white p-3">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">Show/hide logic</p>
      <p className="mt-1 text-xs leading-5 text-coal/60">{getBranchSummary(parentQuestion, answerValue)}</p>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-coal/50">Only ask this when</span>
          <select
            name="visibilityQuestionId"
            value={parentQuestionId}
            onChange={(event) => handleParentChange(event.target.value)}
            className="h-10 w-full rounded-md border border-line bg-paper px-3 text-sm outline-none transition focus:border-teal-600 focus:bg-white"
          >
            <option value="">Always show</option>
            {candidateQuestions.map((question) => (
              <option key={question.id} value={question.id}>
                {question.label}
              </option>
            ))}
          </select>
        </label>
        {renderAnswerField(parentQuestion, answerValue, setAnswerValue, hasInvalidSelectValue)}
      </div>
      {hasInvalidSelectValue ? (
        <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold leading-5 text-amber-800">
          The saved answer does not match the parent question&apos;s current options. Choose one of the listed answers before saving.
        </p>
      ) : null}
    </div>
  );
}

function renderAnswerField(
  parentQuestion: BranchQuestion | undefined,
  answerValue: string,
  setAnswerValue: (value: string) => void,
  hasInvalidSelectValue: boolean
) {
  if (!parentQuestion) {
    return (
      <label className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-coal/50">Answer</span>
        <select
          name="visibilityValue"
          value=""
          disabled
          className="h-10 w-full rounded-md border border-line bg-paper px-3 text-sm text-coal/45 outline-none"
        >
          <option value="">No branch condition</option>
        </select>
      </label>
    );
  }

  if (parentQuestion.questionType === "SELECT") {
    return (
      <label className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-coal/50">Selected answer</span>
        <select
          required
          name="visibilityValue"
          value={answerValue}
          onChange={(event) => setAnswerValue(event.target.value)}
          className="h-10 w-full rounded-md border border-line bg-paper px-3 text-sm outline-none transition focus:border-teal-600 focus:bg-white"
        >
          <option value="">Choose an answer</option>
          {parentQuestion.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
          {hasInvalidSelectValue ? <option value={answerValue}>Saved value: {answerValue}</option> : null}
        </select>
      </label>
    );
  }

  if (parentQuestion.questionType === "BOOLEAN") {
    return (
      <label className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-coal/50">Checkbox state</span>
        <select
          required
          name="visibilityValue"
          value={answerValue || "true"}
          onChange={(event) => setAnswerValue(event.target.value)}
          className="h-10 w-full rounded-md border border-line bg-paper px-3 text-sm outline-none transition focus:border-teal-600 focus:bg-white"
        >
          <option value="true">Checked / Yes</option>
          <option value="false">Not checked / No</option>
        </select>
      </label>
    );
  }

  return (
    <label className="space-y-1">
      <span className="text-xs font-bold uppercase tracking-[0.12em] text-coal/50">Exact answer value</span>
      <input
        required
        name="visibilityValue"
        value={answerValue}
        onChange={(event) => setAnswerValue(event.target.value)}
        placeholder={parentQuestion.questionType === "NUMBER" ? "Example: 3" : "Enter exact text"}
        className="h-10 w-full rounded-md border border-line bg-paper px-3 text-sm outline-none transition focus:border-teal-600 focus:bg-white"
      />
    </label>
  );
}

function getInitialAnswerValue(condition?: VisibilityCondition | null) {
  if (!condition) {
    return "";
  }

  return condition.operator === "checked" ? "true" : String(condition.value ?? "");
}

function getDefaultAnswerValue(parentQuestion?: BranchQuestion) {
  if (!parentQuestion) {
    return "";
  }

  if (parentQuestion.questionType === "SELECT") {
    return parentQuestion.options[0] ?? "";
  }

  if (parentQuestion.questionType === "BOOLEAN") {
    return "true";
  }

  return "";
}

function getBranchSummary(parentQuestion: BranchQuestion | undefined, answerValue: string) {
  if (!parentQuestion) {
    return "Always ask this question. Choose another question here only when this should be a follow-up.";
  }

  if (parentQuestion.questionType === "BOOLEAN") {
    return `Only ask this when "${parentQuestion.label}" is ${answerValue === "false" ? "not checked" : "checked"}.`;
  }

  if (!answerValue) {
    return `Choose the answer to "${parentQuestion.label}" that should trigger this follow-up.`;
  }

  return `Only ask this when "${parentQuestion.label}" equals "${answerValue}".`;
}
