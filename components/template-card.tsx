import { ArrowRight, Layers3 } from "lucide-react";
import { SubmitButton } from "@/components/submit-button";
import { useTemplateAction } from "@/lib/template-actions";
import type { CalculatorTemplate } from "@/lib/templates";
import { cn } from "@/lib/utils";

export function TemplateCard({ template }: { template: CalculatorTemplate }) {
  return (
    <article className="group relative overflow-hidden rounded-lg border border-line bg-white p-5 shadow-crisp transition duration-200 hover:-translate-y-0.5 hover:border-teal-600">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-700 via-ink to-amber-600 opacity-0 transition group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-4">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-md text-white shadow-crisp", template.accent)}>
          <Layers3 className="h-5 w-5" />
        </div>
        <span className="rounded-full border border-line bg-paper px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-coal/60">
          Starter
        </span>
      </div>
      <h2 className="mt-5 font-display text-xl font-bold text-ink">{template.name}</h2>
      <p className="mt-2 min-h-[72px] text-sm leading-6 text-coal/70">{template.description}</p>
      <div className="mt-5 border-t border-line pt-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-coal/50">Business type</p>
        <p className="mt-1 text-sm font-semibold text-coal">{template.businessType}</p>
      </div>
      <form action={useTemplateAction} className="mt-5">
        <input type="hidden" name="templateId" value={template.id} />
        <SubmitButton className="w-full" variant="secondary" pendingLabel="Creating calculator...">
          Use Template <ArrowRight className="h-4 w-4" />
        </SubmitButton>
      </form>
    </article>
  );
}
