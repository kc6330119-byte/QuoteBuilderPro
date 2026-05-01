CREATE INDEX "User_companyId_createdAt_idx" ON "User"("companyId", "createdAt");

CREATE INDEX "Calculator_userId_idx" ON "Calculator"("userId");
CREATE INDEX "Calculator_company_archive_updated_idx" ON "Calculator"("companyId", "isArchived", "updatedAt" DESC);
CREATE INDEX "Calculator_company_publish_archive_idx" ON "Calculator"("companyId", "isPublished", "isArchived");

CREATE INDEX "Question_calculator_sort_idx" ON "Question"("calculatorId", "sortOrder");

CREATE INDEX "PricingRule_calculator_sort_idx" ON "PricingRule"("calculatorId", "sortOrder");
CREATE INDEX "PricingRule_questionId_idx" ON "PricingRule"("questionId");

CREATE INDEX "QuoteSubmission_calculator_created_idx" ON "QuoteSubmission"("calculatorId", "createdAt" DESC);

CREATE INDEX "UserPlan_userId_idx" ON "UserPlan"("userId");
CREATE INDEX "UserPlan_planId_idx" ON "UserPlan"("planId");
