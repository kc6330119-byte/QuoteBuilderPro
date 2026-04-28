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
- No Stripe and no AI in this MVP

## Routes

- `/` - landing page
- `/dashboard` - SaaS dashboard overview
- `/dashboard/calculators` - calculator list
- `/dashboard/calculators/new` - calculator builder
- `/dashboard/calculators/[id]` - calculator questions and pricing rules editor
- `/dashboard/leads` - quote submission leads
- `/dashboard/templates` - calculator template library
- `/dashboard/how-to-use` - in-app guide
- `/sign-in` - Clerk sign-in page
- `/sign-up` - Clerk sign-up page
- `/quote/[slug]` - public quote page
- `/embed/[slug]` - embeddable calculator page
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

3. Add your Neon connection string and Clerk keys to `.env`.

Use the direct Neon connection string for local Prisma migration commands. If you later add pooled runtime connections, update `prisma/schema.prisma` with a `directUrl` setting before splitting pooled and direct URLs.

Clerk requires:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/dashboard"
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL="/dashboard"
```

Use the same `pk_...` value for `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_PUBLISHABLE_KEY`. The publishable key is safe to expose; the `CLERK_SECRET_KEY` must stay private.

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
- `Plan`
- `UserPlan`

The main calculator and lead workflow now reads and writes through Prisma using `lib/calculator-data.ts` and `lib/actions.ts`. `lib/mock-data.ts` remains only as a lightweight demo fallback for the original sample quote page.

Quote pricing is handled by `lib/quote-engine.ts`. It supports `base_price`, `quantity_multiplier`, `option_price`, and `checkbox_addon` rules stored in the `PricingRule` table.

## Authentication and workspaces

Dashboard routes are protected with Clerk. `lib/auth.ts` resolves the signed-in Clerk user, creates or updates the local `User`, creates a company workspace, and scopes dashboard calculators/leads to that workspace. Public quote and embed routes remain available for published calculators.

## Netlify deployment

This project includes `netlify.toml` with the Next.js plugin enabled.

Set these environment variables in Netlify:

- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`

Then deploy with the default build command:

```bash
npm run build
```

## Next implementation steps

- Add workspace invitation flows and member roles.
- Add embed domain restrictions.
- Add billing after the core workflow is validated.
- Add analytics and conversion reporting.
