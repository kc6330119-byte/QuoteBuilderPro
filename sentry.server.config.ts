import * as Sentry from "@sentry/nextjs";

// Inert until SENTRY_DSN is set, so local dev and unconfigured deploys are unaffected.
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1
  });
}
