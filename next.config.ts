import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://www.yallashoot-ball.com",
    "https://yallashoot-ball.com",
  ],

  // Allow Next.js <Image> to serve assets from the stream CDN
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "stream.yalashout.online",
      },
      {
        protocol: "https",
        hostname: "imagecache.365scores.com",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // 1. Permanent 301 for all historical Arabic route prefixes (/ar/...)
      {
        source: "/ar/:path*",
        destination: "/",
        permanent: true,
      },
      // 2. Permanent 301 for other sports (basketball, volleyball, tennis, handball)
      {
        source: "/:sport(basketball|volleyball|tennis|handball)/:path*",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
