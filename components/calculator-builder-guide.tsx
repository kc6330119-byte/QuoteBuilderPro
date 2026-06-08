import { CheckCircle2, ClipboardList, Eye, GitBranch, ListChecks, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/badge";
import { ButtonLink } from "@/components/button";
import type { CalculatorEditor as CalculatorEditorData } from "@/lib/calculator-data";
import { formatDollars } from "@/lib/utils";

export function CalculatorBuilderGuide({ calculator }: { calculator: CalculatorEditorData }) {
  const baseRules = calculator.rules.filter((rule) => rule.ruleType === "base_price");
  const pricedRules = calculator.rules.filter((rule) => rule.ruleType !== "base_price");
  const branchCount = calculator.questions.filter((question) => question.visibilityCondition).length;
  const completedSteps = getChecklist(calculator, baseRules.length, pricedRules.length).filter((step) => step.complete).length;
  const totalSteps = 5;

  return (
    <section className="overflow-hidden rounded-xl border border-[#dbe5f4] bg-white shadow-crisp">
      <div className="relative border-b border-[#dbe5f4] bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.14),_transparent_34%),linear-gradient(135deg,_#ffffff,_#f8fbff)] p-5">
        <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-blue-600/10" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="success">Builder coach</Badge>
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-coal/45">
                {completedSteps} of {totalSteps} ready
              </span>
            </div>
            <h2 className="mt-3 font-display text-2xl font-black text-ink">Build the customer path first</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-coal/70">
              Start with the customer&apos;s first decision, add follow-up questions only when they matter, then set a
              price on the answers that change the estimate. The live preview updates as you build.
            </p>
          </div>
          <ButtonLink href={`/preview/${calculator.id}`} variant="outline">
            <Eye className="h-4 w-4" />
            Preview flow
          </ButtonLink>
        </div>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[1fr_260px]">
        <div>
          <div className="h-2 overflow-hidden rounded-full bg-mist">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${Math.round((completedSteps / totalSteps) * 100)}%` }}
            />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {getChecklist(calculator, baseRules.length, pricedRules.length).map((step) => (
              <div key={step.label} className="rounded-lg border border-[#dbe5f4] bg-[#f8fbff] p-4">
                <div className="flex items-start gap-3">
                  <span
                    className={
                      step.complete
                        ? "mt-0.5 rounded-full bg-blue-600 p-1 text-white"
                        : "mt-0.5 rounded-full border border-[#dbe5f4] bg-white p-1 text-coal/45"
                    }
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-ink">{step.label}</p>
                    <p className="mt-1 text-xs leading-5 text-coal/65">{step.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-lg border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-800" />
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-900">Next best step</p>
          </div>
          <p className="mt-3 text-sm font-bold leading-6 text-ink">{getNextStep(calculator, baseRules.length, pricedRules.length)}</p>
          <div className="mt-4 space-y-3 text-xs leading-5 text-blue-950/75">
            <p>
              Questions: <strong>{calculator.questions.length}</strong>
            </p>
            <p>
              Conditional questions: <strong>{branchCount}</strong>
            </p>
            <p>
              Starting price: <strong>{baseRules.length > 0 ? formatDollars(calculator.basePrice) : "Not set"}</strong>
            </p>
            <p>
              Priced answers: <strong>{pricedRules.length}</strong>
            </p>
          </div>
        </aside>
      </div>

      <div className="border-t border-blue-900/20 bg-[linear-gradient(135deg,#111827,#172554)] px-5 py-4 text-white">
        <div className="grid gap-3 text-sm md:grid-cols-3">
          <GuideRecipe
            icon={<ClipboardList className="h-4 w-4" />}
            title="1. Ask"
            body="Use Choice for a list of options, Number for quantities, and Yes / No for add-ons."
          />
          <GuideRecipe
            icon={<GitBranch className="h-4 w-4" />}
            title="2. Branch"
            body="Use &ldquo;Only show when&rdquo; so kitchen details appear only when the customer picks Kitchen — same for bath, garage, or dumpsters."
          />
          <GuideRecipe
            icon={<ListChecks className="h-4 w-4" />}
            title="3. Price"
            body={`Set a starting price, then price each choice and add-on inline. Number questions charge per unit, like days × ${formatDollars(125)}.`}
          />
        </div>
      </div>
    </section>
  );
}

function GuideRecipe({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.06] p-3">
      <div className="flex items-center gap-2 text-blue-100">
        {icon}
        <p className="font-bold text-white">{title}</p>
      </div>
      <p className="mt-2 text-xs leading-5 text-white/65">{body}</p>
    </div>
  );
}

function getChecklist(calculator: CalculatorEditorData, baseRuleCount: number, pricedRuleCount: number) {
  return [
    {
      label: "Calculator is named",
      detail: "The customer and dashboard will use this name.",
      complete: calculator.name.trim().length > 0
    },
    {
      label: "Customer questions added",
      detail: "Add the questions needed to estimate the job.",
      complete: calculator.questions.length > 0
    },
    {
      label: "Starting price set",
      detail: "Set a starting price when every quote should begin with a minimum.",
      complete: baseRuleCount > 0
    },
    {
      label: "Answers affect price",
      detail: "Give each choice, add-on, or quantity its own price so answers change the estimate.",
      complete: pricedRuleCount > 0
    },
    {
      label: "Ready to share",
      detail: "Publish only after previewing the flow from a customer perspective.",
      complete: calculator.isPublished
    }
  ];
}

function getNextStep(calculator: CalculatorEditorData, baseRuleCount: number, pricedRuleCount: number) {
  if (calculator.questions.length === 0) {
    return 'Add a first Choice question such as "What service do you need?"';
  }

  if (baseRuleCount === 0) {
    return "Set a Starting price if every estimate should begin with a minimum charge.";
  }

  if (pricedRuleCount === 0) {
    return "Set a price on the answers that should increase the estimate.";
  }

  if (!calculator.isPublished) {
    return "Open Preview flow, test it like a customer, then publish when it feels right.";
  }

  return "This calculator is live. Use the embed section when you are ready to place it on a website.";
}
