import { ArrowUpRight, DollarSign, EyeOff, Palette, Rocket, Save } from "lucide-react";
import { Badge } from "@/components/badge";
import { Button, ButtonLink } from "@/components/button";
import { CalculatorBuilderGuide } from "@/components/calculator-builder-guide";
import { CalculatorDangerActions } from "@/components/calculator-danger-actions";
import { CalculatorEmbedPanel } from "@/components/calculator-embed-panel";
import { FieldHelp } from "@/components/field-help";
import { QuestionEditorCard } from "@/components/question-editor-card";
import { SubmitButton } from "@/components/submit-button";
import {
  updateCalculatorBasePriceAction,
  updateCalculatorBrandingAction,
  updateCalculatorPublishStatusAction
} from "@/lib/actions";
import type { CalculatorEditor as CalculatorEditorData } from "@/lib/calculator-data";
import { buildPublicQuotePath } from "@/lib/public-calculator-paths";

export function CalculatorEditor({ calculator }: { calculator: CalculatorEditorData }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const branchQuestions = calculator.questions.map((question) => ({
    id: question.id,
    label: question.label,
    questionType: question.questionType,
    options: question.options
  }));

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
                  : "Publish it when the questions and pricing are ready for customers."}
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

        <form action={updateCalculatorBasePriceAction} className="rounded-lg border border-[#dbe5f4] bg-white p-5 shadow-crisp">
          <input type="hidden" name="calculatorId" value={calculator.id} />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                <DollarSign className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-xl font-bold text-ink">Starting price</h2>
                <p className="mt-0.5 text-sm leading-6 text-coal/70">
                  Every quote begins here, before any questions are answered.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="relative inline-flex items-center">
                <span className="pointer-events-none absolute left-3 font-mono font-semibold text-emerald-700">$</span>
                <input
                  name="basePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  defaultValue={calculator.basePrice || ""}
                  placeholder="0"
                  className="w-36 rounded-md border border-emerald-100 bg-emerald-50 py-2.5 pl-7 pr-3 font-mono text-base font-semibold text-emerald-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </span>
              <SubmitButton variant="secondary" pendingLabel="Saving...">
                <Save className="h-4 w-4" /> Save
              </SubmitButton>
            </div>
          </div>
        </form>

        <div>
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3 px-1">
            <h2 className="font-display text-xl font-bold text-ink">Questions</h2>
            <span className="text-sm text-coal/55">Each question can add to the estimate</span>
          </div>
          {calculator.questions.length > 0 ? (
            <div className="space-y-4">
              {calculator.questions.map((question) => (
                <QuestionEditorCard
                  key={question.id}
                  calculatorId={calculator.id}
                  question={question}
                  allQuestions={branchQuestions}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[#dbe5f4] bg-[#f8fbff] px-4 py-8 text-center text-sm text-coal/70">
              No questions yet. Add your first one below.
            </div>
          )}
        </div>

        <div>
          <div className="mb-3 px-1">
            <h2 className="font-display text-lg font-bold text-ink">Add a question</h2>
            <p className="mt-1 text-sm leading-6 text-coal/70">
              Pick an answer type, then set what each answer adds to the estimate.
            </p>
          </div>
          <QuestionEditorCard calculatorId={calculator.id} allQuestions={branchQuestions} />
        </div>
      </section>

      <aside className="space-y-6">
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
