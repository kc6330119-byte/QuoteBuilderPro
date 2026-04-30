"use client";

import type { FormEvent } from "react";
import { useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const formData = new FormData(event.currentTarget);
    const body = new URLSearchParams();

    formData.forEach((value, key) => {
      body.append(key, String(value));
    });

    try {
      const response = await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString()
      });

      if (!response.ok) {
        throw new Error("Form submission failed.");
      }

      window.location.href = "/contact/success";
    } catch {
      setStatus("error");
    }
  }

  return (
    <form name="quote-builder-contact" onSubmit={handleSubmit} className="space-y-5">
      <input type="hidden" name="form-name" value="quote-builder-contact" />

      {status === "error" ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          We could not send that message. Please try again in a moment.
        </div>
      ) : null}

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
        disabled={status === "submitting"}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-blue-600 px-5 text-base font-bold text-white shadow-crisp transition hover:-translate-y-0.5 hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
