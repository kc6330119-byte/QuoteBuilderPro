import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuoteBuilder Pro",
  description: "Create pricing calculators, publish quote pages, and manage customer leads."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
