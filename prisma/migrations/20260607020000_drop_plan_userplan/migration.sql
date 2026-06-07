-- Drop vestigial tables. The Plan / UserPlan models were created in the init migration and never read or
-- written by application code (billing resolves through lib/plans.ts + Company billing fields). These
-- tables are expected to be empty; verify before applying in production.
DROP TABLE "UserPlan";
DROP TABLE "Plan";
