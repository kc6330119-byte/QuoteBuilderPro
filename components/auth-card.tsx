import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function AuthCard({
  children,
  title,
  description
}: {
  children: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <main className="min-h-screen bg-[#f7faff] text-ink">
      <div className="surface-grid fixed inset-0 opacity-40" />
      <section className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-coal/70 transition hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <div className="mt-10 max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">QuoteBuilder Pro</p>
            <h1 className="mt-3 font-display text-5xl font-black leading-tight text-ink">{title}</h1>
            <p className="mt-4 text-base leading-8 text-coal/70">{description}</p>
          </div>
          <div className="mt-8 rounded-xl border border-[#dbe5f4] bg-white p-5 shadow-crisp">
            <p className="text-sm font-bold text-ink">Protected workspaces</p>
            <p className="mt-2 text-sm leading-6 text-coal/70">
              Dashboards, calculators, and leads are scoped to the signed-in company workspace. Public quote pages stay
              available only for published calculators.
            </p>
          </div>
        </div>
        <div className="flex justify-center lg:justify-end">{children}</div>
      </section>
    </main>
  );
}
