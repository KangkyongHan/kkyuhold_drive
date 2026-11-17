import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    if (rawApiUrl && rawApiUrl.startsWith('http')) {
      const cleanUrl = rawApiUrl.replace(/\/+$/, '');
      const destination = cleanUrl.endsWith('/api') ? `${cleanUrl}/:path*` : `${cleanUrl}/api/:path*`;
      return [
        {
          source: '/api/:path*',
          destination,
        },
      ];
    }
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
  allowedDevOrigins: ['*.loca.lt', '*.trycloudflare.com', 'localhost:4001', '127.0.0.1:4001'],
};

export default nextConfig;
