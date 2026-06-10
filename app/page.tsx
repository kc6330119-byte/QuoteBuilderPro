import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  FileText,
  Lightbulb,
  LockKeyhole,
  MousePointerClick,
  Route,
  ShieldCheck,
  Sparkles,
  TimerReset,
  Users,
  Workflow
} from "lucide-react";
import { ButtonLink } from "@/components/button";
import { HomeNavAuth } from "@/components/home-nav-auth";
import { HomePlayground } from "@/components/home-playground";
import { howToUseSteps, howToUseTips } from "@/lib/how-to-use";

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "QuoteBuilder Pro",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "QuoteBuilder Pro helps service businesses create embeddable quote calculators, publish estimate forms, and capture qualified customer leads.",
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    lowPrice: "29",
    highPrice: "149",
    offerCount: "3"
  }
};

export default function LandingPage() {
  const guideIcons = [BookOpenCheck, Route, CircleDollarSign, CheckCircle2, Workflow, Users];

  return (
    <main className="min-h-screen bg-[#f7faff] text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <section className="relative overflow-hidden border-b border-[#dbe5f4] bg-[linear-gradient(180deg,#ffffff_0%,#f3f8ff_100%)]">
        <div className="surface-grid absolute inset-0 opacity-45" />
        <div className="absolute right-0 top-28 hidden h-[30rem] w-[34rem] rounded-l-full bg-[#dbeafe] opacity-70 blur-3xl lg:block" />
        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 font-display text-lg font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#1d4ed8] text-sm text-white shadow-crisp">
              QB
            </span>
            <span>QuoteBuilder Pro</span>
          </Link>
          <div className="hidden items-center gap-8 text-sm font-semibold text-coal/70 lg:flex">
            <a href="#features" className="transition hover:text-[#1d4ed8]">
              Features
            </a>
            <a href="#live-demo" className="transition hover:text-[#1d4ed8]">
              Live demo
            </a>
            <a href="#how-to-use" className="transition hover:text-[#1d4ed8]">
              How to use
            </a>
            <a href="#templates" className="transition hover:text-[#1d4ed8]">
              Templates
            </a>
            <a href="#pricing" className="transition hover:text-[#1d4ed8]">
              Pricing
            </a>
            <Link href="/contact" className="transition hover:text-[#1d4ed8]">
              Contact
            </Link>
          </div>
          <HomeNavAuth />
        </nav>

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 lg:px-8 xl:grid-cols-[0.88fr_1.12fr] xl:pb-20 xl:pt-20">
          <div className="animate-rise">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#bfdbfe] bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#1d4ed8] shadow-crisp">
              <Sparkles className="h-3.5 w-3.5" />
              Pricing clarity, captured leads
            </div>
            <h1 className="mt-6 max-w-3xl font-display text-5xl font-black leading-[1.02] text-[#111827] sm:text-6xl lg:text-7xl">
              Turn pricing questions into quote requests.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#475569]">
              Today&apos;s customers want a cost range before they call. QuoteBuilder Pro helps service businesses add
              interactive calculators to their websites, give visitors a helpful estimate, and capture higher-intent
              leads in one dashboard.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard/templates"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#2563eb] px-5 text-base font-bold text-white shadow-crisp transition hover:-translate-y-0.5 hover:bg-[#1d4ed8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]"
              >
                Create your first calculator <ArrowRight className="h-4 w-4" />
              </Link>
              <ButtonLink href="#live-demo" variant="outline" size="lg">
                <MousePointerClick className="h-4 w-4" /> Try the live demo
              </ButtonLink>
            </div>
            <div className="mt-8 grid gap-4 text-sm text-[#475569] sm:grid-cols-3">
              {[
                { label: "No credit card", detail: "required", icon: ShieldCheck },
                { label: "Setup in", detail: "minutes", icon: TimerReset },
                { label: "Cancel", detail: "anytime", icon: CheckCircle2 }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#bfdbfe] bg-white text-[#2563eb]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block font-bold text-[#1f2937]">{item.label}</span>
                      <span className="text-xs">{item.detail}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-2xl xl:max-w-none">
            <div className="absolute -bottom-7 left-8 right-8 h-28 rounded-[2rem] bg-[#60a5fa] opacity-45 blur-2xl" />
            <div className="relative rounded-xl border border-[#dbe5f4] bg-white/90 p-4 shadow-soft backdrop-blur">
              <div className="grid gap-4 lg:grid-cols-[1fr_0.72fr]">
                <div className="rounded-lg border border-[#dbe5f4] bg-white p-5">
                  <div className="flex items-start justify-between gap-4 border-b border-[#e5edf8] pb-4">
                    <div>
                      <p className="font-display text-xl font-black text-[#111827]">Kitchen Remodel Calculator</p>
                      <p className="mt-1 text-xs font-semibold text-[#64748b]">Step 2 of 4</p>
                    </div>
                    <span className="rounded-full bg-[#dcfce7] px-3 py-1 text-xs font-bold text-[#15803d]">
                      Published
                    </span>
                  </div>
                  <div className="mt-5 space-y-3">
                    {[
                      { label: "Small kitchen", price: "$2,500", active: false },
                      { label: "Medium kitchen", price: "$4,500", active: true },
                      { label: "Large kitchen", price: "$6,500", active: false }
                    ].map((option) => (
                      <div
                        key={option.label}
                        className={`flex items-center justify-between rounded-md border px-4 py-3 text-sm transition ${
                          option.active
                            ? "border-[#2563eb] bg-[#eff6ff] text-[#1d4ed8]"
                            : "border-[#dbe5f4] bg-[#fbfdff] text-[#334155]"
                        }`}
                      >
                        <span className="font-semibold">{option.label}</span>
                        <span className="font-bold">{option.price}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-md border border-[#dbe5f4] bg-[#f8fbff] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#334155]">Premium cabinets</span>
                      <span className="text-sm font-bold text-[#2563eb]">+$1,800</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-[#dbeafe]">
                      <div className="h-2 w-3/5 rounded-full bg-[#2563eb]" />
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-[#111827] p-5 text-white">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#bfdbfe]">Estimated total</p>
                  <p className="mt-4 font-display text-4xl font-black">$8,300</p>
                  <div className="mt-5 rounded-md bg-white p-4 text-[#111827]">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dbeafe] text-[#2563eb]">
                        <CircleDollarSign className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-xs font-bold uppercase text-[#64748b]">Lead quality</p>
                        <p className="font-display text-xl font-black">High intent</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-md border border-white/10 bg-white/10 p-3">
                      <p className="text-xs text-white/60">Quotes</p>
                      <p className="mt-1 font-display text-xl font-bold">342</p>
                    </div>
                    <div className="rounded-md border border-white/10 bg-white/10 p-3">
                      <p className="text-xs text-white/60">Close rate</p>
                      <p className="mt-1 font-display text-xl font-bold">24%</p>
                    </div>
                  </div>
                  <div className="mt-5 h-11 rounded-md bg-[#2563eb]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#dbe5f4] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr] lg:items-stretch">
            <div className="rounded-xl border border-[#dbe5f4] bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.13),transparent_38%),#f8fbff] p-5 shadow-crisp">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563eb]">Why calculators help</p>
              <h2 className="mt-3 font-display text-2xl font-black leading-tight text-[#111827]">
                Buyers do not want a mystery price.
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#475569]">
                A quote calculator gives visitors a useful estimate without locking your business into a final price.
                They get clarity. You get a lead with project details attached.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  value: "70%",
                  label: "of homeowners surveyed said they are more likely to call an HVAC contractor that is transparent about pricing.",
                  source: "ACHR News",
                  href: "https://www.achrnews.com/articles/163836-hvac-customers-and-contractors-at-odds-with-online-pricing",
                  icon: Users
                },
                {
                  value: "14%",
                  label: "of cart abandoners cite not being able to see or calculate total cost up front.",
                  source: "Baymard Institute",
                  href: "https://baymard.com/lists/cart-abandonment-rate",
                  icon: BarChart3
                },
                {
                  value: "19%",
                  label: "of cart abandoners cite being forced to create an account before checkout.",
                  source: "Baymard Institute",
                  href: "https://baymard.com/lists/cart-abandonment-rate",
                  icon: LockKeyhole
                }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.value}
                    className="group flex h-full flex-col rounded-xl border border-[#dbe5f4] bg-white p-5 shadow-crisp transition duration-200 hover:-translate-y-0.5 hover:border-[#93c5fd]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-lg bg-[#eff6ff] p-2 text-[#2563eb]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-[#64748b] underline-offset-4 transition hover:text-[#1d4ed8] hover:underline"
                      >
                        {item.source}
                      </a>
                    </div>
                    <p className="mt-5 font-display text-4xl font-black text-[#111827]">{item.value}</p>
                    <p className="mt-2 flex-1 text-sm leading-6 text-[#475569]">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="mt-4 text-xs leading-5 text-[#64748b]">
            These are third-party research signals about pricing transparency and checkout friction, not guaranteed
            QuoteBuilder Pro performance claims.
          </p>
        </div>
      </section>

      <section className="border-b border-[#dbe5f4] bg-[#f8fbff]">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
          {[
            { label: "Show helpful estimates", body: "Give visitors a realistic planning range before the first call.", icon: CircleDollarSign },
            { label: "Avoid forced accounts", body: "Customers can submit quote requests without creating a login.", icon: CheckCircle2 },
            { label: "Capture qualified leads", body: "Every submission includes answers, contact details, and estimate value.", icon: ClipboardList }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex gap-4 rounded-lg border border-[#dbe5f4] bg-white p-4 shadow-crisp">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#eff6ff] text-[#2563eb]">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-base font-black text-[#111827]">{item.label}</p>
                  <p className="mt-1 text-sm leading-6 text-[#475569]">{item.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section id="live-demo" className="border-b border-[#dbe5f4] bg-[#f8fbff] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 lg:grid-cols-[1fr_360px] lg:items-end">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#bfdbfe] bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#2563eb] shadow-crisp">
                <MousePointerClick className="h-3.5 w-3.5" />
                Live demo
              </div>
              <h2 className="mt-5 font-display text-4xl font-black leading-tight text-[#111827] md:text-5xl">
                Don&apos;t watch a demo. Build one.
              </h2>
              <p className="mt-5 text-base leading-8 text-[#475569]">
                This is the real QuoteBuilder Pro editor, preloaded with our Kitchen Remodel template. Change a price,
                add a question, drag to reorder — the customer preview updates instantly. Nothing is saved, so
                experiment freely.
              </p>
            </div>
            <p className="hidden text-sm leading-6 text-[#64748b] lg:block">
              The panel on the right is exactly what your customers see — answer its questions and watch the estimate
              move in real time.
            </p>
          </div>
          <div className="mt-8">
            <HomePlayground />
          </div>
        </div>
      </section>

      <section id="how-to-use" className="relative overflow-hidden border-b border-[#dbe5f4] bg-[#0f172a] text-white">
        <div className="surface-grid absolute inset-0 opacity-10" />
        <div className="absolute -left-28 top-10 h-72 w-72 rounded-full bg-[#2563eb] opacity-20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#14b8a6] opacity-15 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <div className="lg:sticky lg:top-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#bfdbfe]">
                <BookOpenCheck className="h-3.5 w-3.5" />
                How to use QuoteBuilder Pro
              </div>
              <h2 className="mt-5 font-display text-4xl font-black leading-tight md:text-5xl">
                Turn a service workflow into a quote engine.
              </h2>
              <p className="mt-5 text-base leading-8 text-white/70">
                The best calculators feel simple to customers because the business logic is organized behind the
                scenes. Start narrow, branch only when needed, and publish once the quote paths feel trustworthy.
              </p>
              <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.07] p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#dbeafe] text-[#1d4ed8]">
                    <Lightbulb className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#bfdbfe]">Best first build</p>
                    <p className="font-display text-lg font-black">One service, one calculator, one clean quote path.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {howToUseSteps.map((step, index) => {
                const Icon = guideIcons[index] ?? ClipboardList;
                return (
                  <article
                    key={step.step}
                    className="group rounded-xl border border-white/10 bg-white/[0.06] p-5 shadow-soft backdrop-blur transition duration-200 hover:-translate-y-1 hover:bg-white/[0.09]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="font-display text-sm font-black text-[#93c5fd]">{step.step}</span>
                      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-[#1d4ed8] transition group-hover:rotate-3">
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>
                    <h3 className="mt-4 font-display text-xl font-black">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/70">{step.body}</p>
                    <p className="mt-4 rounded-md border border-[#93c5fd]/20 bg-[#1d4ed8]/15 px-3 py-2 text-xs font-semibold leading-5 text-[#dbeafe]">
                      Tip: {step.tip}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-white/10 bg-white p-5 text-[#111827] shadow-soft">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563eb]">Practical tips</p>
                <h3 className="mt-2 font-display text-2xl font-black">Small choices that make calculators convert better</h3>
              </div>
              <ButtonLink href="/dashboard/templates" variant="secondary">
                Start from a template <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {howToUseTips.map((tip) => (
                <div key={tip} className="rounded-lg border border-[#dbe5f4] bg-[#f8fbff] px-4 py-3 text-sm font-semibold leading-6 text-[#334155]">
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563eb]">Quote workflow</p>
          <h2 className="mt-3 font-display text-3xl font-black text-[#111827]">
            Built for service businesses that need better quote requests
          </h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Calculator builder",
              body: "Define base pricing, customer questions, simple price rules, and a public quote link.",
              icon: FileText
            },
            {
              title: "Published quote pages",
              body: "Share a customer-facing quote form that estimates totals and collects contact details.",
              icon: Workflow
            },
            {
              title: "Lead dashboard",
              body: "Review submissions, quoted totals, source calculator, and lead status from one dashboard.",
              icon: LockKeyhole
            }
          ].map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-lg border border-[#dbe5f4] bg-white p-5 shadow-crisp">
                <Icon className="h-5 w-5 text-[#2563eb]" />
                <h3 className="mt-4 font-display text-xl font-black text-[#111827]">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#475569]">{feature.body}</p>
              </div>
            );
          })}
        </div>
        <div id="how-it-works" className="mt-8 grid gap-4 rounded-lg border border-[#dbe5f4] bg-white p-5 shadow-crisp lg:grid-cols-3">
          {[
            {
              title: "Create in minutes",
              body: "Start from a service template, tune the questions, and price each answer.",
              icon: Clock3
            },
            {
              title: "Embed anywhere",
              body: "Share a public quote page now, then embed calculators when the product is ready.",
              icon: Workflow
            },
            {
              title: "Capture and close",
              body: "Route every estimate into a lead dashboard with the quote value attached.",
              icon: CircleDollarSign
            }
          ].map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="flex gap-4 border-[#dbe5f4] py-3 lg:border-r lg:pr-5 last:lg:border-r-0">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#eff6ff] text-[#2563eb]">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-black text-[#111827]">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#475569]">{step.body}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div
          id="templates"
          className="mt-8 overflow-hidden rounded-xl border border-[#dbe5f4] bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.34),transparent_38%),linear-gradient(135deg,#111827,#172554)] p-6 text-white shadow-soft"
        >
          <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#bfdbfe]">Ready to capture better leads?</p>
              <h2 className="mt-2 font-display text-3xl font-black">Start with a template, then publish your quote flow.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/70">
                Choose a starter calculator, customize the questions and pricing, preview the customer experience,
                then share the quote page or embed it on your website.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <Link
                id="pricing"
                href="/dashboard/templates"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#2563eb] px-5 text-sm font-bold text-white shadow-crisp transition hover:-translate-y-0.5 hover:bg-[#1d4ed8]"
              >
                Start from a template <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#live-demo"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/10 px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white hover:text-[#111827]"
              >
                Try the live demo <MousePointerClick className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#dbe5f4] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-[#64748b] sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="font-display text-base font-black text-[#111827]">QuoteBuilder Pro</p>
            <p className="mt-1">Quote calculators, lead capture, and non-binding estimate workflows for service businesses.</p>
          </div>
          <div className="flex flex-wrap gap-4 font-semibold">
            <Link href="/contact" className="transition hover:text-[#1d4ed8]">
              Contact
            </Link>
            <Link href="/terms" className="transition hover:text-[#1d4ed8]">
              Terms
            </Link>
            <Link href="/privacy" className="transition hover:text-[#1d4ed8]">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
