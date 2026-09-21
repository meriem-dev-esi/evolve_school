import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Points the plugin at our request config. Without the argument it looks for
// `./i18n/request.ts` by default anyway, but naming it means moving the file
// fails loudly at build time instead of silently serving untranslated pages.
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
  // File compression (Gzip / Brotli)
  compress: true,
  // Optimized image domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
