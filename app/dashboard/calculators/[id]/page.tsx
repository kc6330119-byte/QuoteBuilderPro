import { notFound } from "next/navigation";
import { CalculatorEditor } from "@/components/calculator-editor";
import { ButtonLink } from "@/components/button";
import { PageHeader } from "@/components/page-header";
import { getCalculatorEditorById } from "@/lib/calculator-data";

export const dynamic = "force-dynamic";

export default async function CalculatorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const calculator = await getCalculatorEditorById(id);

  if (!calculator) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Calculator editor"
        description="Build the questions and set the prices that power your customer's instant estimate."
        actions={
          <ButtonLink href="/dashboard/calculators" variant="outline">
            Back to calculators
          </ButtonLink>
        }
      />
      <CalculatorEditor calculator={calculator} />
    </div>
  );
}
