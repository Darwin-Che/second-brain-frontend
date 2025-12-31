import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const backend = process.env.BACKEND_URL || 'http://localhost:4000';

    return [
      {
        source: '/api/:path*',
        destination: `${backend}/api/:path*`,
      },
      // Optionally proxy authentication endpoints if your backend exposes them at /auth
      {
        source: '/auth/:path*',
        destination: `${backend}/auth/:path*`,
      },
    ];
  },
  // NOTE: we intentionally do NOT expose the backend URL to the browser here.
  // All client code should call relative paths like `/api/...` so Next.js can
  // proxy those requests server-side using the BACKEND_URL env var.
  // keep any other existing TS-specific options if needed
  reactCompiler: true,
};

export default nextConfig;
