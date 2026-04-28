"use client";

import { useMemo, useState } from "react";
import { Check, Code2, Copy, ExternalLink } from "lucide-react";
import { Button, ButtonLink } from "@/components/button";

export function CalculatorEmbedPanel({
  id,
  slug,
  isPublished,
  appUrl
}: {
  id: string;
  slug: string;
  isPublished: boolean;
  appUrl: string;
}) {
  const [copied, setCopied] = useState(false);
  const baseUrl = appUrl.replace(/\/$/, "");
  const publicUrl = `${baseUrl}/quote/${slug}`;
  const previewUrl = `/preview/${id}`;
  const snippet = useMemo(() => `<script src="${baseUrl}/embed.js" data-slug="${slug}"></script>`, [baseUrl, slug]);

  async function copySnippet() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section className="rounded-lg border border-[#dbe5f4] bg-white p-5 shadow-crisp">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Embed Code</p>
          <h2 className="mt-2 font-display text-xl font-bold text-ink">Add this calculator to another website</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-coal/70">
            Paste this script where the quote calculator should appear. The widget loads in a responsive iframe and
            resizes itself as customers answer questions.
          </p>
        </div>
        <ButtonLink href={previewUrl} target="_blank" rel="noreferrer" variant="outline">
          {isPublished ? "Preview" : "Preview draft"} <ExternalLink className="h-4 w-4" />
        </ButtonLink>
      </div>

      {!isPublished ? (
        <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          Publish this calculator before embedding it. Unpublished calculators show an unavailable message in embeds.
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_220px]">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-coal">Script snippet</span>
          <textarea
            readOnly
            value={snippet}
            rows={3}
            className="w-full resize-none rounded-md border border-[#dbe5f4] bg-[#f8fbff] px-3 py-3 font-mono text-xs leading-5 text-ink outline-none"
          />
        </label>
        <div className="space-y-2">
          <span className="text-sm font-semibold text-coal">Published URL</span>
          <div className="rounded-md border border-[#dbe5f4] bg-[#f8fbff] px-3 py-3 text-xs leading-5 text-coal/70">
            {publicUrl}
          </div>
          <Button type="button" onClick={copySnippet} variant="secondary" className="w-full">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy embed code"}
          </Button>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-[#dbe5f4] bg-[#f8fbff]">
        <div className="flex items-center gap-2 border-b border-[#dbe5f4] bg-white px-4 py-3 text-sm font-bold text-ink">
          <Code2 className="h-4 w-4 text-blue-700" />
          Iframe preview
        </div>
        <iframe
          src={previewUrl}
          title="Embedded quote calculator preview"
          className="block h-[720px] w-full border-0 bg-white"
        />
      </div>
    </section>
  );
}
