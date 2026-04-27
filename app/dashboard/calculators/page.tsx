import { FilePlus2 } from "lucide-react";
import { ButtonLink } from "@/components/button";
import { CalculatorCard } from "@/components/calculator-card";
import { PageHeader } from "@/components/page-header";
import { calculators } from "@/lib/mock-data";

export default function CalculatorsPage() {
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
      <section className="grid gap-4 xl:grid-cols-2">
        {calculators.map((calculator) => (
          <CalculatorCard key={calculator.id} calculator={calculator} />
        ))}
      </section>
    </div>
  );
}
