# QuoteBuilder Pro

QuoteBuilder Pro is a SaaS MVP foundation for creating pricing and quote calculators, publishing public quote pages, collecting customer submissions, and reviewing leads.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- Neon Postgres
- Netlify-ready deployment
- Clerk authentication
- Stripe subscription billing foundation
- No AI in this MVP

## Routes

- `/` - landing page
- `/dashboard` - SaaS dashboard overview
- `/dashboard/calculators` - calculator list
- `/dashboard/calculators/new` - calculator builder
- `/dashboard/calculators/[id]` - calculator questions and pricing rules editor
- `/dashboard/leads` - quote submission leads
- `/dashboard/templates` - calculator template library
- `/dashboard/how-to-use` - in-app guide
- `/dashboard/billing` - Stripe plan selection and subscription status
- `/admin` - internal QuoteBuilder Pro owner dashboard
- `/sign-in` - Clerk sign-in page
- `/sign-up` - Clerk sign-up page
- `/quote/[publicId]/[slug]` - secure public quote page with an opaque calculator identifier
- `/embed/[publicId]/[slug]` - secure embeddable calculator page with an opaque calculator identifier
- `/terms` and `/privacy` - starter legal pages

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.example .env
```

3. Add your Neon connection string, Clerk keys, and Stripe keys to `.env`.

The Prisma datasource uses two connection strings: `DATABASE_URL` for runtime queries and `DIRECT_URL` for migrations (`prisma/schema.prisma` declares `directUrl`). Point `DATABASE_URL` at Neon's **pooled** endpoint (host contains `-pooler`, with `pgbouncer=true&connection_limit=1`) so serverless functions don't exhaust Neon's connection limit, and point `DIRECT_URL` at the **direct** unpooled endpoint for `prisma migrate`/`db push`. If you are not using pooling yet, set `DIRECT_URL` to the same value as `DATABASE_URL`.

Google Analytics is optional and only tracks public marketing pages when configured:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
```

Clerk requires:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/dashboard"
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL="/dashboard"
ADMIN_EMAILS="kc6330119@gmail.com"
```

Use the same `pk_...` value for `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_PUBLISHABLE_KEY`. The publishable key is safe to expose; the `CLERK_SECRET_KEY` must stay private.

`ADMIN_EMAILS` controls access to the internal `/admin` owner dashboard. Use a comma-separated list if more than one operator needs access.

Stripe billing requires:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_STARTER_PRICE_ID="price_..."
STRIPE_PRO_PRICE_ID="price_..."
STRIPE_AGENCY_PRICE_ID="price_..."
```

For local webhook testing, forward Stripe events to `/api/stripe/webhook` and use the generated `whsec_...` value.

4. Generate Prisma Client:

```bash
npm run prisma:generate
```

5. Create database tables:

```bash
npm run prisma:migrate
```

6. Run the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Neon and Prisma

The Prisma schema is in `prisma/schema.prisma` and includes:

- `User`
- `Company`
- `Calculator`
- `Question`
- `PricingRule`
- `QuoteSubmission`
- `WebhookEvent` (Stripe webhook idempotency ledger)

The main calculator and lead workflow reads and writes through Prisma using `lib/calculator-data.ts` and `lib/actions.ts`.

Quote pricing is handled by `lib/quote-engine.ts`. It supports `base_price`, `quantity_multiplier`, `option_price`, and `checkbox_addon` rules stored in the `PricingRule` table.

**Backups:** enable Neon Point-in-Time Restore (PITR) so the lead/calculator data can be recovered. Lead deletion is currently a hard delete, so PITR is the recovery path until soft-delete lands.

## Authentication and workspaces

Dashboard routes are protected with Clerk. `lib/auth.ts` resolves the signed-in Clerk user, creates or updates the local `User`, creates a company workspace, and scopes dashboard calculators/leads to that workspace. Public quote and embed routes remain available for published calculators.

## Netlify deployment

This project includes `netlify.toml` with the Next.js plugin enabled.

Set these environment variables in Netlify:

- `DATABASE_URL` (Neon pooled endpoint)
- `DIRECT_URL` (Neon direct endpoint, for migrations)
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`
- `ADMIN_EMAILS`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_STARTER_PRICE_ID`
- `STRIPE_PRO_PRICE_ID`
- `STRIPE_AGENCY_PRICE_ID`

Then deploy with the default build command:

```bash
npm run build
```

After the deployment is live, create a Stripe webhook endpoint:

```text
https://quote-builder-pro.com/api/stripe/webhook
```

Subscribe it to `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, and `invoice.payment_failed`, then add the generated `STRIPE_WEBHOOK_SECRET` to Netlify.

## Next implementation steps

- Add workspace invitation flows and member roles.
- Add embed domain restrictions.
- Add subscription limit enforcement and plan upgrade/downgrade management.
- Add analytics and conversion reporting.
