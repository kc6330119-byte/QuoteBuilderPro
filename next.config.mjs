/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tree-shake icon imports so the full lucide set never lands in a client chunk.
  experimental: {
    optimizePackageImports: ["lucide-react"]
  },
  async headers() {
    const baseHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }
    ];
    // Allow SAME-ORIGIN framing (so the dashboard can preview its own /preview pages in an iframe) while
    // still blocking cross-origin framing — the actual clickjacking threat. The embeddable surface
    // (/embed/* and /embed.js) is exempt entirely below so customer sites can frame it cross-origin.
    const frameGuard = [
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Content-Security-Policy", value: "frame-ancestors 'self'" }
    ];

    return [
      { source: "/:path*", headers: baseHeaders },
      { source: "/((?!embed/|embed\\.js).*)", headers: frameGuard }
    ];
  }
};

export default nextConfig;
