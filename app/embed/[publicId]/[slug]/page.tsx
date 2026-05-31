import type { Metadata } from "next";
import { EmbedResizeReporter } from "@/components/embed-resize-reporter";
import { PublicQuoteForm } from "@/components/public-quote-form";
import { QuoteBrandMark } from "@/components/quote-brand-mark";
import { getQuoteCalculatorByPublicId } from "@/lib/calculator-data";
import { buildPublicCalculatorFrameKey, buildPublicEmbedPath } from "@/lib/public-calculator-paths";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Embedded Quote Calculator",
  robots: {
    index: false,
    follow: false
  }
};

export default async function SecureEmbedQuotePage({
  params,
  searchParams
}: {
  params: Promise<{ publicId: string; slug: string }>;
  searchParams: Promise<{ embedded?: string; legal?: string; returnLabel?: string; returnUrl?: string; submitted?: string }>;
}) {
  const { publicId, slug } = await params;
  const { embedded, legal, returnLabel, returnUrl, submitted } = await searchParams;
  const frameKey = buildPublicCalculatorFrameKey({ publicId, slug });
  const calculator = await getQuoteCalculatorByPublicId(publicId, slug);
  const isEmbeddedInHostPage = embedded === "1";
  const safeReturnUrl = getSafeReturnUrl(returnUrl);
  const safeReturnLabel = getSafeReturnLabel(returnLabel, safeReturnUrl);

  if (!calculator || !calculator.isPublished) {
    return (
      <main className="min-h-[420px] bg-white px-4 py-6 text-ink">
        <EmbedResizeReporter frameKey={frameKey} />
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
      <EmbedResizeReporter frameKey={frameKey} />
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
          hostReturnLabel={isEmbeddedInHostPage ? null : safeReturnLabel}
          hostReturnUrl={isEmbeddedInHostPage ? null : safeReturnUrl}
          submitted={submitted === "1"}
          variant="embed"
          legalRequired={legal === "required"}
          returnTo={buildEmbedReturnPath(buildPublicEmbedPath(calculator), {
            isEmbeddedInHostPage,
            returnLabel: safeReturnLabel,
            returnUrl: safeReturnUrl
          })}
        />
        <p className="mt-4 text-center text-xs font-semibold text-coal/45">Powered by QuoteBuilder Pro</p>
      </section>
    </main>
  );
}

function buildEmbedReturnPath(
  basePath: string,
  {
    isEmbeddedInHostPage,
    returnLabel,
    returnUrl
  }: {
    isEmbeddedInHostPage: boolean;
    returnLabel: string | null;
    returnUrl: string | null;
  }
) {
  const params = new URLSearchParams();

  if (isEmbeddedInHostPage) params.set("embedded", "1");
  if (returnUrl) params.set("returnUrl", returnUrl);
  if (returnLabel) params.set("returnLabel", returnLabel);

  const query = params.toString();

  return query ? `${basePath}?${query}` : basePath;
}

function getSafeReturnUrl(value: string | undefined) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function getSafeReturnLabel(value: string | undefined, returnUrl: string | null) {
  const label = value?.trim().replace(/\s+/g, " ").slice(0, 90);

  if (label) return label;
  if (!returnUrl) return null;

  try {
    return new URL(returnUrl).hostname.replace(/^www\./, "");
  } catch {
    return "website";
  }
}
