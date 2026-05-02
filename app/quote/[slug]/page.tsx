import type { Metadata } from "next";
import { QuoteUnavailable } from "@/components/quote-unavailable";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Quote Calculator",
  robots: {
    index: false,
    follow: false
  }
};

export default async function QuotePage({
  params
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ legal?: string; submitted?: string }>;
}) {
  await params;
  return <QuoteUnavailable />;
}
