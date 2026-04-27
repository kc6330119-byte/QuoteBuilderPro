# QuoteBuilder Pro

QuoteBuilder Pro is a SaaS MVP foundation for creating pricing and quote calculators, publishing public quote pages, collecting customer submissions, and reviewing leads.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- Neon Postgres
- Netlify-ready deployment
- Mock authentication
- No Stripe and no AI in this MVP

## Routes

- `/` - landing page
- `/dashboard` - SaaS dashboard overview
- `/dashboard/calculators` - calculator list
- `/dashboard/calculators/new` - calculator builder
- `/dashboard/calculators/[id]` - calculator questions and pricing rules editor
- `/dashboard/leads` - quote submission leads
- `/quote/[slug]` - public quote page

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.example .env
```

3. Add your Neon connection string to `.env`.

Use the direct Neon connection string for local Prisma migration commands. If you later add pooled runtime connections, update `prisma/schema.prisma` with a `directUrl` setting before splitting pooled and direct URLs.

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
- `Calculator`
- `Question`
- `PricingRule`
- `QuoteSubmission`
- `Plan`
- `UserPlan`

The main calculator and lead workflow now reads and writes through Prisma using `lib/calculator-data.ts` and `lib/actions.ts`. `lib/mock-data.ts` remains only as a lightweight demo fallback for the original sample quote page.

Quote pricing is handled by `lib/quote-engine.ts`. It supports `base_price`, `quantity_multiplier`, `option_price`, and `checkbox_addon` rules stored in the `PricingRule` table.

## Mock authentication

Authentication is intentionally mocked for now in `lib/auth.ts`. You can change the displayed user by setting:

```bash
MOCK_AUTH_EMAIL="owner@quotebuilder.pro"
MOCK_AUTH_NAME="Demo Owner"
```

## Netlify deployment

This project includes `netlify.toml` with the Next.js plugin enabled.

Set these environment variables in Netlify:

- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`
- `MOCK_AUTH_EMAIL`
- `MOCK_AUTH_NAME`

Then deploy with the default build command:

```bash
npm run build
```

## Next implementation steps

- Replace mock calculator and lead data with Prisma reads and writes.
- Add real authentication.
- Add create/update/delete workflows for calculators.
- Persist public quote submissions to `QuoteSubmission`.
- Add teams, billing, and analytics after the core workflow is validated.
