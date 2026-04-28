import { ArrowRight, BookOpenCheck, CheckCircle2, CircleDollarSign, ClipboardList, Lightbulb, Route, Users, Workflow } from "lucide-react";
import { ButtonLink } from "@/components/button";
import { PageHeader } from "@/components/page-header";
import { howToUseSteps, howToUseTips } from "@/lib/how-to-use";

const guideIcons = [BookOpenCheck, Route, CircleDollarSign, CheckCircle2, Workflow, Users];

export default function DashboardHowToUsePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="How to use"
        description="A practical workflow for turning a service business into a quote calculator that captures useful leads."
        actions={
          <>
            <ButtonLink href="/dashboard/templates" variant="outline">
              Browse templates
            </ButtonLink>
            <ButtonLink href="/dashboard/calculators/new">
              Create calculator <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </>
        }
      />

      <section className="overflow-hidden rounded-xl border border-blue-900/20 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.34),transparent_44%),linear-gradient(135deg,#111827,#172554)] text-white shadow-soft">
        <div className="grid gap-6 p-6 lg:grid-cols-[0.72fr_1.28fr] lg:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100">Builder mindset</p>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight">Build the first version like a sales conversation.</h2>
            <p className="mt-4 text-sm leading-6 text-white/70">
              Start with the question a real customer would answer first, branch into the details only when needed, and
              use pricing rules to create a helpful estimate range.
            </p>
            <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.08] p-4">
              <div className="flex items-start gap-3">
                <span className="rounded-md bg-blue-100 p-2 text-blue-900">
                  <Lightbulb className="h-5 w-5" />
                </span>
                <p className="text-sm leading-6 text-white/80">
                  For the first customer test, a calculator that is easy to understand beats one that handles every edge
                  case.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {howToUseSteps.map((step, index) => {
              const Icon = guideIcons[index] ?? ClipboardList;
              return (
                <article key={step.step} className="rounded-lg border border-white/10 bg-white/[0.08] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-display text-sm font-bold text-blue-100">{step.step}</span>
                    <span className="rounded-md bg-white p-2 text-blue-700">
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-lg font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/70">{step.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-[#dbe5f4] bg-white p-5 shadow-crisp">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Tips</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-ink">Make calculators easier to finish and easier to trust</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {howToUseTips.map((tip) => (
              <div key={tip} className="rounded-md border border-[#dbe5f4] bg-[#f8fbff] px-4 py-3 text-sm font-semibold leading-6 text-coal">
                {tip}
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-lg border border-[#dbe5f4] bg-white p-5 shadow-crisp">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Recommended test</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-ink">Try this with your builder friend</h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-coal/70">
            <p>Create one home remodeling calculator and one rolloff rental calculator from templates.</p>
            <p>Ask him to create a real quote from each and point out where the questions feel unclear.</p>
            <p>Use those notes to decide whether branching, pricing rules, or templates need the next improvement.</p>
          </div>
        </aside>
      </section>
    </div>
  );
}
