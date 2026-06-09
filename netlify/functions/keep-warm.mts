// Netlify Scheduled Function — keeps the app from cold-starting between visits.
//
// Every few minutes it pings /api/health, which (a) keeps the Next.js server
// function warm and (b) runs a trivial `SELECT 1` so Neon's compute does not
// auto-suspend. Together these remove most of the intermittent ~5s "first load
// after idle" delays on a low-traffic site.
//
// TRADEOFF: keeping Neon awake around the clock consumes compute-hours
// continuously. If that's a concern on your Neon plan, either:
//   - widen the schedule below (e.g. only business hours), or
//   - delete this function and instead raise "Suspend compute after" in the
//     Neon console (Project → Compute) so the DB stays warm without pinging.
//
// Neon's default idle-suspend is ~5 minutes, so the interval must stay under it.
export const config = { schedule: "*/5 * * * *" };

const keepWarm = async () => {
  const base =
    process.env.URL ?? process.env.DEPLOY_PRIME_URL ?? "https://quote-builder-pro.com";

  try {
    const response = await fetch(`${base}/api/health`, {
      headers: { "user-agent": "netlify-keep-warm" }
    });
    return new Response(`keep-warm: ${base}/api/health -> ${response.status}`, { status: 200 });
  } catch (error) {
    // Never fail the scheduled run; just report.
    return new Response(`keep-warm error: ${String(error)}`, { status: 200 });
  }
};

export default keepWarm;
