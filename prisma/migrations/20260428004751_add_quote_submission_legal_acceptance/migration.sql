-- AlterTable
ALTER TABLE "QuoteSubmission" ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ADD COLUMN     "acceptedEstimateDisclaimer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "acceptedLegalTerms" BOOLEAN NOT NULL DEFAULT false;
