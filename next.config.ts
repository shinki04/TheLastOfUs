import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  images: {
    loaderFile: "./lib/supabase/supabase-image-loader.ts",
    // remotePatterns: [
    //   {
    //     hostname: "gizvqzsieazwdfncjxrg.supabase.co",
    //     protocol: "https",
    //   },
    // ],
  },
};

export default nextConfig;
