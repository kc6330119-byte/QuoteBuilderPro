import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { GoogleAnalytics } from "@/components/google-analytics";
import "./globals.css";

const siteUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://quote-builder-pro.com").replace(/\/$/, "");
const siteDescription =
  "Create embeddable quote calculators for service businesses, publish polished estimate forms, and capture qualified customer leads.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "QuoteBuilder Pro",
  title: {
    default: "QuoteBuilder Pro | Quote Calculator Builder for Service Businesses",
    template: "%s | QuoteBuilder Pro"
  },
  description: siteDescription,
  keywords: [
    "quote calculator builder",
    "estimate calculator software",
    "service business quote forms",
    "lead capture calculators",
    "embeddable quote calculator"
  ],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "QuoteBuilder Pro",
    title: "QuoteBuilder Pro | Quote Calculator Builder for Service Businesses",
    description: siteDescription
  },
  twitter: {
    card: "summary_large_image",
    title: "QuoteBuilder Pro | Quote Calculator Builder for Service Businesses",
    description: siteDescription
  },
  robots: {
    index: true,
    follow: true
  }
};

const clerkPublishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? process.env.CLERK_PUBLISHABLE_KEY;
const googleAnalyticsMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <html lang="en">
        <body>
          {children}
          <GoogleAnalytics measurementId={googleAnalyticsMeasurementId} />
        </body>
      </html>
    </ClerkProvider>
  );
}
