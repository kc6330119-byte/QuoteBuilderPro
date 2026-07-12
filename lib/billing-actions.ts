"use server";

import { redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/auth";
import { getAppUrl, getStripe } from "@/lib/stripe";
import { getBillingPlanByTier } from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { SITE_DISABLED } from "@/lib/site-config";

export async function createCheckoutSessionAction(formData: FormData) {
  // Parked-site mode: never let a new subscription start.
  if (SITE_DISABLED) {
    redirect("/dashboard/billing?checkout=unavailable");
  }

  const workspace = await getCurrentWorkspace();
  const tier = String(formData.get("tier") ?? "");
  const plan = getBillingPlanByTier(tier);

  if (!plan || !plan.stripePriceId) {
    redirect("/dashboard/billing?checkout=missing-price");
  }

  const stripe = getStripe();
  const appUrl = getAppUrl();
  const company = await prisma.company.findUnique({
    where: { id: workspace.companyId },
    select: {
      id: true,
      name: true,
      stripeCustomerId: true
    }
  });

  if (!company) {
    redirect("/dashboard/billing?checkout=company-missing");
  }

  let customerId = company.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      name: company.name,
      email: workspace.email,
      metadata: {
        companyId: company.id,
        userId: workspace.id
      }
    });
    customerId = customer.id;

    await prisma.company.update({
      where: { id: company.id },
      data: { stripeCustomerId: customerId }
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price: plan.stripePriceId,
        quantity: 1
      }
    ],
    allow_promotion_codes: true,
    client_reference_id: company.id,
    metadata: {
      companyId: company.id,
      planTier: plan.tier
    },
    subscription_data: {
      metadata: {
        companyId: company.id,
        planTier: plan.tier
      }
    },
    success_url: `${appUrl}/dashboard/billing?checkout=success`,
    cancel_url: `${appUrl}/dashboard/billing?checkout=cancelled`
  });

  if (!session.url) {
    redirect("/dashboard/billing?checkout=session-error");
  }

  redirect(session.url);
}

export async function createBillingPortalSessionAction() {
  const workspace = await getCurrentWorkspace();
  const company = await prisma.company.findUnique({
    where: { id: workspace.companyId },
    select: {
      stripeCustomerId: true
    }
  });

  if (!company?.stripeCustomerId) {
    redirect("/dashboard/billing?checkout=no-customer");
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: company.stripeCustomerId,
    return_url: `${getAppUrl()}/dashboard/billing`
  });

  redirect(session.url);
}
