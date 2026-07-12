import { after } from "next/server";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { PublicQuoteForm } from "@/components/public-quote-form";
import { QuoteBrandMark } from "@/components/quote-brand-mark";
import { QuoteUnavailable } from "@/components/quote-unavailable";
import { getQuoteCalculatorByPublicId, recordCalculatorView } from "@/lib/calculator-data";
import { SITE_DISABLED } from "@/lib/site-config";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Quote Calculator",
  robots: {
    index: false,
    follow: false
  }
};

export default async function SecureQuotePage({
  params,
  searchParams
}: {
  params: Promise<{ publicId: string; slug: string }>;
  searchParams: Promise<{ legal?: string; submitted?: string }>;
}) {
  const { publicId, slug } = await params;
  const { legal, submitted } = await searchParams;
  const calculator = SITE_DISABLED ? null : await getQuoteCalculatorByPublicId(publicId, slug);

  if (SITE_DISABLED || !calculator || !calculator.isPublished) {
    return <QuoteUnavailable />;
  }

  // Count the visit for conversion reporting after the response is sent; skip post-submit reloads.
  if (submitted !== "1") {
    after(() => recordCalculatorView(publicId));
  }

  const brand = calculator.branding;

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <QuoteBrandMark branding={brand} />
          {calculator.hideBranding ? null : (
            <Link
              href="/?utm_source=quote&utm_medium=powered_by"
              className="hidden items-center gap-2 text-sm font-semibold text-coal/55 transition hover:text-ink sm:flex"
            >
              <ArrowLeft className="h-4 w-4" /> Powered by QuoteBuilder Pro
            </Link>
          )}
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: brand.primaryColor }}>
            Instant estimate
          </p>
          <h1 className="mt-3 font-display text-4xl font-black leading-tight text-ink md:text-5xl">{calculator.name}</h1>
          <p className="mt-4 text-lg leading-8 text-coal/70">{brand.introText}</p>
        </div>
        <PublicQuoteForm calculator={calculator} submitted={submitted === "1"} legalRequired={legal === "required"} />
      </section>
    </main>
  );
}
