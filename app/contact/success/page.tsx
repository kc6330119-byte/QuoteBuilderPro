import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, LayoutDashboard, MessageSquareText } from "lucide-react";
import { ButtonLink } from "@/components/button";

export const metadata: Metadata = {
  title: "Message Sent",
  robots: {
    index: false,
    follow: false
  }
};

export default function ContactSuccessPage() {
  return (
    <main className="min-h-screen bg-[#f7faff] text-ink">
      <section className="relative overflow-hidden border-b border-[#dbe5f4] bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_34%),linear-gradient(135deg,#ffffff,#eef6ff)]">
        <div className="surface-grid absolute inset-0 opacity-35" />
        <div className="relative mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-coal/70 transition hover:text-blue-700">
            <ArrowLeft className="h-4 w-4" /> Back to QuoteBuilder Pro
          </Link>
          <div className="mt-16 rounded-2xl border border-[#dbe5f4] bg-white p-8 text-center shadow-soft">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-700 ring-8 ring-teal-50/60">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Message sent</p>
            <h1 className="mt-3 font-display text-4xl font-black text-ink">We received your note.</h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-coal/70">
              Your message is now in the QuoteBuilder Pro Netlify inbox. We’ll review setup, billing, or account
              questions from there while the product is in launch mode.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/dashboard" variant="secondary">
                <LayoutDashboard className="h-4 w-4" />
                Open dashboard
              </ButtonLink>
              <ButtonLink href="/contact" variant="outline">
                <MessageSquareText className="h-4 w-4" />
                Send another message
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
