import { ArrowUpRight, BarChart3, CalendarDays } from "lucide-react";
import { Badge } from "@/components/badge";
import { Button, ButtonLink } from "@/components/button";
import type { CalculatorListItem } from "@/lib/calculator-data";
import { formatDate, formatDollars } from "@/lib/utils";

export function CalculatorCard({ calculator }: { calculator: CalculatorListItem }) {
  return (
    <article className="rounded-lg border border-[#dbe5f4] bg-white p-5 shadow-crisp transition duration-200 hover:-translate-y-0.5 hover:border-blue-500">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-lg font-bold text-ink">{calculator.name}</h2>
            <Badge tone={calculator.status === "PUBLISHED" ? "success" : "warning"}>{calculator.status}</Badge>
          </div>
          <p className="mt-2 text-sm leading-6 text-coal/70">{calculator.description}</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 border-y border-[#dbe5f4] py-4 text-sm">
        <div>
          <p className="text-coal/60">Leads</p>
          <p className="mt-1 font-semibold text-ink">{calculator.leads}</p>
        </div>
        <div>
          <p className="text-coal/60">Avg quote</p>
          <p className="mt-1 font-semibold text-ink">{formatDollars(calculator.avgQuote)}</p>
        </div>
        <div>
          <p className="text-coal/60">Convert</p>
          <p className="mt-1 font-semibold text-ink">{calculator.conversionRate}%</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-4 text-xs text-coal/60">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(calculator.updatedAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            {calculator.questionCount} questions
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href={`/dashboard/calculators/${calculator.id}`} variant="ghost" size="sm">
            Manage
          </ButtonLink>
          {calculator.status === "PUBLISHED" ? (
            <ButtonLink href={`/quote/${calculator.slug}`} variant="outline" size="sm">
              View quote <ArrowUpRight className="h-4 w-4" />
            </ButtonLink>
          ) : (
            <Button type="button" variant="outline" size="sm" disabled title="Publish this calculator before viewing it">
              Publish first
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
