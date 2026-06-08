import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  Lightbulb,
  PlayCircle,
  Route,
  Users,
  Workflow
} from "lucide-react";
import { ButtonLink } from "@/components/button";
import { PageHeader } from "@/components/page-header";
import { howToUseSteps, howToUseTips } from "@/lib/how-to-use";
import { quoteBuilderDemoOriginalUrl, quoteBuilderDemoVideoUrl } from "@/lib/video-assets";

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

      <section className="overflow-hidden rounded-xl border border-[#dbe5f4] bg-white shadow-crisp">
        <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
          <div className="p-6 lg:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              <PlayCircle className="h-3.5 w-3.5" />
              Demo walkthrough
            </div>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-ink">
              Watch a calculator come together from template to lead.
            </h2>
            <p className="mt-4 text-sm leading-6 text-coal/70">
              Use this short walkthrough when you want to see the full flow before building: choose a template, adjust
              questions, preview the customer quote path, publish, and collect a lead.
            </p>
            <a
              href={quoteBuilderDemoOriginalUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#dbe5f4] bg-[#f8fbff] px-4 text-sm font-bold text-coal shadow-crisp transition hover:border-blue-500 hover:text-blue-700"
            >
              Open video <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="relative bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.22),transparent_38%),linear-gradient(135deg,#eff6ff,#ffffff)] p-4 lg:p-6">
            <div className="absolute bottom-6 left-10 right-10 h-20 rounded-full bg-blue-400/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-[#dbe5f4] bg-white p-3 shadow-soft">
              <div className="flex items-center gap-2 border-b border-[#dbe5f4] px-3 py-3">
                <span className="h-3 w-3 rounded-full bg-[#ef4444]" />
                <span className="h-3 w-3 rounded-full bg-[#f59e0b]" />
                <span className="h-3 w-3 rounded-full bg-[#22c55e]" />
                <span className="ml-3 text-xs font-bold uppercase tracking-[0.14em] text-coal/50">
                  QuoteBuilder Pro demo
                </span>
              </div>
              <video controls preload="metadata" playsInline className="aspect-video w-full rounded-xl bg-[#0f172a]">
                <source src={quoteBuilderDemoVideoUrl} type="video/mp4" />
                Your browser does not support the video tag. Open the demo video link instead.
              </video>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-blue-900/20 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.34),transparent_44%),linear-gradient(135deg,#111827,#172554)] text-white shadow-soft">
        <div className="grid gap-6 p-6 lg:grid-cols-[0.72fr_1.28fr] lg:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100">Builder mindset</p>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight">Build the first version like a sales conversation.</h2>
            <p className="mt-4 text-sm leading-6 text-white/70">
              Start with the question a real customer would answer first, branch into the details only when needed, and
              price each answer to create a helpful estimate range.
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
            <p>Use those notes to decide whether branching, pricing, or templates need the next improvement.</p>
          </div>
        </aside>
      </section>
    </div>
  );
}
