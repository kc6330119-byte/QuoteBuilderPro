import { FilePlus2 } from "lucide-react";
import { ButtonLink } from "@/components/button";
import { CalculatorCard } from "@/components/calculator-card";
import { PageHeader } from "@/components/page-header";
import { getCalculatorListItems } from "@/lib/calculator-data";

export const dynamic = "force-dynamic";

export default async function CalculatorsPage() {
  const calculators = await getCalculatorListItems();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Calculators"
        description="Create, publish, and monitor the quote calculators that feed your lead pipeline."
        actions={
          <ButtonLink href="/dashboard/calculators/new">
            <FilePlus2 className="h-4 w-4" /> New calculator
          </ButtonLink>
        }
      />
      {calculators.length > 0 ? (
        <section className="grid gap-4 xl:grid-cols-2">
          {calculators.map((calculator) => (
            <CalculatorCard key={calculator.id} calculator={calculator} />
          ))}
        </section>
      ) : (
        <section className="rounded-lg border border-[#dbe5f4] bg-white p-8 text-center shadow-crisp">
          <h2 className="font-display text-2xl font-bold text-ink">Create your first calculator</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-coal/70">
            Saved calculators will appear here with their public quote link and lead performance.
          </p>
          <ButtonLink href="/dashboard/calculators/new" className="mt-5">
            <FilePlus2 className="h-4 w-4" /> New calculator
          </ButtonLink>
        </section>
      )}
    </div>
  );
}
