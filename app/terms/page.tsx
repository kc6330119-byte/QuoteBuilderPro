import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { termsSections } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: "Terms of Service | QuoteBuilder Pro",
  description: "Terms of Service for QuoteBuilder Pro."
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Terms of Service"
      title="Terms that keep estimates clear and expectations sane."
      description="These starter terms explain that QuoteBuilder Pro provides software, not field services, and that calculator outputs are planning estimates rather than binding quotes."
      sections={termsSections}
    />
  );
}
