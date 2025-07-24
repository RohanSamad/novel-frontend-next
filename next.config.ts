import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,

  images: {
    domains: ['development.mitprogrammer.com'],
    formats: ['image/webp', 'image/avif'], // ✅ Use modern image formats
  },

  // ✅ Optional: Add headers to improve caching
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
