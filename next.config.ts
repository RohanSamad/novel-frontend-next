import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  images: {
    domains: ['development.mitprogrammer.com'],
  },
};

export default nextConfig;
