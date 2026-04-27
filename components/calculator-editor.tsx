import { ArrowUpRight, EyeOff, Plus, Rocket, Save, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/badge";
import { BranchConditionFields } from "@/components/branch-condition-fields";
import { Button, ButtonLink } from "@/components/button";
import { CalculatorDangerActions } from "@/components/calculator-danger-actions";
import { CalculatorEmbedPanel } from "@/components/calculator-embed-panel";
import { EditorDeleteForm } from "@/components/editor-delete-form";
import { SubmitButton } from "@/components/submit-button";
import {
  addPricingRuleAction,
  addQuestionAction,
  updateCalculatorPublishStatusAction,
  updatePricingRuleAction,
  updateQuestionAction
} from "@/lib/actions";
import type { CalculatorEditor as CalculatorEditorData } from "@/lib/calculator-data";
import { formatDollars } from "@/lib/utils";

export function CalculatorEditor({ calculator }: { calculator: CalculatorEditorData }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

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
            {calculator.isPublished ? (
              <ButtonLink href={`/quote/${calculator.slug}`} variant="outline">
                Public quote <ArrowUpRight className="h-4 w-4" />
              </ButtonLink>
            ) : (
              <Button type="button" variant="outline" disabled title="Publish this calculator before viewing it">
                Publish to view quote
              </Button>
            )}
          </div>
          <form
            action={updateCalculatorPublishStatusAction}
            className="mt-5 flex flex-col gap-4 rounded-md border border-line bg-paper p-4 md:flex-row md:items-center md:justify-between"
          >
            <input type="hidden" name="calculatorId" value={calculator.id} />
            <input type="hidden" name="isPublished" value={calculator.isPublished ? "false" : "true"} />
            <div>
              <p className="text-sm font-bold text-ink">
                {calculator.isPublished ? "This calculator is live." : "This calculator is still a draft."}
              </p>
              <p className="mt-1 text-sm leading-6 text-coal/65">
                {calculator.isPublished
                  ? "Customers can use the public quote page and embedded widget."
                  : "Publish it when the questions and pricing rules are ready for customers."}
              </p>
            </div>
            <SubmitButton
              variant={calculator.isPublished ? "outline" : "secondary"}
              pendingLabel={calculator.isPublished ? "Unpublishing..." : "Publishing..."}
            >
              {calculator.isPublished ? <EyeOff className="h-4 w-4" /> : <Rocket className="h-4 w-4" />}
              {calculator.isPublished ? "Unpublish" : "Publish calculator"}
            </SubmitButton>
          </form>
        </div>

        <CalculatorEmbedPanel slug={calculator.slug} isPublished={calculator.isPublished} appUrl={appUrl} />

        <div className="rounded-lg border border-line bg-white p-5 shadow-crisp">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-ink">Questions</h2>
              <p className="mt-1 text-sm text-coal/70">Questions render on the public quote page in this order.</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {calculator.questions.length > 0 ? (
              calculator.questions.map((question) => (
                <div key={question.id} className="rounded-lg border border-line bg-paper p-4">
                  <form action={updateQuestionAction}>
                    <input type="hidden" name="calculatorId" value={calculator.id} />
                    <input type="hidden" name="questionId" value={question.id} />
                    <div className="grid gap-3 md:grid-cols-[1fr_140px_110px]">
                      <label className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-[0.12em] text-coal/50">Label</span>
                        <input
                          required
                          name="label"
                          defaultValue={question.label}
                          className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm font-semibold text-ink outline-none transition focus:border-teal-600"
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-[0.12em] text-coal/50">Type</span>
                        <select
                          name="questionType"
                          defaultValue={question.questionType}
                          className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-teal-600"
                        >
                          <option value="NUMBER">Number</option>
                          <option value="SELECT">Select</option>
                          <option value="BOOLEAN">Checkbox</option>
                          <option value="TEXT">Text</option>
                        </select>
                      </label>
                      <label className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-[0.12em] text-coal/50">Order</span>
                        <input
                          name="sortOrder"
                          type="number"
                          min={1}
                          defaultValue={question.sortOrder + 1}
                          className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-teal-600"
                        />
                      </label>
                      <label className="space-y-1 md:col-span-2">
                        <span className="text-xs font-bold uppercase tracking-[0.12em] text-coal/50">Options</span>
                        <input
                          name="options"
                          defaultValue={question.options.join(", ")}
                          placeholder="Only used for select questions"
                          className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-teal-600"
                        />
                      </label>
                      <label className="flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2">
                        <input
                          name="isRequired"
                          type="checkbox"
                          defaultChecked={question.isRequired}
                          className="h-4 w-4 accent-teal-700"
                        />
                        <span className="text-sm font-semibold text-coal">Required</span>
                      </label>
                    </div>
                    <BranchConditionFields
                      questions={calculator.questions}
                      currentQuestionId={question.id}
                      condition={question.visibilityCondition}
                    />
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <SubmitButton variant="outline" size="sm" pendingLabel="Saving...">
                        <Save className="h-4 w-4" /> Save question
                      </SubmitButton>
                      <span className="text-xs text-coal/55">Changes update the public quote form after save.</span>
                    </div>
                  </form>
                  <div className="mt-3 border-t border-line pt-3">
                    <EditorDeleteForm
                      kind="question"
                      calculatorId={calculator.id}
                      itemId={question.id}
                      label={question.label}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-line bg-paper px-4 py-8 text-center text-sm text-coal/70">
                No questions yet.
              </div>
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
            <div className="md:col-span-2">
              <BranchConditionFields questions={calculator.questions} />
            </div>
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
            {calculator.rules.length > 0 ? (
              calculator.rules.map((rule, index) => (
                <div
                  key={rule.id ?? `${rule.ruleType}-${rule.amount}`}
                  className="rounded-md border border-white/[0.12] bg-white/[0.08] p-3"
                >
                  <form action={updatePricingRuleAction}>
                    <input type="hidden" name="calculatorId" value={calculator.id} />
                    <input type="hidden" name="ruleId" value={rule.id} />
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{rule.label}</p>
                        <p className="mt-1 text-xs text-white/60">{rule.configLabel}</p>
                      </div>
                      <span className="text-sm font-bold">{formatDollars(rule.amount)}</span>
                    </div>
                    <div className="mt-4 grid gap-3">
                      <label className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">Rule type</span>
                        <select
                          name="ruleType"
                          defaultValue={rule.ruleType}
                          className="h-10 w-full rounded-md border border-white/10 bg-ink px-3 text-sm text-white outline-none transition focus:border-teal-300"
                        >
                          <option value="base_price">Base price</option>
                          <option value="quantity_multiplier">Quantity multiplier</option>
                          <option value="option_price">Option price</option>
                          <option value="checkbox_addon">Checkbox add-on</option>
                        </select>
                      </label>
                      <label className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">Question</span>
                        <select
                          name="questionId"
                          defaultValue={rule.questionId ?? ""}
                          className="h-10 w-full rounded-md border border-white/10 bg-ink px-3 text-sm text-white outline-none transition focus:border-teal-300"
                        >
                          <option value="">No question</option>
                          {calculator.questions.map((question) => (
                            <option key={question.id} value={question.id}>
                              {question.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div className="grid gap-3 sm:grid-cols-[1fr_120px_86px]">
                        <label className="space-y-1">
                          <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">Option</span>
                          <input
                            name="option"
                            defaultValue={rule.option}
                            placeholder="For option_price"
                            className="h-10 w-full rounded-md border border-white/10 bg-ink px-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-teal-300"
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">Amount</span>
                          <input
                            required
                            name="amount"
                            type="number"
                            min={0}
                            step="0.01"
                            defaultValue={rule.amount}
                            className="h-10 w-full rounded-md border border-white/10 bg-ink px-3 text-sm text-white outline-none transition focus:border-teal-300"
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">Order</span>
                          <input
                            name="sortOrder"
                            type="number"
                            min={1}
                            defaultValue={index + 1}
                            className="h-10 w-full rounded-md border border-white/10 bg-ink px-3 text-sm text-white outline-none transition focus:border-teal-300"
                          />
                        </label>
                      </div>
                    </div>
                    <div className="mt-3">
                      <SubmitButton
                        variant="outline"
                        size="sm"
                        className="border-white/15 bg-white/10 text-white hover:bg-white hover:text-ink"
                        pendingLabel="Saving..."
                      >
                        <Save className="h-4 w-4" /> Save rule
                      </SubmitButton>
                    </div>
                  </form>
                  {rule.id ? (
                    <div className="mt-3 border-t border-white/10 pt-3">
                      <EditorDeleteForm
                        kind="pricingRule"
                        calculatorId={calculator.id}
                        itemId={rule.id}
                        label={`${rule.label} ${formatDollars(rule.amount)}`}
                      />
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-md border border-white/[0.12] bg-white/[0.08] p-4 text-sm text-white/60">
                No pricing rules yet.
              </div>
            )}
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

        <CalculatorDangerActions calculatorId={calculator.id} calculatorName={calculator.name} />
      </aside>
    </div>
  );
}
