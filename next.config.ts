import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // The root layout lives under app/[lang], so unmatched URLs need their own 404.
    globalNotFound: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    // Spanish is the default language; English lives at /en.
    return [{ source: "/", destination: "/es", permanent: false }];
  },
};

export default nextConfig;
