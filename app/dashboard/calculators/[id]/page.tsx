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
        description="Add questions and pricing rules that power the public quote calculation engine."
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
