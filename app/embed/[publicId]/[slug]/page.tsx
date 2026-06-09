import { after } from "next/server";
import type { Metadata } from "next";
import { EmbedResizeReporter } from "@/components/embed-resize-reporter";
import { PublicQuoteForm } from "@/components/public-quote-form";
import { QuoteBrandMark } from "@/components/quote-brand-mark";
import { getQuoteCalculatorByPublicId, recordCalculatorView } from "@/lib/calculator-data";
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
  const { embedded, legal, returnUrl, submitted } = await searchParams;
  const frameKey = buildPublicCalculatorFrameKey({ publicId, slug });
  const calculator = await getQuoteCalculatorByPublicId(publicId, slug);
  const isEmbeddedInHostPage = embedded === "1";
  const safeReturnUrl = getSafeReturnUrl(returnUrl);
  const safeReturnLabel = getSafeReturnLabel(safeReturnUrl);

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

  // Count the visit for conversion reporting after the response is sent; skip post-submit reloads.
  if (submitted !== "1") {
    after(() => recordCalculatorView(publicId));
  }

  const brand = calculator.branding;

  return (
    <main className="flex h-[100dvh] flex-col overflow-hidden bg-white text-ink">
      <EmbedResizeReporter frameKey={frameKey} />
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-paper px-4 py-3 sm:px-5">
        <QuoteBrandMark branding={brand} size="sm" />
        <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: brand.primaryColor }}>
          Instant estimate
        </span>
      </header>
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
    // Only honor real web destinations (blocks javascript:/data: and other schemes).
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

// Always derive the visible label from the actual destination host. A hand-crafted returnUrl therefore
// cannot display a spoofed brand name ("Return to YourBank") — the user always sees where the link goes.
function getSafeReturnLabel(returnUrl: string | null) {
  if (!returnUrl) return null;

  try {
    return new URL(returnUrl).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
