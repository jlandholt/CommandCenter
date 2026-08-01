import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  allowedDevOrigins: ['10.0.0.71'],
  devIndicators: {
    position: 'top-right',
  },
};

export default nextConfig;