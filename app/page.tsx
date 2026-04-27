import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle2, ClipboardList, FileText, LockKeyhole, Users } from "lucide-react";
import { ButtonLink } from "@/components/button";
import { calculators } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export default function LandingPage() {
  const totalLeads = calculators.reduce((sum, calculator) => sum + calculator.leads, 0);

  return (
    <main className="min-h-screen bg-paper text-ink">
      <section className="relative overflow-hidden border-b border-line">
        <div className="surface-grid absolute inset-0 opacity-70" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/70 to-transparent" />
        <div className="absolute right-[-8rem] top-16 hidden w-[46rem] rotate-[-4deg] rounded-lg border border-line bg-white/80 p-4 shadow-soft backdrop-blur md:block animate-shimmer">
          <div className="grid grid-cols-[1.1fr_0.9fr] gap-4">
            <div className="rounded-md border border-line bg-paper p-4">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <span className="font-display text-lg font-bold">Managed IT Services Quote</span>
                <span className="rounded-full bg-teal-50 px-2 py-1 text-xs font-bold text-teal-700">Published</span>
              </div>
              <div className="mt-4 space-y-3">
                <div className="h-12 rounded-md border border-line bg-white" />
                <div className="h-12 rounded-md border border-line bg-white" />
                <div className="h-12 rounded-md border border-line bg-white" />
              </div>
            </div>
            <div className="rounded-md bg-ink p-4 text-white">
              <p className="text-xs uppercase tracking-[0.18em] text-teal-100">Estimated total</p>
              <p className="mt-4 font-display text-4xl font-bold">$8,350</p>
              <div className="mt-5 h-10 rounded-md bg-teal-600" />
            </div>
          </div>
        </div>
        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-10">
          <Link href="/" className="flex items-center gap-3 font-display text-lg font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-ink text-sm text-white">QB</span>
            QuoteBuilder Pro
          </Link>
          <div className="flex items-center gap-2">
            <ButtonLink href="/dashboard" variant="ghost" size="sm">
              Dashboard
            </ButtonLink>
            <ButtonLink href="/dashboard/calculators/new" size="sm">
              Create calculator
            </ButtonLink>
          </div>
        </nav>
        <div className="relative z-10 mx-auto grid min-h-[78vh] max-w-7xl content-center px-4 pb-14 pt-12 sm:px-6 lg:px-10">
          <div className="max-w-3xl animate-rise">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">No-code quote calculators</p>
            <h1 className="mt-5 font-display text-5xl font-black leading-[1.02] text-ink md:text-7xl">
              QuoteBuilder Pro
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-coal/75">
              Build polished pricing calculators, publish customer quote pages, and capture high-intent leads without
              bolting together forms, spreadsheets, and inbox triage.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="/dashboard" size="lg">
                Open dashboard <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/quote/managed-it-services" variant="outline" size="lg">
                View public quote
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-10">
          {[
            { label: "Mock leads captured", value: totalLeads, icon: Users },
            { label: "Published calculators", value: calculators.filter((item) => item.status === "PUBLISHED").length, icon: ClipboardList },
            { label: "Average quote value", value: formatCurrency(581500), icon: BarChart3 }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-4 rounded-lg border border-line bg-paper p-4">
                <span className="rounded-md bg-white p-2 text-teal-700">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm text-coal/60">{item.label}</p>
                  <p className="font-display text-2xl font-bold text-ink">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-10">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">MVP foundation</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-ink">Built for the first paid workflow</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Calculator builder",
              body: "Define base pricing, question fields, simple price rules, and a public slug.",
              icon: FileText
            },
            {
              title: "Published quote pages",
              body: "Share a customer-facing quote form that estimates totals and collects contact details.",
              icon: CheckCircle2
            },
            {
              title: "Lead workspace",
              body: "Review submissions, quoted totals, source calculator, and lead status from one dashboard.",
              icon: LockKeyhole
            }
          ].map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-lg border border-line bg-white p-5 shadow-crisp">
                <Icon className="h-5 w-5 text-teal-700" />
                <h3 className="mt-4 font-display text-xl font-bold text-ink">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-coal/70">{feature.body}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-8 rounded-lg border border-line bg-ink p-6 text-white">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold">Ready for Neon, Prisma, and Netlify.</h2>
              <p className="mt-2 text-sm text-white/70">The current app uses mock auth and mock records while the database schema is ready to migrate.</p>
            </div>
            <ButtonLink href="/dashboard/calculators/new" variant="secondary">
              Start building <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      </section>
    </main>
  );
}
