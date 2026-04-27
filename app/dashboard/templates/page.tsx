import { FilePlus2 } from "lucide-react";
import { ButtonLink } from "@/components/button";
import { PageHeader } from "@/components/page-header";
import { TemplateCard } from "@/components/template-card";
import { calculatorTemplates } from "@/lib/templates";

export default async function TemplatesPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const creationFailed = params.error === "template-create-failed";

  return (
    <div className="space-y-8">
      <PageHeader
        title="Templates"
        description="Pick a starter calculator, then customize questions and pricing rules in the editor before publishing."
        actions={
          <ButtonLink href="/dashboard/calculators/new" variant="outline">
            <FilePlus2 className="h-4 w-4" /> Build from scratch
          </ButtonLink>
        }
      />

      {creationFailed ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          We could not create that template calculator. Please try again or choose another template.
        </div>
      ) : null}

      <section className="rounded-xl border border-line bg-[radial-gradient(circle_at_top_left,rgba(13,148,136,0.14),transparent_34%),linear-gradient(135deg,#ffffff,#f5f4ef)] p-5 shadow-crisp">
        <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Template library</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-ink">Fast starts, not locked-in presets.</h2>
          </div>
          <p className="text-sm leading-6 text-coal/70">
            These templates intentionally start light. Each one creates a draft calculator with a base pricing rule, so
            you can shape the actual questions and quote math around the customer’s business.
          </p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {calculatorTemplates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </section>
    </div>
  );
}
