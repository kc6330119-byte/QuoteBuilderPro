ALTER TABLE "Calculator" ADD COLUMN "publicId" TEXT;

UPDATE "Calculator"
SET "publicId" = 'qb-' || substr(md5(random()::text || clock_timestamp()::text || id), 1, 12)
WHERE "publicId" IS NULL;

ALTER TABLE "Calculator" ALTER COLUMN "publicId" SET NOT NULL;

CREATE UNIQUE INDEX "Calculator_publicId_key" ON "Calculator"("publicId");

DROP INDEX IF EXISTS "Calculator_slug_key";
