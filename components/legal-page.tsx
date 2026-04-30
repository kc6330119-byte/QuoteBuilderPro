import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { legalLastUpdated } from "@/lib/legal-content";

type LegalSection = {
  title: string;
  body: string[];
  bullets?: string[];
};

export function LegalPage({
  eyebrow,
  title,
  description,
  sections
}: {
  eyebrow: string;
  title: string;
  description: string;
  sections: LegalSection[];
}) {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <section className="relative overflow-hidden border-b border-line bg-white">
        <div className="surface-grid absolute inset-0 opacity-35" />
        <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-coal/70 transition hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> Back to QuoteBuilder Pro
          </Link>
          <div className="mt-12 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              {eyebrow}
            </div>
            <h1 className="mt-5 font-display text-4xl font-black leading-tight text-ink md:text-6xl">{title}</h1>
            <p className="mt-5 text-base leading-8 text-coal/70">{description}</p>
            <p className="mt-4 text-sm font-semibold text-coal/55">Last updated: {legalLastUpdated}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
          This page contains starter policy language and is not legal advice. Have a licensed attorney review your final
          terms, privacy policy, customer agreements, and state-specific obligations before relying on them commercially.
        </div>

        <div className="mt-6 space-y-4">
          {sections.map((section) => (
            <article key={section.title} className="rounded-xl border border-line bg-white p-5 shadow-crisp">
              <h2 className="font-display text-xl font-bold text-ink">{section.title}</h2>
              <div className="mt-3 space-y-3">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-7 text-coal/75">
                    {paragraph}
                  </p>
                ))}
                {section.bullets ? (
                  <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-coal/75">
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
