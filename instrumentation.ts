import * as Sentry from "@sentry/nextjs";

// Next.js auto-loads this on the server. The Sentry configs below self-disable unless SENTRY_DSN is set,
// so this is a no-op until you configure error monitoring.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Forwards errors thrown in server components, route handlers, and server actions to Sentry.
export const onRequestError = Sentry.captureRequestError;
