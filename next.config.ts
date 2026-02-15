import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jznsftbszpqsbijqyfgw.supabase.co",
        pathname: "**",
      },
    ],
  },

  /* Permitir fotos mas pesadas 4MB */
  experimental: {
    serverActions: {
      bodySizeLimit: "4MB",
    },
  },
};

export default nextConfig;
