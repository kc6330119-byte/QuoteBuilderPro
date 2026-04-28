import { EmbedResizeReporter } from "@/components/embed-resize-reporter";
import { PublicQuoteForm } from "@/components/public-quote-form";
import { QuoteBrandMark } from "@/components/quote-brand-mark";
import { getQuoteCalculatorBySlug } from "@/lib/calculator-data";

export const dynamic = "force-dynamic";

export default async function EmbedQuotePage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ legal?: string; submitted?: string }>;
}) {
  const { slug } = await params;
  const { legal, submitted } = await searchParams;
  const calculator = await getQuoteCalculatorBySlug(slug);

  if (!calculator || !calculator.isPublished) {
    return (
      <main className="min-h-[420px] bg-white px-4 py-6 text-ink">
        <EmbedResizeReporter slug={slug} />
        <section className="mx-auto max-w-3xl rounded-xl border border-line bg-paper p-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Quote unavailable</p>
          <h1 className="mt-3 font-display text-2xl font-bold text-ink">This quote calculator is not available.</h1>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-coal/70">
            The calculator may be unpublished or no longer active. Please contact the business for a quote.
          </p>
        </section>
      </main>
    );
  }

  const brand = calculator.branding;

  return (
    <main className="min-h-screen bg-white px-3 py-4 text-ink sm:px-5 sm:py-6">
      <EmbedResizeReporter slug={slug} />
      <section className="mx-auto max-w-5xl">
        <div className="mb-5 rounded-xl border border-line bg-paper p-4">
          <QuoteBrandMark branding={brand} size="sm" />
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em]" style={{ color: brand.primaryColor }}>
            Instant estimate
          </p>
          <h1 className="mt-2 font-display text-3xl font-black leading-tight text-ink">{calculator.name}</h1>
          <p className="mt-2 text-sm leading-6 text-coal/70">{brand.introText}</p>
        </div>
        <PublicQuoteForm
          calculator={calculator}
          submitted={submitted === "1"}
          variant="embed"
          legalRequired={legal === "required"}
        />
        <p className="mt-4 text-center text-xs font-semibold text-coal/45">Powered by QuoteBuilder Pro</p>
      </section>
    </main>
  );
}
