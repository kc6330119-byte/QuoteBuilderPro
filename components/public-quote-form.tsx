"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { SubmitButton } from "@/components/submit-button";
import { createQuoteSubmissionAction } from "@/lib/actions";
import type { QuoteCalculator } from "@/lib/calculator-data";
import { estimateDisclaimer } from "@/lib/legal-content";
import { calculateQuote, getVisibleQuestions } from "@/lib/quote-engine";
import { formatDollars } from "@/lib/utils";

type Answers = Record<string, number | string | boolean>;

export function PublicQuoteForm({
  calculator,
  submitted = false,
  variant = "page",
  legalRequired = false,
  allowSubmission = true,
  returnTo
}: {
  calculator: QuoteCalculator;
  submitted?: boolean;
  variant?: "page" | "embed";
  legalRequired?: boolean;
  allowSubmission?: boolean;
  returnTo?: string;
}) {
  const [answers, setAnswers] = useState<Answers>(() =>
    Object.fromEntries(
      calculator.questions.map((question) => {
        if (question.questionType === "NUMBER") return [question.id, 1];
        if (question.questionType === "BOOLEAN") return [question.id, false];
        if (question.questionType === "SELECT") return [question.id, question.options[0] ?? ""];
        return [question.id, ""];
      })
    )
  );
  const [mockSubmitted, setMockSubmitted] = useState(false);

  const visibleQuestions = useMemo(() => getVisibleQuestions(calculator.questions, answers), [answers, calculator.questions]);
  const total = useMemo(() => calculateQuote(calculator.questions, calculator.rules, answers), [answers, calculator]);
  const submitReturnPath = returnTo ?? (variant === "embed" ? `/embed/${calculator.slug}` : `/quote/${calculator.slug}`);

  if (submitted || mockSubmitted) {
    return (
      <div className="rounded-lg border border-teal-100 bg-teal-50 p-6">
        <CheckCircle2 className="h-10 w-10 text-teal-700" />
        <h2 className="mt-4 font-display text-2xl font-bold text-ink">Quote request received</h2>
        <p className="mt-2 text-sm leading-6 text-coal/70">
          {variant === "embed"
            ? "Your estimate was submitted. The business will follow up with you soon."
            : "Your estimate was submitted. The lead is now available in the dashboard leads view."}
        </p>
        <p className="mt-4 text-sm font-semibold text-teal-700">Estimated Price: {formatDollars(total)}</p>
        <p className="mt-3 text-xs leading-5 text-coal/60">{estimateDisclaimer}</p>
      </div>
    );
  }

  return (
    <form
      action={calculator.source === "database" && allowSubmission ? createQuoteSubmissionAction : undefined}
      className={variant === "embed" ? "grid gap-5 lg:grid-cols-[1fr_300px]" : "grid gap-6 lg:grid-cols-[1fr_340px]"}
      onSubmit={(event) => {
        if (!allowSubmission) {
          event.preventDefault();
          return;
        }

        if (calculator.source === "mock") {
          event.preventDefault();
          setMockSubmitted(true);
        }
      }}
    >
      <input type="hidden" name="calculatorId" value={calculator.id} />
      <input type="hidden" name="calculatorSlug" value={calculator.slug} />
      <input type="hidden" name="returnTo" value={submitReturnPath} />
      <section className="space-y-5">
        {!allowSubmission ? (
          <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold leading-6 text-sky-900">
            Preview mode is only visible to signed-in workspace members. Publish this calculator before sharing the public
            quote page or embed code with customers.
          </div>
        ) : null}
        {legalRequired ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-900">
            Please acknowledge the non-binding estimate disclaimer and legal terms before submitting your quote request.
          </div>
        ) : null}
        {visibleQuestions.length < calculator.questions.length ? (
          <div className="rounded-lg border border-teal-100 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
            Showing the next questions based on your selections.
          </div>
        ) : null}
        {visibleQuestions.map((question) => (
          <div key={question.id} className={variant === "embed" ? "rounded-lg border border-line bg-white p-4" : "rounded-lg border border-line bg-white p-5 shadow-crisp"}>
            <label className="block text-sm font-bold text-ink" htmlFor={question.id}>
              {question.label}
              {question.isRequired ? <span className="ml-1 text-coral">*</span> : null}
            </label>
            {question.questionType === "NUMBER" ? (
              <input
                id={question.id}
                name={`answer_${question.id}`}
                type="number"
                min={0}
                value={Number(answers[question.id])}
                onChange={(event) =>
                  setAnswers((current) => ({ ...current, [question.id]: Number(event.target.value) }))
                }
                required={question.isRequired}
                className="mt-3 h-12 w-full rounded-md border border-line bg-paper px-3 text-sm outline-none transition focus:border-teal-600 focus:bg-white"
              />
            ) : null}
            {question.questionType === "SELECT" ? (
              <select
                id={question.id}
                name={`answer_${question.id}`}
                value={String(answers[question.id])}
                onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))}
                required={question.isRequired}
                className="mt-3 h-12 w-full rounded-md border border-line bg-paper px-3 text-sm outline-none transition focus:border-teal-600 focus:bg-white"
              >
                {question.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : null}
            {question.questionType === "BOOLEAN" ? (
              <label className="mt-3 flex items-center justify-between gap-3 rounded-md border border-line bg-paper px-3 py-3">
                <span className="text-sm text-coal/70">Add this option</span>
                <input
                  type="checkbox"
                  name={`answer_${question.id}`}
                  value="true"
                  checked={Boolean(answers[question.id])}
                  onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.checked }))}
                  className="h-5 w-5 accent-teal-700"
                />
              </label>
            ) : null}
            {question.questionType === "TEXT" ? (
              <textarea
                id={question.id}
                name={`answer_${question.id}`}
                rows={3}
                value={String(answers[question.id])}
                onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))}
                required={question.isRequired}
                className="mt-3 w-full rounded-md border border-line bg-paper px-3 py-3 text-sm outline-none transition focus:border-teal-600 focus:bg-white"
              />
            ) : null}
          </div>
        ))}
        <div className={variant === "embed" ? "rounded-lg border border-line bg-white p-4" : "rounded-lg border border-line bg-white p-5 shadow-crisp"}>
          <h2 className="font-display text-xl font-bold text-ink">Your contact details</h2>
          <p className="mt-1 text-sm text-coal/70">Required fields are validated before the quote request is saved.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <input
              required
              name="customerName"
              placeholder="Name"
              className="h-12 rounded-md border border-line bg-paper px-3 text-sm outline-none focus:border-teal-600 focus:bg-white"
            />
            <input
              required
              name="customerEmail"
              type="email"
              placeholder="Email"
              className="h-12 rounded-md border border-line bg-paper px-3 text-sm outline-none focus:border-teal-600 focus:bg-white"
            />
            <input
              name="customerPhone"
              placeholder="Phone"
              className="h-12 rounded-md border border-line bg-paper px-3 text-sm outline-none focus:border-teal-600 focus:bg-white"
            />
            <textarea
              name="customerNotes"
              placeholder="Project notes"
              rows={4}
              className="rounded-md border border-line bg-paper px-3 py-3 text-sm outline-none focus:border-teal-600 focus:bg-white md:col-span-2"
            />
          </div>
          <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-900">Non-binding estimate</p>
            <p className="mt-2 text-xs leading-5 text-amber-900/85">{estimateDisclaimer}</p>
            <label className="mt-3 flex items-start gap-3 text-xs font-semibold leading-5 text-amber-950">
              <input
                required
                name="acceptedLegalAcknowledgement"
                type="checkbox"
                className="mt-1 h-4 w-4 shrink-0 accent-teal-700"
              />
              <span>
                I understand this is a non-binding estimate and agree to the{" "}
                <a href="/terms" target="_blank" rel="noreferrer" className="underline underline-offset-2">
                  Terms
                </a>{" "}
                and{" "}
                <a href="/privacy" target="_blank" rel="noreferrer" className="underline underline-offset-2">
                  Privacy Policy
                </a>
                .
              </span>
            </label>
          </div>
        </div>
      </section>
      <aside>
        <div className={variant === "embed" ? "rounded-lg border border-line bg-ink p-4 text-white" : "sticky top-6 rounded-lg border border-line bg-ink p-5 text-white shadow-soft"}>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-100">Estimated Price</p>
          <p className={variant === "embed" ? "mt-3 font-display text-3xl font-bold" : "mt-3 font-display text-4xl font-bold"}>{formatDollars(total)}</p>
          <p className="mt-3 text-sm leading-6 text-white/70">
            This updates in real time as customers answer the quote questions.
          </p>
          <SubmitButton
            variant="secondary"
            className="mt-5 w-full"
            pendingLabel="Submitting quote..."
            disabled={!allowSubmission}
          >
            {allowSubmission ? (
              <>
                Submit quote request <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              "Preview only"
            )}
          </SubmitButton>
        </div>
      </aside>
    </form>
  );
}
