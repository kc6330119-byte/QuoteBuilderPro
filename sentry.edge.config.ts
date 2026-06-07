import * as Sentry from "@sentry/nextjs";

// Edge runtime (Clerk middleware in proxy.ts runs here). Inert until SENTRY_DSN is set.
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1
  });
}
