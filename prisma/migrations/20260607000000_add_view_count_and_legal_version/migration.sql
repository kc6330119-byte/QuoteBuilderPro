-- Add lifetime view counter for conversion reporting.
ALTER TABLE "Calculator" ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0;

-- Record which terms version a lead accepted at submission time.
ALTER TABLE "QuoteSubmission" ADD COLUMN "acceptedLegalVersion" TEXT;
