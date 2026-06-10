# Shawn Starr Custom Homes — Cold Outreach Email

Personalized outreach pitching QuoteBuilder Pro to **Shawn Starr Custom Homes**
(Jacksonville luxury custom-home builder). Pairs with the branded demo page and
the one-page brochure.

**Principle:** lead with the live, Starr-branded demo — it does the selling. The
PDF is the supporting leave-behind. One CTA. Transparent that it's a private
sample, with an honest take-down date that creates gentle urgency.

**Escalation ladder (one new card per touch):**
1. **Email 1** — the branded demo (customer experience) + a P.S. pointing at the
   homepage's live editor (owner experience: "you can change prices yourself").
   No pricing talk, no discounts — a code in a cold email reads like promo spam
   and anchors the conversation on price before he's seen the value.
2. **Follow-up** — take-down deadline + the *offer* ("first month's on me"),
   still without the code. Gives the bump a fresh reason to exist.
3. **When he replies** — send the actual `STARRFREE` code. As a direct, personal
   concession it builds reciprocity; in a blast it's just a coupon.

## Assets to drop in
- **Live demo (hero link):** `https://quotebuilder-embed-demo.netlify.app/shawn-starr-custom-homes/`
- **Brochure (attach as PDF):** `design/shawn-starr-one-pager.html` → open → Cmd/Ctrl+P → Save as PDF
- **Build / sign up:** `https://quote-builder-pro.com` (homepage now runs a live
  editor sandbox — that's what the P.S. points at)
- **Booking link:** `{your Calendly/Cal.com link}` (or "just reply")

## Placeholders to fill
`[booking link]` · `[date ~2 weeks out]` · `[Your name]` · `[phone]` · `[City, ST]`

---

## Main email

**Subject:** I built a kitchen estimator for Shawn Starr Custom Homes

> Hi Shawn,
>
> Rather than pitch you, I just built the thing — a 60-second kitchen-remodel
> estimator in your brand (navy, your logo, "You've dreamed it. Now live it."):
>
> https://quotebuilder-embed-demo.netlify.app/shawn-starr-custom-homes/
>
> It's a private sample I made for you — unlisted and not searchable, just so you
> can see it working rather than read about it. A homeowner picks their finish
> level, cabinets, and island and gets an instant ballpark; the moment they
> submit, you get the lead — name, phone, email, and what they want to build — in
> your inbox.
>
> Most people planning a high-end kitchen want a number before they'll pick up the
> phone. This catches the ones who'd otherwise leave without reaching out — and at
> your project sizes, one booked remodel covers it many times over.
>
> Kitchen's just the demo — it can do the same for whole-home renovations,
> additions, even a starting estimate on a new custom build.
>
> A one-page overview is attached. Worth a quick look? I can have it live on your
> real site this week — or grab 15 minutes here: [booking link].
>
> No pressure either way: I'll keep this private demo up until [date ~2 weeks out].
> If I haven't heard back by then — or you'd rather I not keep a Starr-branded page
> online — I'll take it down. It's yours to claim or decline.
>
> Best,
> [Your name]
> QuoteBuilder Pro
> [phone] · [City, ST]
>
> P.S. Wondering how hard it is to run? The editor is live on our homepage —
> change a price and watch the estimate move. No signup: https://quote-builder-pro.com
>
> Not interested? Reply "stop" and you won't hear from me again.

### Alternate subject lines (A/B test)
- made you an instant kitchen quote tool, Shawn
- instant kitchen estimates for Starr Custom Homes?
- a kitchen estimator in your brand

---

## Follow-up (same thread, ~3–4 days before the take-down date)

> Hi Shawn — quick nudge: the Starr-branded demo I built comes down on [date], so
> I didn't want it to slip by. Still here if handy: [link]. If you decide to run
> with it, your first month is on me — and even two or three extra quoted kitchen
> leads a month usually pays for itself several times over. Worth 15 minutes? If
> now's not the time, just say "not now" and I'll take it down — no hard feelings.

*(Note: "first month is on me" — the offer, not the code. Send `STARRFREE` only
in a direct reply, after the Live-mode coupon exists.)*

---

## Before you send — checklist
1. **Deploy the demo site first** so the link is live (it 404s until the Netlify demo site is redeployed).
2. **Send to Shawn directly** if you can find his address; `info@starrcustom.com` works, but the owner inbox lands better.
3. **PDF: attach small (<1 MB), or host + link it** — a PDF on a first cold email can trip spam filters and often goes unopened. Linking deliverers better and shows clicks.
4. **Keep the CAN-SPAM footer** (real name/business + city + opt-out) and use a real reply-to address.
5. **One CTA only** — the look/booking. Don't bolt on "and sign up." (The
   homepage P.S. is curiosity, not a CTA — keep the *ask* singular.)
6. **Pick the take-down date (~14 days) and honor it.** The promise only builds trust if you keep it — set a calendar reminder; if no reply by then, pull the demo down (or unpublish the calculator).
7. **Create the `STARRFREE` coupon in Stripe Live mode *before* sending the
   follow-up** — it promises the free month, so the code must exist (and work)
   the moment he replies.

## Notes
- "Unlisted and not searchable" is accurate (the demo page is `noindex, nofollow`), but anyone with the link can still open it — honest without overpromising privacy.
- The kitchen estimator is the *wedge* (it's built and tangible). Whole-home and new-build calculators are the natural expansion — surface them on the call, or build a second branded demo to show the range.

---

## If Shawn's interested: first-month-free promo code

**Staging:** the code never appears in outbound email. Email 1 doesn't mention
price at all; the follow-up offers "first month on me" without the code; the
code itself goes out only in a direct reply once he engages.

The checkout already supports promo codes (`allow_promotion_codes: true` in
`lib/billing-actions.ts`), so this is a **Stripe Dashboard task — no code change or deploy.**

**Create it in Stripe (~2 min):**
1. **Coupon** — *Product catalog → Coupons → New*: **100% off**, **Duration: Once**.
   "Once" applies to the first invoice only, so on a monthly plan that's the **first
   month free**; it bills normally after.
2. **Promotion code** on that coupon — e.g. `STARRFREE`. Set **Max redemptions: 1**
   (only Shawn) and optionally an **expiration** to match the demo take-down date.
3. **Send Shawn the code.** At checkout he picks a plan → "Add promotion code" →
   enters `STARRFREE` → month one is **$0**.

**Know before you offer it:**
- He still enters a card (subscriptions need one for renewal); the first invoice just
  bills $0 — standard "first month free, cancel anytime."
- **Create the coupon in Live mode** — coupons are environment-specific (a Test-mode
  coupon won't work for a real customer).
- "Once" = first *invoice*. Monthly plan → one month. An annual plan would need a
  `repeating` (12-month) coupon instead.
- Stripe shows a redemption count on the code, so you'll see when he activates.

**Optional:** a pre-applied discount link (auto-applies the coupon so he doesn't type
a code) is possible via `discounts: [{ coupon }]` in `createCheckoutSessionAction` —
ask if you want it wired up.
