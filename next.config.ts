import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Headers",
            value: "rsc, next-url, next-router-prefetch, next-router-state-tree",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
