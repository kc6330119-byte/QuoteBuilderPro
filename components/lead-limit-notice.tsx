import Link from "next/link";
import type { LeadUsage } from "@/lib/entitlements";

// Store + nudge: leads are always saved, so this only prompts an upgrade once the workspace reaches its
// plan's monthly lead limit. Renders nothing while under the limit.
export function LeadLimitNotice({ usage }: { usage: LeadUsage }) {
  if (!usage.overLimit) {
    return null;
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-900">
      {usage.limit > 0
        ? `You've reached your plan's monthly limit of ${usage.limit} leads (${usage.used} captured this month). New leads are still saved — `
        : "Your current plan doesn't include leads. New submissions are still saved — "}
      <Link href="/dashboard/billing" className="underline underline-offset-2">
        upgrade to keep capturing without limits
      </Link>
      .
    </div>
  );
}
