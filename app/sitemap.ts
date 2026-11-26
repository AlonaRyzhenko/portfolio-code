import type { MetadataRoute } from 'next';
import { site } from '@/content/site';
import { slugs } from '@/content/cases';

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: site, priority: 1 }, ...slugs.map(s => ({ url: `${site}/work/${s}`, priority: 0.8 }))];
}
