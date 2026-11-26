import type { Metadata } from 'next';
import Page from '@/components/Page';
import { notFound as markup } from '@/content/fragments';

export const metadata: Metadata = { title: 'Page not found', robots: { index: false } };

export default function NotFound() {
  return <Page main={markup} scripts={['/js/needles-error.js']} />;
}
