import { ArrowUpRight, EyeOff, HelpCircle, Palette, Plus, Rocket, Save, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/badge";
import { BranchConditionFields } from "@/components/branch-condition-fields";
import { Button, ButtonLink } from "@/components/button";
import { CalculatorBuilderGuide } from "@/components/calculator-builder-guide";
import { CalculatorDangerActions } from "@/components/calculator-danger-actions";
import { CalculatorEmbedPanel } from "@/components/calculator-embed-panel";
import { EditorDeleteForm } from "@/components/editor-delete-form";
import { FieldHelp } from "@/components/field-help";
import { SubmitButton } from "@/components/submit-button";
import {
  addPricingRuleAction,
  addQuestionAction,
  updateCalculatorBrandingAction,
  updateCalculatorPublishStatusAction,
  updatePricingRuleAction,
  updateQuestionAction
} from "@/lib/actions";
import type { CalculatorEditor as CalculatorEditorData } from "@/lib/calculator-data";
import { buildPublicQuotePath } from "@/lib/public-calculator-paths";
import { formatDollars } from "@/lib/utils";

export function CalculatorEditor({ calculator }: { calculator: CalculatorEditorData }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <section className="space-y-6">
        <div className="rounded-lg border border-[#dbe5f4] bg-white p-5 shadow-crisp">
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
              <ButtonLink href={buildPublicQuotePath(calculator)} variant="outline">
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
            className="mt-5 flex flex-col gap-4 rounded-md border border-[#dbe5f4] bg-[#f8fbff] p-4 md:flex-row md:items-center md:justify-between"
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

        <CalculatorBuilderGuide calculator={calculator} />

        <form action={updateCalculatorBrandingAction} className="rounded-lg border border-[#dbe5f4] bg-white p-5 shadow-crisp">
          <input type="hidden" name="calculatorId" value={calculator.id} />
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-blue-700" />
                <h2 className="font-display text-xl font-bold text-ink">Customer branding</h2>
              </div>
              <p className="mt-1 text-sm leading-6 text-coal/70">
                Keep it simple: these details make the public quote page and embed feel like the customer&apos;s business.
              </p>
            </div>
            <div className="rounded-xl border border-[#dbe5f4] bg-[#f8fbff] p-3">
              <div className="flex items-center gap-3">
                {calculator.branding.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- Customer logo URLs are user-provided and cannot be preconfigured for next/image.
                  <img
                    src={calculator.branding.logoUrl}
                    alt={`${calculator.branding.displayName} logo`}
                    className="h-10 w-10 rounded-lg border border-[#dbe5f4] bg-white object-contain p-1"
                  />
                ) : (
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-xs font-black text-white"
                    style={{ backgroundColor: calculator.branding.primaryColor }}
                  >
                    {calculator.branding.displayName.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <div>
                  <p className="max-w-[220px] truncate text-sm font-bold text-ink">{calculator.branding.displayName}</p>
                  <p className="text-xs text-coal/55">Public preview</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-coal">
                Business display name
                <FieldHelp title="Business display name">
                  <p>This is the customer-facing name shown on the public quote page and embedded widget.</p>
                  <p>Use the contractor or service business name, not the internal calculator name.</p>
                </FieldHelp>
              </span>
              <input
                name="brandName"
                defaultValue={calculator.branding.displayName}
                placeholder="Collins Custom Homes"
                className="h-11 w-full rounded-md border border-[#dbe5f4] bg-[#f8fbff] px-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </label>
            <label className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-coal">
                Logo URL
                <FieldHelp title="Logo URL">
                  <p>Paste a direct link to a hosted logo image.</p>
                  <p>If this is blank, QuoteBuilder Pro shows initials instead.</p>
                </FieldHelp>
              </span>
              <input
                name="brandLogoUrl"
                defaultValue={calculator.branding.logoUrl ?? ""}
                placeholder="https://example.com/logo.png"
                className="h-11 w-full rounded-md border border-[#dbe5f4] bg-[#f8fbff] px-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </label>
            <label className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-coal">
                Primary color
                <FieldHelp title="Primary color">
                  <p>This color styles buttons, highlights, and the estimate card on the public quote form.</p>
                  <p>Pick a color close to the customer&apos;s brand for a simple white-label feel.</p>
                </FieldHelp>
              </span>
              <div className="flex gap-2">
                <input
                  name="brandColor"
                  type="color"
                  defaultValue={calculator.branding.primaryColor}
                  className="h-11 w-16 rounded-md border border-[#dbe5f4] bg-[#f8fbff] p-1"
                />
                <div className="flex flex-1 items-center rounded-md border border-[#dbe5f4] bg-[#f8fbff] px-3 text-sm font-semibold text-coal/70">
                  {calculator.branding.primaryColor}
                </div>
              </div>
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-coal">
                Intro message
                <FieldHelp title="Intro message">
                  <p>This appears above the customer questions.</p>
                  <p>Use it to set expectations, such as &quot;Answer a few questions to receive a ballpark estimate.&quot;</p>
                </FieldHelp>
              </span>
              <textarea
                name="brandIntro"
                rows={3}
                defaultValue={calculator.branding.introText}
                placeholder="Tell visitors what kind of estimate they are about to receive."
                className="w-full rounded-md border border-[#dbe5f4] bg-[#f8fbff] px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-coal">
                Optional footer note
                <FieldHelp title="Footer note">
                  <p>This appears below the quote form.</p>
                  <p>Good place for reminders like &quot;Final pricing depends on site conditions.&quot;</p>
                </FieldHelp>
              </span>
              <textarea
                name="brandFooter"
                rows={2}
                defaultValue={calculator.branding.footerText ?? ""}
                placeholder="Example: Final pricing depends on site conditions and an in-person review."
                className="w-full rounded-md border border-[#dbe5f4] bg-[#f8fbff] px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </label>
          </div>
          <SubmitButton className="mt-5" variant="secondary" pendingLabel="Saving branding...">
            <Save className="h-4 w-4" /> Save branding
          </SubmitButton>
        </form>

        <div className="rounded-lg border border-[#dbe5f4] bg-white p-5 shadow-crisp">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-ink">Questions</h2>
              <p className="mt-1 text-sm text-coal/70">
                Think of these as the customer interview. Start broad, then use show/hide logic for follow-up details.
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {calculator.questions.length > 0 ? (
              calculator.questions.map((question) => (
                <div key={question.id} className="rounded-lg border border-[#dbe5f4] bg-[#f8fbff] p-4">
                  <form action={updateQuestionAction}>
                    <input type="hidden" name="calculatorId" value={calculator.id} />
                    <input type="hidden" name="questionId" value={question.id} />
                    <div className="grid gap-3 md:grid-cols-[1fr_140px_110px]">
                      <label className="space-y-1">
                        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-coal/50">
                          Label
                          <FieldHelp title="Question label">
                            <p>This is the exact question the customer sees.</p>
                            <p>Use plain customer language, like &quot;What type of remodel do you need?&quot;</p>
                          </FieldHelp>
                        </span>
                        <input
                          required
                          name="label"
                          defaultValue={question.label}
                          className="h-10 w-full rounded-md border border-[#dbe5f4] bg-white px-3 text-sm font-semibold text-ink outline-none transition focus:border-blue-500"
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-coal/50">
                          Type
                          <FieldHelp title="Question type">
                            <p>Select is best for fixed choices like Kitchen, Bathroom, or Garage.</p>
                            <p>Number is best for quantities. Checkbox is best for yes/no add-ons.</p>
                          </FieldHelp>
                        </span>
                        <select
                          name="questionType"
                          defaultValue={question.questionType}
                          className="h-10 w-full rounded-md border border-[#dbe5f4] bg-white px-3 text-sm outline-none transition focus:border-blue-500"
                        >
                          <option value="NUMBER">Number</option>
                          <option value="SELECT">Select</option>
                          <option value="BOOLEAN">Checkbox</option>
                          <option value="TEXT">Text</option>
                        </select>
                      </label>
                      <label className="space-y-1">
                        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-coal/50">
                          Order
                          <FieldHelp title="Question order">
                            <p>Lower numbers appear earlier in the public quote form.</p>
                            <p>Put broad service questions first, then follow-up details later.</p>
                          </FieldHelp>
                        </span>
                        <input
                          name="sortOrder"
                          type="number"
                          min={1}
                          defaultValue={question.sortOrder + 1}
                          className="h-10 w-full rounded-md border border-[#dbe5f4] bg-white px-3 text-sm outline-none transition focus:border-blue-500"
                        />
                      </label>
                      <label className="space-y-1 md:col-span-2">
                        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-coal/50">
                          Options
                          <FieldHelp title="Select options">
                            <p>Only used when the question type is Select.</p>
                            <p>Separate choices with commas, like Kitchen, Bathroom, Room addition.</p>
                          </FieldHelp>
                        </span>
                        <input
                          name="options"
                          defaultValue={question.options.join(", ")}
                          placeholder="Only used for select questions"
                          className="h-10 w-full rounded-md border border-[#dbe5f4] bg-white px-3 text-sm outline-none transition focus:border-blue-500"
                        />
                      </label>
                      <label className="flex items-center gap-2 rounded-md border border-[#dbe5f4] bg-white px-3 py-2">
                        <input
                          name="isRequired"
                          type="checkbox"
                          defaultChecked={question.isRequired}
                          className="h-4 w-4 accent-blue-600"
                        />
                        <span className="text-sm font-semibold text-coal">Required</span>
                        <FieldHelp title="Required question">
                          <p>Required questions must be answered before a customer submits the quote request.</p>
                          <p>Use this for information needed to calculate a meaningful estimate.</p>
                        </FieldHelp>
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
                  <div className="mt-3 border-t border-[#dbe5f4] pt-3">
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
              <div className="rounded-lg border border-[#dbe5f4] bg-[#f8fbff] px-4 py-8 text-center text-sm text-coal/70">
                No questions yet.
              </div>
            )}
          </div>
        </div>

        <form action={addQuestionAction} className="rounded-lg border border-[#dbe5f4] bg-white p-5 shadow-crisp">
          <input type="hidden" name="calculatorId" value={calculator.id} />
          <h2 className="font-display text-xl font-bold text-ink">Add question</h2>
          <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-950/80">
            <p className="font-bold text-ink">Recommended pattern</p>
            <p className="mt-1">
              First ask the main service choice. Then add follow-up questions and set &quot;Only ask this when&quot; to the
              matching answer. Example: ask &quot;What project type?&quot; first, then show &quot;Kitchen remodel level&quot; only when
              Kitchen is selected.
            </p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-coal">
                Question label
                <FieldHelp title="Question label">
                  <p>Write the question exactly how a customer should read it.</p>
                  <p>Example: &quot;What type of kitchen remodel do you need?&quot;</p>
                </FieldHelp>
              </span>
              <input
                required
                name="label"
                placeholder="What service do you need?"
                className="h-11 w-full rounded-md border border-[#dbe5f4] bg-[#f8fbff] px-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </label>
            <label className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-coal">
                Type
                <FieldHelp title="Question type">
                  <p>Select is for a list of choices. Number is for quantities. Checkbox is for a yes/no add-on.</p>
                  <p>For most first questions, Select is the safest choice.</p>
                </FieldHelp>
              </span>
              <select
                name="questionType"
                className="h-11 w-full rounded-md border border-[#dbe5f4] bg-[#f8fbff] px-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              >
                <option value="NUMBER">Number</option>
                <option value="SELECT">Select</option>
                <option value="BOOLEAN">Checkbox</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-coal">
                Options for select
                <FieldHelp title="Select options">
                  <p>Only fill this in for Select questions.</p>
                  <p>Use commas between answers, like Kitchen, Bathroom, Garage.</p>
                </FieldHelp>
              </span>
              <input
                name="options"
                placeholder="Kitchen, Bathroom, Room addition"
                className="h-11 w-full rounded-md border border-[#dbe5f4] bg-[#f8fbff] px-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </label>
            <label className="flex items-center gap-2 rounded-md border border-[#dbe5f4] bg-[#f8fbff] px-3 py-3">
              <input name="isRequired" type="checkbox" className="h-4 w-4 accent-blue-600" />
              <span className="text-sm font-semibold text-coal">Required</span>
              <FieldHelp title="Required question">
                <p>Turn this on when the answer is needed for a useful estimate.</p>
                <p>Leave optional for nice-to-have details or follow-up notes.</p>
              </FieldHelp>
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
        <div className="rounded-lg border border-blue-900/20 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.34),transparent_44%),linear-gradient(135deg,#111827,#172554)] p-5 text-white shadow-soft">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="h-5 w-5 text-blue-100" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100">Pricing rules</p>
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
                        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                          Rule type
                          <FieldHelp title="Rule type" tone="dark">
                            <p>Base price starts every quote with the same amount.</p>
                            <p>Quantity, option, and checkbox rules change the estimate based on customer answers.</p>
                          </FieldHelp>
                        </span>
                        <select
                          name="ruleType"
                          defaultValue={rule.ruleType}
                          className="h-10 w-full rounded-md border border-white/10 bg-slate-950/40 px-3 text-sm text-white outline-none transition focus:border-blue-300"
                        >
                          <option value="base_price">Base price</option>
                          <option value="quantity_multiplier">Quantity multiplier</option>
                          <option value="option_price">Option price</option>
                          <option value="checkbox_addon">Checkbox add-on</option>
                        </select>
                      </label>
                      <label className="space-y-1">
                        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                          Question
                          <FieldHelp title="Rule question" tone="dark">
                            <p>Choose the question this pricing rule listens to.</p>
                            <p>Base price usually uses &quot;No question&quot; because it applies to every quote.</p>
                          </FieldHelp>
                        </span>
                        <select
                          name="questionId"
                          defaultValue={rule.questionId ?? ""}
                          className="h-10 w-full rounded-md border border-white/10 bg-slate-950/40 px-3 text-sm text-white outline-none transition focus:border-blue-300"
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
                          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                            Option
                            <FieldHelp title="Matching answer" tone="dark">
                              <p>For option price rules, type the exact Select answer that should add this amount.</p>
                              <p>Example: Quartz countertops.</p>
                            </FieldHelp>
                          </span>
                          <input
                            name="option"
                            defaultValue={rule.option}
                            placeholder="For option_price"
                            className="h-10 w-full rounded-md border border-white/10 bg-slate-950/40 px-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-blue-300"
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                            Amount
                            <FieldHelp title="Rule amount" tone="dark">
                              <p>This is the dollar amount added by the rule.</p>
                              <p>For quantity rules, this amount is multiplied by the customer&apos;s number answer.</p>
                            </FieldHelp>
                          </span>
                          <input
                            required
                            name="amount"
                            type="number"
                            min={0}
                            step="0.01"
                            defaultValue={rule.amount}
                            className="h-10 w-full rounded-md border border-white/10 bg-slate-950/40 px-3 text-sm text-white outline-none transition focus:border-blue-300"
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                            Order
                            <FieldHelp title="Rule order" tone="dark" align="left">
                              <p>Controls how rules are displayed in this editor.</p>
                              <p>The quote total is calculated from all matching rules.</p>
                            </FieldHelp>
                          </span>
                          <input
                            name="sortOrder"
                            type="number"
                            min={1}
                            defaultValue={index + 1}
                            className="h-10 w-full rounded-md border border-white/10 bg-slate-950/40 px-3 text-sm text-white outline-none transition focus:border-blue-300"
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

        <form action={addPricingRuleAction} className="rounded-lg border border-[#dbe5f4] bg-white p-5 shadow-crisp">
          <input type="hidden" name="calculatorId" value={calculator.id} />
          <h2 className="font-display text-xl font-bold text-ink">Add pricing rule</h2>
          <div className="mt-3 space-y-2 rounded-lg border border-[#dbe5f4] bg-[#f8fbff] p-4 text-xs leading-5 text-coal/70">
            <div className="flex items-center gap-2 font-bold text-ink">
              <HelpCircle className="h-4 w-4 text-blue-700" />
              Plain-English rule guide
            </div>
            <p>
              <strong>Base price:</strong> starting cost for every quote.
            </p>
            <p>
              <strong>Quantity multiplier:</strong> number answer times amount, like rental days x daily rate.
            </p>
            <p>
              <strong>Option price:</strong> add amount when a specific select answer is chosen.
            </p>
            <p>
              <strong>Checkbox add-on:</strong> add amount when a yes/no add-on is checked.
            </p>
          </div>
          <div className="mt-5 space-y-4">
            <label className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-coal">
                Rule type
                <FieldHelp title="Rule type">
                  <p>Base price: starting amount for every quote.</p>
                  <p>Quantity multiplier: customer number x amount.</p>
                  <p>Option price: add amount when a Select answer matches.</p>
                  <p>Checkbox add-on: add amount when checked.</p>
                </FieldHelp>
              </span>
              <select
                name="ruleType"
                className="h-11 w-full rounded-md border border-[#dbe5f4] bg-[#f8fbff] px-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              >
                <option value="base_price">Base price</option>
                <option value="quantity_multiplier">Quantity multiplier</option>
                <option value="option_price">Option price</option>
                <option value="checkbox_addon">Checkbox add-on</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-coal">
                Question
                <FieldHelp title="Rule question">
                  <p>Attach the rule to the question that should affect pricing.</p>
                  <p>For a base price, leave this set to &quot;No question&quot;.</p>
                </FieldHelp>
              </span>
              <select
                name="questionId"
                className="h-11 w-full rounded-md border border-[#dbe5f4] bg-[#f8fbff] px-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
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
              <span className="flex items-center gap-2 text-sm font-semibold text-coal">
                Matching answer
                <FieldHelp title="Matching answer">
                  <p>Only needed for option price rules.</p>
                  <p>Type the answer exactly as it appears in the Select question, like Kitchen or Quartz.</p>
                </FieldHelp>
              </span>
              <input
                name="option"
                placeholder="Only for option price rules"
                className="h-11 w-full rounded-md border border-[#dbe5f4] bg-[#f8fbff] px-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </label>
            <label className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-coal">
                Amount
                <FieldHelp title="Amount">
                  <p>Enter the dollar value for this rule.</p>
                  <p>Example: 250 adds $250. For quantity rules, 250 means $250 per unit.</p>
                </FieldHelp>
              </span>
              <input
                required
                name="amount"
                type="number"
                min={0}
                step="0.01"
                placeholder="250"
                className="h-11 w-full rounded-md border border-[#dbe5f4] bg-[#f8fbff] px-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </label>
          </div>
          <SubmitButton className="mt-5 w-full" variant="secondary" pendingLabel="Adding rule...">
            <Plus className="h-4 w-4" /> Add pricing rule
          </SubmitButton>
        </form>

        <CalculatorEmbedPanel
          id={calculator.id}
          slug={calculator.slug}
          publicId={calculator.publicId}
          isPublished={calculator.isPublished}
          appUrl={appUrl}
        />

        <CalculatorDangerActions calculatorId={calculator.id} calculatorName={calculator.name} />
      </aside>
    </div>
  );
}
