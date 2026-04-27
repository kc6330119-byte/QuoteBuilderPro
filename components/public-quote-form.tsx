"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/button";
import type { Calculator } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

type Answers = Record<string, number | string | boolean>;

export function PublicQuoteForm({ calculator }: { calculator: Calculator }) {
  const [answers, setAnswers] = useState<Answers>(() =>
    Object.fromEntries(
      calculator.fields.map((field) => {
        if (field.type === "NUMBER") return [field.key, field.min ?? 1];
        if (field.type === "BOOLEAN") return [field.key, false];
        if (field.type === "SELECT") return [field.key, field.options?.[0]?.value ?? ""];
        return [field.key, ""];
      })
    )
  );
  const [submitted, setSubmitted] = useState(false);

  const total = useMemo(() => {
    return calculator.fields.reduce((sum, field) => {
      const answer = answers[field.key];
      if (field.type === "NUMBER" && typeof answer === "number") {
        return sum + answer * (field.pricePerUnit ?? 0);
      }
      if (field.type === "BOOLEAN" && answer === true) {
        return sum + (field.priceDelta ?? 0);
      }
      if (field.type === "SELECT") {
        const option = field.options?.find((item) => item.value === answer);
        return sum + (option?.priceDelta ?? 0);
      }
      return sum;
    }, calculator.basePrice);
  }, [answers, calculator]);

  if (submitted) {
    return (
      <div className="rounded-lg border border-teal-100 bg-teal-50 p-6">
        <CheckCircle2 className="h-10 w-10 text-teal-700" />
        <h2 className="mt-4 font-display text-2xl font-bold text-ink">Quote request received</h2>
        <p className="mt-2 text-sm leading-6 text-coal/70">
          This MVP uses mock submission handling. In production, this would create a QuoteSubmission row in Neon
          through Prisma.
        </p>
        <p className="mt-4 text-sm font-semibold text-teal-700">Estimated quote: {formatCurrency(total)}</p>
      </div>
    );
  }

  return (
    <form
      className="grid gap-6 lg:grid-cols-[1fr_340px]"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <section className="space-y-5">
        {calculator.fields.map((field) => (
          <div key={field.id} className="rounded-lg border border-line bg-white p-5 shadow-crisp">
            <label className="block text-sm font-bold text-ink" htmlFor={field.key}>
              {field.label}
            </label>
            {field.type === "NUMBER" ? (
              <div className="mt-3 flex items-center gap-3">
                <input
                  id={field.key}
                  type="number"
                  min={field.min}
                  max={field.max}
                  value={Number(answers[field.key])}
                  onChange={(event) => setAnswers((current) => ({ ...current, [field.key]: Number(event.target.value) }))}
                  className="h-12 w-full rounded-md border border-line bg-paper px-3 text-sm outline-none transition focus:border-teal-600 focus:bg-white"
                />
                {field.unit ? <span className="min-w-fit text-sm font-medium text-coal/60">{field.unit}</span> : null}
              </div>
            ) : null}
            {field.type === "SELECT" ? (
              <select
                id={field.key}
                value={String(answers[field.key])}
                onChange={(event) => setAnswers((current) => ({ ...current, [field.key]: event.target.value }))}
                className="mt-3 h-12 w-full rounded-md border border-line bg-paper px-3 text-sm outline-none transition focus:border-teal-600 focus:bg-white"
              >
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : null}
            {field.type === "BOOLEAN" ? (
              <label className="mt-3 flex items-center justify-between gap-3 rounded-md border border-line bg-paper px-3 py-3">
                <span className="text-sm text-coal/70">Add this option</span>
                <input
                  type="checkbox"
                  checked={Boolean(answers[field.key])}
                  onChange={(event) => setAnswers((current) => ({ ...current, [field.key]: event.target.checked }))}
                  className="h-5 w-5 accent-teal-700"
                />
              </label>
            ) : null}
          </div>
        ))}
        <div className="rounded-lg border border-line bg-white p-5 shadow-crisp">
          <h2 className="font-display text-xl font-bold text-ink">Your contact details</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <input required placeholder="Name" className="h-12 rounded-md border border-line bg-paper px-3 text-sm outline-none focus:border-teal-600 focus:bg-white" />
            <input required type="email" placeholder="Email" className="h-12 rounded-md border border-line bg-paper px-3 text-sm outline-none focus:border-teal-600 focus:bg-white" />
            <input placeholder="Company" className="h-12 rounded-md border border-line bg-paper px-3 text-sm outline-none focus:border-teal-600 focus:bg-white" />
            <input placeholder="Phone" className="h-12 rounded-md border border-line bg-paper px-3 text-sm outline-none focus:border-teal-600 focus:bg-white" />
            <textarea placeholder="Project notes" rows={4} className="rounded-md border border-line bg-paper px-3 py-3 text-sm outline-none focus:border-teal-600 focus:bg-white md:col-span-2" />
          </div>
        </div>
      </section>
      <aside>
        <div className="sticky top-6 rounded-lg border border-line bg-ink p-5 text-white shadow-soft">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-100">Estimated total</p>
          <p className="mt-3 font-display text-4xl font-bold">{formatCurrency(total, calculator.currency)}</p>
          <p className="mt-3 text-sm leading-6 text-white/70">
            Final pricing can change after discovery, but this gives your team a fast qualification signal.
          </p>
          <Button type="submit" variant="secondary" size="lg" className="mt-5 w-full">
            Submit quote request <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </aside>
    </form>
  );
}
