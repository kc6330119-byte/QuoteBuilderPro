ALTER TABLE "Company" ADD COLUMN "stripeCustomerId" TEXT;
ALTER TABLE "Company" ADD COLUMN "stripeSubscriptionId" TEXT;
ALTER TABLE "Company" ADD COLUMN "stripePriceId" TEXT;
ALTER TABLE "Company" ADD COLUMN "planTier" TEXT NOT NULL DEFAULT 'FREE';
ALTER TABLE "Company" ADD COLUMN "subscriptionStatus" TEXT NOT NULL DEFAULT 'NONE';
ALTER TABLE "Company" ADD COLUMN "subscriptionCurrentPeriodEnd" TIMESTAMP(3);

CREATE UNIQUE INDEX "Company_stripeCustomerId_key" ON "Company"("stripeCustomerId");
CREATE UNIQUE INDEX "Company_stripeSubscriptionId_key" ON "Company"("stripeSubscriptionId");
