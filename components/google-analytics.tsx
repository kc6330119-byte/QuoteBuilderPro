"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const blockedPrefixes = ["/admin", "/dashboard", "/embed", "/preview", "/quote", "/sign-in", "/sign-up"];
const measurementIdPattern = /^G-[A-Z0-9]+$/;

function isBlockedPath(pathname: string) {
  return blockedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

type GoogleAnalyticsProps = {
  measurementId?: string;
};

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const pathname = usePathname();
  const hasHandledInitialPageview = useRef(false);
  const safeMeasurementId = measurementIdPattern.test(measurementId ?? "") ? measurementId : undefined;

  const shouldTrack = Boolean(safeMeasurementId) && !isBlockedPath(pathname);

  useEffect(() => {
    if (!safeMeasurementId || !shouldTrack) {
      return;
    }

    if (!hasHandledInitialPageview.current) {
      hasHandledInitialPageview.current = true;
      return;
    }

    window.gtag?.("config", safeMeasurementId, {
      page_path: pathname
    });
  }, [safeMeasurementId, pathname, shouldTrack]);

  if (!safeMeasurementId || !shouldTrack) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${safeMeasurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${safeMeasurementId}', { page_path: window.location.pathname });
        `}
      </Script>
    </>
  );
}
