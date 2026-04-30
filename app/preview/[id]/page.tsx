import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PublicQuoteForm } from "@/components/public-quote-form";
import { QuoteBrandMark } from "@/components/quote-brand-mark";
import { getQuoteCalculatorPreviewById } from "@/lib/calculator-data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Calculator Preview",
  robots: {
    index: false,
    follow: false
  }
};

export default async function CalculatorPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const calculator = await getQuoteCalculatorPreviewById(id);

  if (!calculator) {
    notFound();
  }

  const brand = calculator.branding;

  return (
    <main className="min-h-screen bg-white px-3 py-4 text-ink sm:px-5 sm:py-6">
      <section className="mx-auto max-w-5xl">
        <div className="mb-5 rounded-xl border border-line bg-paper p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <QuoteBrandMark branding={brand} size="sm" />
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em]" style={{ color: brand.primaryColor }}>
                Owner preview
              </p>
              <h1 className="mt-2 font-display text-3xl font-black leading-tight text-ink">{calculator.name}</h1>
              <p className="mt-2 text-sm leading-6 text-coal/70">{brand.introText}</p>
              {!calculator.isPublished ? (
                <p className="mt-2 text-xs font-semibold text-amber-800">
                  Draft calculators are preview-only until you publish them.
                </p>
              ) : null}
            </div>
            <Link
              href={`/dashboard/calculators/${calculator.id}`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-bold text-ink transition hover:border-teal-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to editor
            </Link>
          </div>
        </div>
        <PublicQuoteForm calculator={calculator} variant="embed" allowSubmission={false} returnTo={`/preview/${id}`} />
      </section>
    </main>
  );
}
