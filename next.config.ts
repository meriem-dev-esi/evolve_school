import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Points the plugin at our request config. Without the argument it looks for
// `./i18n/request.ts` by default anyway, but naming it means moving the file
// fails loudly at build time instead of silently serving untranslated pages.
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Type and lint errors fail the build. Next's defaults already do this; it is
  // written down because the usual "unblock the deploy" fix is to set these to
  // true, and a reviewer should see that happen in a diff.
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
};

export default withNextIntl(nextConfig);
