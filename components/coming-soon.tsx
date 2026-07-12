import Link from "next/link";

// Parked-site splash shown on the homepage when SITE_DISABLED is true.
// Intentionally minimal: no sign-in / sign-up buttons, no marketing, no forms —
// just a calm "coming soon" so the site can go dormant without inviting signups.
export function ComingSoon() {
  return (
    <main className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f3f8ff_100%)] px-6 text-center text-ink">
      <div className="surface-grid absolute inset-0 opacity-40" />
      <div className="absolute left-1/2 top-24 hidden h-[26rem] w-[34rem] -translate-x-1/2 rounded-full bg-[#dbeafe] opacity-60 blur-3xl sm:block" />

      <div className="relative z-10 flex flex-col items-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1d4ed8] font-display text-2xl font-bold text-white shadow-crisp">
          QB
        </span>
        <p className="mt-6 text-sm font-bold uppercase tracking-[0.24em] text-[#2563eb]">QuoteBuilder Pro</p>
        <h1 className="mt-5 font-display text-5xl font-black leading-[1.02] text-[#111827] sm:text-6xl">Coming soon</h1>
        <p className="mt-5 max-w-md text-lg leading-8 text-[#475569]">
          We&apos;re putting the finishing touches on QuoteBuilder Pro. New signups are paused for now — please check back
          soon.
        </p>
      </div>

      <footer className="relative z-10 mt-16 flex items-center gap-5 text-sm font-semibold text-[#64748b]">
        <Link href="/terms" className="transition hover:text-[#1d4ed8]">
          Terms
        </Link>
        <Link href="/privacy" className="transition hover:text-[#1d4ed8]">
          Privacy
        </Link>
      </footer>
    </main>
  );
}
