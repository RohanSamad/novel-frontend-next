import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,

  images: {
    remotePatterns: [
      {
         protocol: 'https',
        hostname: 's3.eu-central-003.backblazeb2.com',
        pathname: '/**',
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "development.mitprogrammer.com",
        pathname: "/storage/**",
      },
    ],
    formats: ["image/webp", "image/avif"],
  },

  async headers() {
    return [
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=59",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
