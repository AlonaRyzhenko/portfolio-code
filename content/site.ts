/** Public address of the site. Set SITE_URL in Vercel once the custom domain is moved. */
export const site =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

export const description =
  'Product designer in Kyiv. I turn chaos into clear structure for complex B2B products, build the design systems behind them, and work with AI from research to working code.';

/** Social sharing image (1200×630), a still of the homepage hero. */
export const ogImage = { url: '/og-v2.png', width: 1200, height: 630, alt: 'Alyona Ryzhenko, Product Designer' };
