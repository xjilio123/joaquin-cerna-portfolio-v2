/**
 * Canonical origin. Vercel sets VERCEL_PROJECT_PRODUCTION_URL on every build,
 * so production, previews and the sitemap all point at the production domain
 * without any manual configuration.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000";
