import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function QuoteUnavailable() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-coal/70 transition hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> QuoteBuilder Pro
          </Link>
          <span className="rounded-full border border-line bg-paper px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-teal-700">
            Quote unavailable
          </span>
        </div>
      </header>
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-line bg-white p-8 text-center shadow-crisp">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Quote unavailable</p>
          <h1 className="mt-3 font-display text-3xl font-bold text-ink">This quote calculator is not available.</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-coal/70">
            The calculator may still be in draft mode, may no longer be active, or may have a newer secure sharing link.
            Please contact the business for a quote.
          </p>
        </div>
      </section>
    </main>
  );
}
