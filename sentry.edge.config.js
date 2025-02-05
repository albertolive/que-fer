// @ts-check

// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { init } from "@sentry/nextjs";

if (process.env.NODE_ENV === "production") {
  /** @type {import('@sentry/nextjs').EdgeOptions} */
  const config = {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DNS,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV,
    tracesSampleRate: 1.0,
    debug: false,
  };

  init(config);
}
