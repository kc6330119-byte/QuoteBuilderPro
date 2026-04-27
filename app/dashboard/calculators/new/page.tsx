import { CalculatorBuilderForm } from "@/components/calculator-builder-form";
import { PageHeader } from "@/components/page-header";

export default function NewCalculatorPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Create calculator"
        description="Draft a pricing calculator with base pricing, customer questions, and a live public-page preview."
      />
      <CalculatorBuilderForm />
    </div>
  );
}
