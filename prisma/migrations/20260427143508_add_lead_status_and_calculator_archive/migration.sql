-- AlterTable
ALTER TABLE "Calculator" ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "QuoteSubmission" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'NEW';
