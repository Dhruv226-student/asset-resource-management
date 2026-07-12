import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from external URLs (Unsplash avatars etc.)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Ensure JSON imports work
  experimental: {},
};

export default nextConfig;
