import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:4000/api/:path*',
      },
    ];
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['*.loca.lt', '*.trycloudflare.com', 'localhost:4001', '127.0.0.1:4001'],
    },
  },
  // Next.js 15 development origin security bypass
  allowedDevOrigins: ['*.loca.lt', '*.trycloudflare.com', 'localhost:4001', '127.0.0.1:4001'],
};

export default nextConfig;
