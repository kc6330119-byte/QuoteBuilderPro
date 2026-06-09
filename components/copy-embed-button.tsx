"use client";

import { useState } from "react";
import { Check, Code2 } from "lucide-react";
import { Button } from "@/components/button";

export function CopyEmbedButton({ snippet, className }: { snippet: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copySnippet() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be unavailable (older browsers / non-secure context); fail silently.
    }
  }

  return (
    <Button type="button" variant="secondary" onClick={copySnippet} className={className}>
      {copied ? <Check className="h-4 w-4" /> : <Code2 className="h-4 w-4" />}
      {copied ? "Copied!" : "Copy embed code"}
    </Button>
  );
}
