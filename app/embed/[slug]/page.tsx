import type { Metadata } from "next";
import { EmbedResizeReporter } from "@/components/embed-resize-reporter";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Embedded Quote Calculator",
  robots: {
    index: false,
    follow: false
  }
};

export default async function EmbedQuotePage({
  params
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ legal?: string; submitted?: string }>;
}) {
  const { slug } = await params;

  return (
    <main className="min-h-[420px] bg-white px-4 py-6 text-ink">
      <EmbedResizeReporter frameKey={slug} />
      <section className="mx-auto max-w-3xl rounded-xl border border-line bg-paper p-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Quote unavailable</p>
        <h1 className="mt-3 font-display text-2xl font-bold text-ink">This quote calculator is not available.</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-coal/70">
          This calculator may have a newer secure embed code. Please contact the business for a quote.
        </p>
      </section>
    </main>
  );
}
