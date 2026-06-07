# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Start dev server (Next.js, webpack — http://localhost:3000)
npm run build            # prisma generate + next build (webpack)
npm run lint             # eslint .
npm run prisma:generate  # Regenerate Prisma Client after schema changes
npm run prisma:migrate   # Create + apply a dev migration (prisma migrate dev)
npm run prisma:push      # Push schema without a migration (quick local iteration)
npm run prisma:studio    # Open Prisma Studio
```

There is no test runner configured. Both `dev` and `build` explicitly pass `--webpack` — this project opts out of Next 16's default Turbopack. Use the **direct** (non-pooled) Neon connection string for local Prisma commands.

## Big-picture architecture

QuoteBuilder Pro is a multi-tenant Next.js (App Router) SaaS. Service businesses build pricing calculators, publish them as standalone pages or embeds, and collect customer quote submissions as leads. Stack: TypeScript, Tailwind, Prisma → Neon Postgres, Clerk auth, Stripe billing. No AI.

### Request auth: `proxy.ts`, not `middleware.ts`
The Clerk middleware lives in **`proxy.ts`** at the repo root — Next 16 renamed `middleware.ts` to `proxy.ts`. It protects `/dashboard`, `/preview`, and `/admin`. Do not create a `middleware.ts`; edit `proxy.ts`.

### Tenancy is workspace-scoped through `lib/auth.ts`
`getCurrentWorkspace()` (React `cache()`d) is the single entry point for authenticated work. It resolves the Clerk user, lazily creates a local `User` + `Company` workspace on first sign-in, and returns the `companyId`. **Every dashboard data/query function scopes by `companyId`** — when adding queries over calculators/leads, always filter by the workspace company or you leak cross-tenant data. `lib/admin.ts` is the deliberate exception: it aggregates across all companies, gated by `ADMIN_EMAILS` (comma-separated env list) via `isAdminEmail()`.

### Data access is split into three layers
- **`lib/calculator-data.ts`** — read layer. Maps Prisma rows → typed view models (`QuoteCalculator`, `CalculatorEditor`, `CalculatorListItem`, `LeadListItem`). All normalization of DB JSON/enums happens here.
- **`lib/actions.ts`** — `"use server"` mutations (create/edit calculators, questions, rules, submit quotes, lead status). Re-validates ownership against the workspace before writing and calls `revalidatePath`.
- **`lib/quote-engine.ts`** — pure, dependency-free pricing + visibility logic, usable on server or client.

`lib/mock-data.ts` is only a demo fallback for the original sample quote page (`source: "mock"`); real flows go through Prisma.

### Pricing rules have a dual (legacy + current) type vocabulary
The DB `ruleType` column may hold **legacy** values (`BASE_PRICE`, `QUESTION_AMOUNT`) or **current** ones (`base_price`, `quantity_multiplier`, `option_price`, `checkbox_addon`). The engine only understands the current lowercase set, so always pass DB rule types through `normalizeRuleType()` / `getDisplayRuleType()` (the latter also disambiguates `QUESTION_AMOUNT` into checkbox/option/quantity based on the linked question's type). When reading `ruleConfig` JSON, use `getConfigString()`. **Amounts are stored and computed in whole currency units (dollars), not cents** — mock data divides its cents by 100 to match.

Question visibility is conditional and cascades: `getVisibleQuestions()` hides a question whose `visibilityCondition` references an answer that isn't satisfied, and a hidden question's own dependents are hidden too. `calculateQuote()` ignores rules tied to non-visible questions.

### Public pages use opaque IDs, never the internal UUID
Published calculators are exposed at `/quote/[publicId]/[slug]` and `/embed/[publicId]/[slug]`, where `publicId` is an opaque `qb-<hex>` token (`lib/public-calculator-id.ts`). Internal UUIDs only appear in authenticated dashboard/preview routes. Build these URLs with the helpers in `lib/public-calculator-paths.ts`. `getQuoteCalculatorByPublicId()` enforces that the calculator is published, non-archived, and the slug matches before returning anything.

### Embed system
`app/embed.js/route.ts` serves a hand-written vanilla-JS loader (no bundler) that host sites include as `<script src=".../embed.js" data-public-id data-slug>`. It injects an iframe pointing at the `/embed/...` page and listens for `postMessage` height updates. Inside the iframe, `components/embed-resize-reporter.tsx` posts `quotebuilder:resize` messages keyed by `publicId/slug`. The embed page also threads a sanitized `returnUrl`/`returnLabel` (validated http/https only) so a post-submit success state can link back to the host site. `quotebuilder-embed-demo/` is a standalone static host-page demo.

### Billing
Stripe is the source of truth, mirrored onto the **`Company`** model (`planTier`, `subscriptionStatus`, `stripeCustomerId/SubscriptionId/PriceId`). `app/api/stripe/webhook/route.ts` verifies the signature and syncs subscription state; it finds the target company by `metadata.companyId` → `stripeCustomerId` → `stripeSubscriptionId` in that order. `lib/billing-actions.ts` creates Checkout sessions (stamping `companyId`/`planTier` into metadata — keep that, the webhook relies on it). Plan definitions live in code in **`lib/plans.ts`** (`billingPlans`), not the DB. The `Plan`/`UserPlan` Prisma models are vestigial and unused by current billing. `getStripe()` is lazily initialized so the app boots without Stripe keys. Plan limits exist in `billingPlans` but are **not yet enforced** on create/publish.

### Contact form
The marketing contact form posts to Netlify Forms via the static `public/__forms.html` (the registration file Netlify scans at build); `components/contact-form.tsx` submits to `/__forms.html` then redirects to `/contact/success`. This is unrelated to quote submissions.

## Conventions
- Path alias `@/*` maps to the repo root (e.g. `@/lib/auth`).
- Default to Server Components / server actions; reach for `"use client"` only for interactivity. Public quote/embed pages set `export const dynamic = "force-dynamic"`.
- Tailwind uses a custom palette (`ink`, `coal`, `paper`, `mist`, `line`, `teal`, `brass`, `coral`) and font families defined in `tailwind.config.ts` — prefer these tokens over raw hex.
- Prisma JSON columns (`options`, `visibilityCondition`, `ruleConfig`, submission `answers`) are loosely typed; always normalize through the helpers in `lib/calculator-data.ts` / `lib/quote-engine.ts` rather than trusting their shape.

## Environment & deploy
Required env vars are documented in `.env.example` and `README.md`: `DATABASE_URL`, the Clerk keys (use the same `pk_...` for both `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_PUBLISHABLE_KEY`), `ADMIN_EMAILS`, and the Stripe keys/price IDs. Deploys to Netlify via `@netlify/plugin-nextjs` (`netlify.toml`); after deploy, point a Stripe webhook at `/api/stripe/webhook` for `checkout.session.completed`, the three `customer.subscription.*` events, and `invoice.payment_failed`.
