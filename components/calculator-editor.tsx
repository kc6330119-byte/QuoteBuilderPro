import { ArrowUpRight, Plus, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/badge";
import { ButtonLink } from "@/components/button";
import { SubmitButton } from "@/components/submit-button";
import { addPricingRuleAction, addQuestionAction } from "@/lib/actions";
import type { CalculatorEditor as CalculatorEditorData } from "@/lib/calculator-data";
import { formatDollars } from "@/lib/utils";

export function CalculatorEditor({ calculator }: { calculator: CalculatorEditorData }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <section className="space-y-6">
        <div className="rounded-lg border border-line bg-white p-5 shadow-crisp">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-2xl font-bold text-ink">{calculator.name}</h2>
                <Badge tone={calculator.isPublished ? "success" : "warning"}>
                  {calculator.isPublished ? "PUBLISHED" : "DRAFT"}
                </Badge>
              </div>
              <p className="mt-2 text-sm leading-6 text-coal/70">{calculator.description || "No description yet."}</p>
            </div>
            <ButtonLink href={`/quote/${calculator.slug}`} variant="outline">
              Public quote <ArrowUpRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>

        <div className="rounded-lg border border-line bg-white p-5 shadow-crisp">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-ink">Questions</h2>
              <p className="mt-1 text-sm text-coal/70">Questions render on the public quote page in this order.</p>
            </div>
          </div>
          <div className="mt-5 divide-y divide-line overflow-hidden rounded-lg border border-line">
            {calculator.questions.length > 0 ? (
              calculator.questions.map((question) => (
                <div key={question.id} className="grid gap-3 bg-paper px-4 py-4 md:grid-cols-[1fr_120px_1fr_90px] md:items-center">
                  <div>
                    <p className="font-semibold text-ink">{question.label}</p>
                    {question.options.length > 0 ? (
                      <p className="mt-1 text-xs text-coal/60">Options: {question.options.join(", ")}</p>
                    ) : null}
                  </div>
                  <Badge>{question.questionType}</Badge>
                  <p className="text-sm text-coal/70">Sort order {question.sortOrder + 1}</p>
                  <p className="text-sm font-semibold text-coal/70">{question.isRequired ? "Required" : "Optional"}</p>
                </div>
              ))
            ) : (
              <div className="bg-paper px-4 py-8 text-center text-sm text-coal/70">No questions yet.</div>
            )}
          </div>
        </div>

        <form action={addQuestionAction} className="rounded-lg border border-line bg-white p-5 shadow-crisp">
          <input type="hidden" name="calculatorId" value={calculator.id} />
          <h2 className="font-display text-xl font-bold text-ink">Add question</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-coal">Question label</span>
              <input
                required
                name="label"
                placeholder="How many locations need service?"
                className="h-11 w-full rounded-md border border-line bg-paper px-3 text-sm outline-none transition focus:border-teal-600 focus:bg-white"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-coal">Type</span>
              <select
                name="questionType"
                className="h-11 w-full rounded-md border border-line bg-paper px-3 text-sm outline-none transition focus:border-teal-600 focus:bg-white"
              >
                <option value="NUMBER">Number</option>
                <option value="SELECT">Select</option>
                <option value="BOOLEAN">Checkbox</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-coal">Options for select</span>
              <input
                name="options"
                placeholder="Basic, Standard, Premium"
                className="h-11 w-full rounded-md border border-line bg-paper px-3 text-sm outline-none transition focus:border-teal-600 focus:bg-white"
              />
            </label>
            <label className="flex items-center gap-2 rounded-md border border-line bg-paper px-3 py-3">
              <input name="isRequired" type="checkbox" className="h-4 w-4 accent-teal-700" />
              <span className="text-sm font-semibold text-coal">Required</span>
            </label>
          </div>
          <SubmitButton className="mt-5" variant="secondary" pendingLabel="Adding question...">
            <Plus className="h-4 w-4" /> Add question
          </SubmitButton>
        </form>
      </section>

      <aside className="space-y-6">
        <div className="rounded-lg border border-line bg-ink p-5 text-white shadow-soft">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="h-5 w-5 text-teal-100" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-100">Pricing rules</p>
              <h2 className="font-display text-xl font-bold">Calculation engine</h2>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {calculator.rules.map((rule) => (
              <div key={rule.id ?? `${rule.ruleType}-${rule.amount}`} className="rounded-md border border-white/[0.12] bg-white/[0.08] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{rule.label}</p>
                    <p className="mt-1 text-xs text-white/60">{rule.configLabel}</p>
                  </div>
                  <span className="text-sm font-bold">{formatDollars(rule.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form action={addPricingRuleAction} className="rounded-lg border border-line bg-white p-5 shadow-crisp">
          <input type="hidden" name="calculatorId" value={calculator.id} />
          <h2 className="font-display text-xl font-bold text-ink">Add pricing rule</h2>
          <div className="mt-5 space-y-4">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-coal">Rule type</span>
              <select
                name="ruleType"
                className="h-11 w-full rounded-md border border-line bg-paper px-3 text-sm outline-none transition focus:border-teal-600 focus:bg-white"
              >
                <option value="base_price">Base price</option>
                <option value="quantity_multiplier">Quantity multiplier</option>
                <option value="option_price">Option price</option>
                <option value="checkbox_addon">Checkbox add-on</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-coal">Question</span>
              <select
                name="questionId"
                className="h-11 w-full rounded-md border border-line bg-paper px-3 text-sm outline-none transition focus:border-teal-600 focus:bg-white"
              >
                <option value="">No question</option>
                {calculator.questions.map((question) => (
                  <option key={question.id} value={question.id}>
                    {question.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-coal">Selected option</span>
              <input
                name="option"
                placeholder="Only for option_price rules"
                className="h-11 w-full rounded-md border border-line bg-paper px-3 text-sm outline-none transition focus:border-teal-600 focus:bg-white"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-coal">Amount</span>
              <input
                required
                name="amount"
                type="number"
                min={0}
                step="0.01"
                placeholder="250"
                className="h-11 w-full rounded-md border border-line bg-paper px-3 text-sm outline-none transition focus:border-teal-600 focus:bg-white"
              />
            </label>
          </div>
          <SubmitButton className="mt-5 w-full" variant="secondary" pendingLabel="Adding rule...">
            <Plus className="h-4 w-4" /> Add pricing rule
          </SubmitButton>
        </form>
      </aside>
    </div>
  );
}
