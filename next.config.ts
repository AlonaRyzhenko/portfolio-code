import type { NextConfig } from 'next';

const immutable = [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      // Image and font names are content hashes, so browsers can keep them for a year.
      { source: '/img/:path*', headers: immutable },
      { source: '/fonts/:path*', headers: immutable },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },
};

export default nextConfig;
