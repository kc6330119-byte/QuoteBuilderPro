import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { privacySections } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for QuoteBuilder Pro.",
  alternates: {
    canonical: "/privacy"
  }
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy Policy"
      title="How QuoteBuilder Pro handles lead and account data."
      description="This privacy policy explains what data QuoteBuilder Pro collects, how it is used, and the basic safeguards and retention posture for calculator leads."
      sections={privacySections}
    />
  );
}
