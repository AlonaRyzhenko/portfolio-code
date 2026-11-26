import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Page from '@/components/Page';
import * as f from '@/content/fragments';
import { cases, slugs, type Slug } from '@/content/cases';
import { ogImage } from '@/content/site';

const html: Record<Slug, string> = {
  'secure-messenger': f.case_secure_messenger,
  'identity-app': f.case_identity_app,
  'hr-platform': f.case_hr_platform,
  defentry: f.case_defentry,
};
const scripts: Partial<Record<Slug, string[]>> = {};

// Only these cases are published. Archived ones (Habits tracker) are not built and show the 404 page.
export const dynamicParams = false;
export function generateStaticParams() {
  return slugs.map(slug => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = cases[slug as Slug];
  if (!c) return {};
  return {
    title: c.title,
    description: c.description,
    alternates: { canonical: `/work/${slug}` },
    openGraph: { title: `${c.title} | Alyona Ryzhenko`, description: c.description, url: `/work/${slug}`, images: [ogImage] },
  };
}

export default async function CasePage({ params }: Props) {
  const { slug } = await params;
  if (!(slug in html)) notFound();
  return <Page main={html[slug as Slug]} scripts={scripts[slug as Slug]} />;
}
