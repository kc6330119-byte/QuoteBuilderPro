"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Copy, GripVertical, Plus, Save } from "lucide-react";
import { Button } from "@/components/button";
import { formatCurrency } from "@/lib/utils";

type BuilderField = {
  id: number;
  label: string;
  type: "Number" | "Select" | "Toggle";
  pricing: string;
};

const initialFields: BuilderField[] = [
  { id: 1, label: "Quantity or team size", type: "Number", pricing: "$125 per unit" },
  { id: 2, label: "Package tier", type: "Select", pricing: "Adds $0 to $2,750" },
  { id: 3, label: "Rush delivery", type: "Toggle", pricing: "Adds $500" }
];

export function CalculatorBuilderForm() {
  const [name, setName] = useState("Implementation Services Quote");
  const [slug, setSlug] = useState("implementation-services");
  const [basePrice, setBasePrice] = useState(2500);
  const [fields, setFields] = useState(initialFields);
  const [published, setPublished] = useState(false);

  const previewTotal = useMemo(() => basePrice * 100 + fields.length * 42500, [basePrice, fields.length]);

  function addField() {
    setFields((current) => [
      ...current,
      {
        id: Date.now(),
        label: "New pricing input",
        type: "Number",
        pricing: "$75 per unit"
      }
    ]);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="space-y-6">
        <div className="rounded-lg border border-line bg-white p-5 shadow-crisp">
          <h2 className="font-display text-xl font-bold text-ink">Calculator details</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-coal">Name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-11 w-full rounded-md border border-line bg-paper px-3 text-sm outline-none transition focus:border-teal-600 focus:bg-white"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-coal">Public slug</span>
              <input
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                className="h-11 w-full rounded-md border border-line bg-paper px-3 text-sm outline-none transition focus:border-teal-600 focus:bg-white"
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-coal">Customer-facing description</span>
              <textarea
                rows={4}
                defaultValue="Answer a few questions and receive a working estimate for your project."
                className="w-full rounded-md border border-line bg-paper px-3 py-3 text-sm outline-none transition focus:border-teal-600 focus:bg-white"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-coal">Base price</span>
              <input
                type="number"
                value={basePrice}
                onChange={(event) => setBasePrice(Number(event.target.value))}
                className="h-11 w-full rounded-md border border-line bg-paper px-3 text-sm outline-none transition focus:border-teal-600 focus:bg-white"
              />
            </label>
            <label className="flex items-center justify-between gap-3 rounded-md border border-line bg-paper px-3 py-3">
              <span>
                <span className="block text-sm font-semibold text-coal">Publish after save</span>
                <span className="text-xs text-coal/60">Mock setting for the MVP flow</span>
              </span>
              <input
                type="checkbox"
                checked={published}
                onChange={(event) => setPublished(event.target.checked)}
                className="h-5 w-5 accent-teal-700"
              />
            </label>
          </div>
        </div>

        <div className="rounded-lg border border-line bg-white p-5 shadow-crisp">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold text-ink">Pricing inputs</h2>
              <p className="mt-1 text-sm text-coal/70">Shape the questions customers answer before submitting a lead.</p>
            </div>
            <Button type="button" variant="outline" onClick={addField}>
              <Plus className="h-4 w-4" /> Add field
            </Button>
          </div>
          <div className="mt-5 space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid gap-3 rounded-lg border border-line bg-paper p-3 md:grid-cols-[32px_1fr_150px_160px]"
              >
                <div className="flex items-center text-coal/40">
                  <GripVertical className="h-5 w-5" />
                </div>
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase text-coal/60">Label</span>
                  <input
                    value={field.label}
                    onChange={(event) => {
                      const value = event.target.value;
                      setFields((current) =>
                        current.map((item) => (item.id === field.id ? { ...item, label: value } : item))
                      );
                    }}
                    className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-teal-600"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase text-coal/60">Type</span>
                  <select
                    value={field.type}
                    onChange={(event) => {
                      const value = event.target.value as BuilderField["type"];
                      setFields((current) =>
                        current.map((item) => (item.id === field.id ? { ...item, type: value } : item))
                      );
                    }}
                    className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-teal-600"
                  >
                    <option>Number</option>
                    <option>Select</option>
                    <option>Toggle</option>
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase text-coal/60">Pricing</span>
                  <input
                    value={field.pricing}
                    onChange={(event) => {
                      const value = event.target.value;
                      setFields((current) =>
                        current.map((item) => (item.id === field.id ? { ...item, pricing: value } : item))
                      );
                    }}
                    className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-teal-600"
                  />
                </label>
                <span className="hidden text-xs text-coal/50 md:col-start-2">Field {index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="sticky top-6 rounded-lg border border-line bg-ink p-5 text-white shadow-soft">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-100">Live preview</p>
          <h2 className="mt-3 font-display text-2xl font-bold">{name}</h2>
          <p className="mt-2 text-sm leading-6 text-white/70">/{slug}</p>
          <div className="mt-5 space-y-3">
            {fields.map((field) => (
              <div key={field.id} className="rounded-md border border-white/[0.12] bg-white/[0.08] p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold">{field.label}</span>
                  <span className="text-xs text-white/60">{field.type}</span>
                </div>
                <p className="mt-1 text-xs text-white/60">{field.pricing}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-md bg-white p-4 text-ink">
            <p className="text-xs font-bold uppercase text-coal/50">Estimated quote</p>
            <p className="mt-1 font-display text-3xl font-bold">{formatCurrency(previewTotal)}</p>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button type="button" variant="secondary">
              <Save className="h-4 w-4" /> Save
            </Button>
            <Button type="button" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white hover:text-ink">
              <Copy className="h-4 w-4" /> Copy
            </Button>
          </div>
          {published ? (
            <p className="mt-4 inline-flex items-center gap-2 text-sm text-teal-100">
              <CheckCircle2 className="h-4 w-4" /> Ready to publish
            </p>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
