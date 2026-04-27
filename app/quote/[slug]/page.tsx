import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PublicQuoteForm } from "@/components/public-quote-form";
import { getCalculatorBySlug } from "@/lib/mock-data";

export default async function QuotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const calculator = getCalculatorBySlug(slug);

  if (!calculator || calculator.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-coal/70 transition hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> QuoteBuilder Pro
          </Link>
          <span className="rounded-full border border-line bg-paper px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-teal-700">
            Public quote
          </span>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Instant estimate</p>
          <h1 className="mt-3 font-display text-4xl font-black leading-tight text-ink md:text-5xl">{calculator.name}</h1>
          <p className="mt-4 text-lg leading-8 text-coal/70">{calculator.description}</p>
        </div>
        <PublicQuoteForm calculator={calculator} />
      </section>
    </main>
  );
}
