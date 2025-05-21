import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'cdnjs.cloudflare.com',
    },
  ],
},
};

export default nextConfig;
