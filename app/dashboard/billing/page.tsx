import { ArrowUpRight, CheckCircle2, CreditCard, GaugeCircle, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/badge";
import { Button, ButtonLink } from "@/components/button";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import { createBillingPortalSessionAction, createCheckoutSessionAction } from "@/lib/billing-actions";
import { getBillingDashboardData } from "@/lib/billing";
import { isPaidSubscriptionStatus, type BillingPlan } from "@/lib/plans";
import { cn, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BillingPage({
  searchParams
}: {
  searchParams?: Promise<{ checkout?: string }>;
}) {
  const [data, params] = await Promise.all([
    getBillingDashboardData(),
    searchParams ? searchParams : Promise.resolve({} as { checkout?: string })
  ]);
  const hasActiveSubscription = isPaidSubscriptionStatus(data.company.subscriptionStatus);
  const currentPlanLimit = data.currentPlan;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Billing"
        description="Choose the plan that matches your quote volume. Stripe handles checkout and subscription billing securely."
        actions={
          data.company.stripeCustomerId ? (
            <form action={createBillingPortalSessionAction}>
              <SubmitButton variant="outline" pendingLabel="Opening Stripe...">
                <CreditCard className="h-4 w-4" /> Manage in Stripe
              </SubmitButton>
            </form>
          ) : (
            <ButtonLink href="/dashboard/calculators" variant="outline">
              Review calculators <ArrowUpRight className="h-4 w-4" />
            </ButtonLink>
          )
        }
      />

      <BillingNotice state={params.checkout} />

      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="overflow-hidden rounded-xl border border-[#dbe5f4] bg-white shadow-crisp">
          <div className="border-b border-[#dbe5f4] bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.14),transparent_36%),linear-gradient(135deg,#ffffff,#f8fbff)] p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Current subscription</p>
                <h2 className="mt-2 font-display text-3xl font-bold text-ink">
                  {data.currentPlan ? data.currentPlan.name : "No paid plan yet"}
                </h2>
              </div>
              <Badge tone={getStatusTone(data.company.subscriptionStatus)}>
                {formatSubscriptionStatus(data.company.subscriptionStatus)}
              </Badge>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-coal/70">
              {data.currentPlan
                ? `${data.company.name} is on the ${data.currentPlan.name} plan. Usage updates as calculators and leads are created.`
                : "Pick a plan when you are ready to start charging real customer workspaces through QuoteBuilder Pro."}
            </p>
            {data.company.subscriptionCurrentPeriodEnd ? (
              <p className="mt-3 text-sm font-semibold text-coal/60">
                Current period ends {formatDate(data.company.subscriptionCurrentPeriodEnd)}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 p-6 md:grid-cols-3">
            <UsageTile
              label="Calculators"
              value={data.usage.calculatorCount}
              limit={currentPlanLimit?.calculatorLimit}
            />
            <UsageTile
              label="Published"
              value={data.usage.publishedCalculatorCount}
              limit={currentPlanLimit?.calculatorLimit}
            />
            <UsageTile label="Leads" value={data.usage.leadCount} limit={currentPlanLimit?.leadLimit} />
          </div>
        </div>

        <div className="rounded-xl border border-blue-900/20 bg-[radial-gradient(circle_at_18%_20%,rgba(59,130,246,0.28),transparent_30%),linear-gradient(135deg,#0f172a,#172554)] p-6 text-white shadow-soft">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 text-blue-100 ring-1 ring-white/15">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-blue-100">Secure checkout</p>
          <h2 className="mt-2 font-display text-3xl font-bold">Stripe is the billing system of record.</h2>
          <p className="mt-3 text-sm leading-6 text-white/72">
            We store only subscription identifiers and plan status. Payment details stay in Stripe, which keeps this MVP
            safer and easier to maintain.
          </p>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        {data.plans.map((plan) => (
          <PlanCard
            key={plan.tier}
            plan={plan}
            currentTier={data.company.planTier}
            hasActiveSubscription={hasActiveSubscription}
            hasStripeCustomer={Boolean(data.company.stripeCustomerId)}
          />
        ))}
      </section>
    </div>
  );
}

function PlanCard({
  plan,
  currentTier,
  hasActiveSubscription,
  hasStripeCustomer
}: {
  plan: BillingPlan;
  currentTier: string;
  hasActiveSubscription: boolean;
  hasStripeCustomer: boolean;
}) {
  const isCurrent = hasActiveSubscription && currentTier === plan.tier;
  const canStartCheckout = Boolean(plan.stripePriceId) && !hasActiveSubscription;
  const canManagePlan = hasActiveSubscription && hasStripeCustomer && !isCurrent;

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-xl border bg-white p-6 shadow-crisp transition duration-200 hover:-translate-y-0.5",
        plan.highlighted ? "border-blue-500 ring-4 ring-blue-100" : "border-[#dbe5f4] hover:border-blue-300"
      )}
    >
      {plan.highlighted ? (
        <div className="absolute right-4 top-4 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-white">
          Popular
        </div>
      ) : null}
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
        <Sparkles className="h-5 w-5" />
      </div>
      <h2 className="mt-5 font-display text-2xl font-bold text-ink">{plan.name}</h2>
      <p className="mt-2 text-sm leading-6 text-coal/70">{plan.description}</p>
      <p className="mt-5 font-display text-4xl font-black text-ink">
        ${plan.price}
        <span className="ml-1 text-sm font-semibold text-coal/50">/mo</span>
      </p>

      <div className="mt-5 space-y-3">
        {plan.features.map((feature) => (
          <p key={feature} className="flex items-center gap-2 text-sm font-semibold text-coal/75">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
            {feature}
          </p>
        ))}
      </div>

      <div className="mt-6">
        {isCurrent ? (
          <Button type="button" className="w-full" variant="outline" disabled>
            Current plan
          </Button>
        ) : hasActiveSubscription ? (
          <form action={createBillingPortalSessionAction}>
            <SubmitButton
              className="w-full"
              pendingLabel="Opening Stripe..."
              disabled={!canManagePlan}
              variant={plan.highlighted ? "primary" : "outline"}
            >
              Switch in Stripe
            </SubmitButton>
          </form>
        ) : (
          <form action={createCheckoutSessionAction}>
            <input type="hidden" name="tier" value={plan.tier} />
            <SubmitButton
              className="w-full"
              pendingLabel="Opening Stripe..."
              disabled={!canStartCheckout}
              variant={plan.highlighted ? "primary" : "outline"}
            >
              {plan.stripePriceId ? `Choose ${plan.name}` : "Missing Stripe price"}
            </SubmitButton>
          </form>
        )}
      </div>
      {hasActiveSubscription && !isCurrent ? (
        <p className="mt-3 text-xs leading-5 text-coal/55">
          Opens Stripe’s customer portal so plan changes stay tied to Stripe invoices and proration.
        </p>
      ) : null}
    </article>
  );
}

function UsageTile({ label, value, limit }: { label: string; value: number; limit?: number }) {
  const percent = limit ? Math.min(100, Math.round((value / limit) * 100)) : 0;

  return (
    <div className="rounded-lg border border-[#dbe5f4] bg-[#f8fbff] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-coal/50">{label}</p>
        <GaugeCircle className="h-4 w-4 text-blue-700" />
      </div>
      <p className="mt-3 font-display text-3xl font-bold text-ink">{value}</p>
      <p className="mt-1 text-xs font-semibold text-coal/55">{limit ? `${value} of ${limit}` : "Choose a plan"}</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e5edf8]">
        <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function BillingNotice({ state }: { state?: string }) {
  const notices: Record<string, { tone: string; message: string }> = {
    success: {
      tone: "border-teal-200 bg-teal-50 text-teal-800",
      message: "Checkout completed. Stripe will sync your subscription shortly."
    },
    cancelled: {
      tone: "border-amber-200 bg-amber-50 text-amber-800",
      message: "Checkout was cancelled. You can choose a plan whenever you are ready."
    },
    "missing-price": {
      tone: "border-red-200 bg-red-50 text-red-700",
      message: "That plan is missing a Stripe price ID. Check the Netlify environment variables."
    },
    "session-error": {
      tone: "border-red-200 bg-red-50 text-red-700",
      message: "Stripe could not create a checkout session. Please try again."
    },
    "no-customer": {
      tone: "border-amber-200 bg-amber-50 text-amber-800",
      message: "No Stripe customer exists yet. Choose a plan first to create billing access."
    },
    "plan-required": {
      tone: "border-amber-200 bg-amber-50 text-amber-800",
      message: "Choose a plan before publishing calculators to customers."
    },
    "calculator-limit": {
      tone: "border-amber-200 bg-amber-50 text-amber-800",
      message: "You have reached the published calculator limit for your current plan."
    }
  };
  const notice = state ? notices[state] : null;

  if (!notice) {
    return null;
  }

  return <div className={cn("rounded-lg border px-4 py-3 text-sm font-semibold", notice.tone)}>{notice.message}</div>;
}

function getStatusTone(status: string | null | undefined): "neutral" | "success" | "warning" | "danger" {
  if (status === "active" || status === "trialing") return "success";
  if (status === "past_due" || status === "unpaid" || status === "incomplete") return "warning";
  if (status === "canceled") return "danger";
  return "neutral";
}

function formatSubscriptionStatus(status: string | null | undefined) {
  if (!status || status === "NONE") return "No active plan";

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
