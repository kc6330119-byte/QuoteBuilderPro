import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { Prisma } from "@prisma/client";
import type Stripe from "stripe";
import { getBillingPlanByPriceId, getBillingPlanByTier, isPaidSubscriptionStatus } from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SyncFallback = {
  companyId?: string | null;
  customerId?: string | null;
};

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = (await headers()).get("stripe-signature");

  if (!webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook secret is not configured." }, { status: 500 });
  }

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid Stripe webhook payload.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Idempotency: atomically claim this event id. A unique-constraint violation means we already processed
  // it (Stripe redelivery/replay) — skip. The claim is rolled back below if processing fails, so retries work.
  try {
    await prisma.webhookEvent.create({ data: { id: event.id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    throw error;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        break;
    }
  } catch (error) {
    Sentry.captureException(error);
    console.error("Stripe webhook handling failed", error);
    // Release the idempotency claim so Stripe's retry can reprocess this event.
    await prisma.webhookEvent.delete({ where: { id: event.id } }).catch(() => {});
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const subscriptionId = getObjectId(session.subscription);

  if (!subscriptionId) {
    return;
  }

  const subscription = await getStripe().subscriptions.retrieve(subscriptionId);

  await syncSubscription(subscription, {
    companyId: session.client_reference_id ?? session.metadata?.companyId,
    customerId: getObjectId(session.customer)
  });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = getObjectId(invoice.customer);

  if (!customerId) {
    return;
  }

  await prisma.company.updateMany({
    where: { stripeCustomerId: customerId },
    data: { subscriptionStatus: "past_due" }
  });
}

async function syncSubscription(subscription: Stripe.Subscription, fallback: SyncFallback = {}) {
  const customerId = getObjectId(subscription.customer) ?? fallback.customerId ?? null;
  const subscriptionItem = subscription.items.data[0];
  const priceId = subscriptionItem?.price?.id ?? null;
  const planFromPrice = getBillingPlanByPriceId(priceId);
  const planFromMetadata = getBillingPlanByTier(subscription.metadata?.planTier);
  const plan = planFromPrice ?? planFromMetadata;
  const isCanceled = subscription.status === "canceled";
  const company = await findSubscriptionCompany({
    companyId: subscription.metadata?.companyId ?? fallback.companyId,
    customerId,
    subscriptionId: subscription.id
  });

  if (!company) {
    console.warn("Stripe subscription webhook could not find a company", {
      subscriptionId: subscription.id,
      customerId,
      companyId: subscription.metadata?.companyId ?? fallback.companyId
    });
    return;
  }

  await prisma.company.update({
    where: { id: company.id },
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: isCanceled ? null : priceId,
      planTier: isCanceled ? "FREE" : plan?.tier ?? "FREE",
      subscriptionStatus: subscription.status,
      subscriptionCurrentPeriodEnd: subscriptionItem?.current_period_end
        ? new Date(subscriptionItem.current_period_end * 1000)
        : null
    }
  });

  // Reconcile published calculators with the new plan so cancellations/downgrades stop serving paid
  // functionality. Terminal states drop to 0; active/trialing enforce the plan's limit; grace states
  // (past_due, incomplete) keep calculators live (effectiveLimit stays null and we skip enforcement).
  const isTerminal = subscription.status === "canceled" || subscription.status === "unpaid";
  const effectiveLimit = isTerminal
    ? 0
    : isPaidSubscriptionStatus(subscription.status)
      ? plan?.calculatorLimit ?? 0
      : null;

  if (effectiveLimit !== null) {
    await enforcePublishedCalculatorLimit(company.id, effectiveLimit);
  }
}

// Keeps at most `limit` published calculators (most-recently-updated first), unpublishing the rest and
// busting their cached public pages. limit = 0 unpublishes everything (cancel/unpaid).
async function enforcePublishedCalculatorLimit(companyId: string, limit: number) {
  const published = await prisma.calculator.findMany({
    where: { companyId, isPublished: true, isArchived: false },
    orderBy: { updatedAt: "desc" },
    select: { id: true, publicId: true }
  });

  if (published.length <= limit) {
    return;
  }

  const toUnpublish = published.slice(limit);
  await prisma.calculator.updateMany({
    where: { id: { in: toUnpublish.map((calculator) => calculator.id) } },
    data: { isPublished: false }
  });

  for (const calculator of toUnpublish) {
    revalidateTag(`calculator:${calculator.publicId}`, "max");
  }
}

async function findSubscriptionCompany({
  companyId,
  customerId,
  subscriptionId
}: {
  companyId?: string | null;
  customerId?: string | null;
  subscriptionId: string;
}) {
  if (companyId) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, stripeCustomerId: true }
    });

    // Trust the metadata companyId only when it's consistent with the event's customer (no customer set
    // yet on first checkout, or it matches) — prevents applying a subscription to the wrong tenant.
    if (company && (!company.stripeCustomerId || !customerId || company.stripeCustomerId === customerId)) {
      return { id: company.id };
    }
  }

  if (customerId) {
    const company = await prisma.company.findUnique({
      where: { stripeCustomerId: customerId },
      select: { id: true }
    });

    if (company) {
      return company;
    }
  }

  return prisma.company.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
    select: { id: true }
  });
}

function getObjectId(value: string | { id: string } | null | undefined) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}
