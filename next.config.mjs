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
    // Block framing everywhere EXCEPT the embeddable surface (/embed/* and /embed.js), which must be
    // framable by customer sites. The negative lookahead keeps a single CSP from matching those routes.
    const frameGuard = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Content-Security-Policy", value: "frame-ancestors 'none'" }
    ];

    return [
      { source: "/:path*", headers: baseHeaders },
      { source: "/((?!embed/|embed\\.js).*)", headers: frameGuard }
    ];
  }
};

export default nextConfig;
