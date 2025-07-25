import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Skip type checking during production build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
