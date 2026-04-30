import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock3, LifeBuoy, Mail, MessageSquareText } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact QuoteBuilder Pro for setup, billing, or account questions.",
  alternates: {
    canonical: "/contact"
  }
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#f7faff] text-ink">
      <section className="relative overflow-hidden border-b border-[#dbe5f4] bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_34%),linear-gradient(135deg,#ffffff,#eef6ff)]">
        <div className="surface-grid absolute inset-0 opacity-35" />
        <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-coal/70 transition hover:text-blue-700">
            <ArrowLeft className="h-4 w-4" /> Back to QuoteBuilder Pro
          </Link>
          <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-700 shadow-sm">
                <LifeBuoy className="h-3.5 w-3.5" />
                Contact support
              </div>
              <h1 className="mt-5 font-display text-4xl font-black leading-tight text-ink md:text-6xl">
                Questions before or after setup?
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-coal/70">
                Send a message for billing, setup, account, or calculator workflow questions. We’ll use this inbox while
                QuoteBuilder Pro is still in its early launch stage.
              </p>
            </div>
            <div className="rounded-xl border border-[#dbe5f4] bg-white p-5 shadow-crisp">
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Setup help", body: "Templates, publishing, embeds", icon: MessageSquareText },
                  { label: "Billing", body: "Plans, payments, cancellations", icon: Mail },
                  { label: "Response", body: "Managed from Netlify inbox", icon: Clock3 }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-lg border border-[#dbe5f4] bg-[#f8fbff] p-4">
                      <Icon className="h-5 w-5 text-blue-700" />
                      <p className="mt-3 font-display text-base font-bold text-ink">{item.label}</p>
                      <p className="mt-1 text-xs leading-5 text-coal/60">{item.body}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
        <aside className="rounded-xl border border-[#dbe5f4] bg-white p-6 shadow-crisp">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">What to include</p>
          <h2 className="mt-3 font-display text-2xl font-bold text-ink">A few details help us answer faster.</h2>
          <div className="mt-5 space-y-3 text-sm leading-6 text-coal/70">
            <p>Tell us which workspace, calculator, or billing plan your question is about.</p>
            <p>If you are reporting a setup issue, include the calculator name and what you expected to happen.</p>
            <p>Please do not send passwords, card numbers, or other sensitive secrets through this form.</p>
          </div>
        </aside>

        <div className="rounded-xl border border-[#dbe5f4] bg-white p-6 shadow-crisp">
          <form
            name="quote-builder-contact"
            method="POST"
            action="/contact/success"
            data-netlify="true"
            className="space-y-5"
          >
            <input type="hidden" name="form-name" value="quote-builder-contact" />

            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-ink">
                <span>Name</span>
                <input
                  name="name"
                  required
                  className="h-11 w-full rounded-md border border-[#dbe5f4] bg-[#fbfdff] px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="Your name"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-ink">
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  required
                  className="h-11 w-full rounded-md border border-[#dbe5f4] bg-[#fbfdff] px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="you@example.com"
                />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-ink">
                <span>Company</span>
                <input
                  name="company"
                  className="h-11 w-full rounded-md border border-[#dbe5f4] bg-[#fbfdff] px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="Company name"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-ink">
                <span>Topic</span>
                <select
                  name="topic"
                  required
                  defaultValue=""
                  className="h-11 w-full rounded-md border border-[#dbe5f4] bg-[#fbfdff] px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="" disabled>
                    Choose a topic
                  </option>
                  <option value="Setup help">Setup help</option>
                  <option value="Billing">Billing</option>
                  <option value="Account access">Account access</option>
                  <option value="Calculator question">Calculator question</option>
                  <option value="Other">Other</option>
                </select>
              </label>
            </div>

            <label className="space-y-2 text-sm font-semibold text-ink">
              <span>Message</span>
              <textarea
                name="message"
                required
                rows={7}
                className="w-full rounded-md border border-[#dbe5f4] bg-[#fbfdff] px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder="How can we help?"
              />
            </label>

            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-blue-600 px-5 text-base font-bold text-white shadow-crisp transition hover:-translate-y-0.5 hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Send message
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
