// ---------------------------------------------------------------------------
// Site kill switch.
//
// When SITE_DISABLED is true the whole product is "parked":
//   - the homepage shows a "Coming soon" splash (no marketing page, no auth UI)
//   - new account creation (/sign-up) is blocked at the middleware
//   - the subscription checkout action is disabled (nobody can start paying)
//   - public /quote and /embed calculator pages show an "unavailable" message
//
// The owner can still reach /sign-in directly (it is just not linked anywhere)
// and use the protected dashboard — e.g. to unpublish calculators.
//
// To bring the site back online, set this to false and redeploy.
// ---------------------------------------------------------------------------
export const SITE_DISABLED = true;
