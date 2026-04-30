import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getBillingPlanByPriceId, getBillingPlanByTier } from "@/lib/plans";
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
    console.error("Stripe webhook handling failed", error);
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
      select: { id: true }
    });

    if (company) {
      return company;
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
