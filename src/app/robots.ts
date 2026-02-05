import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/todo'],
    },
    sitemap: 'https://morpheuxx.meimberg.io/sitemap.xml',
  };
}
