import type { Metadata, Viewport } from 'next';
import './site.css';
import Html from '@/components/Html';
import { sprite, loader } from '@/content/fragments';
import { site, description, ogImage } from '@/content/site';

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: { default: 'Alyona Ryzhenko, Product Designer', template: '%s | Alyona Ryzhenko' },
  description,
  alternates: { canonical: '/' },
  openGraph: { type: 'website', siteName: 'Alyona Ryzhenko', title: 'Alyona Ryzhenko, Product Designer', description, url: '/', locale: 'en_US', images: [ogImage] },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

// Runs before the page paints: saved theme, loader once per visit, and old #case links from the draft.
const boot = `(function(){var d=document.documentElement;try{var t=localStorage.getItem('ar-theme');if(t)d.setAttribute('data-ar-theme',t)}catch(e){}
var s=false;try{s=sessionStorage.getItem('ar-seen')==='1'}catch(e){}d.classList.add(s?'no-loader':'loading');
var h=location.hash.slice(1);if(location.pathname==='/'&&/^(secure-messenger|identity-app|hr-platform|defentry)$/.test(h))location.replace('/work/'+h)})()`;

// Hides the name letters until the sequence starts, so they build in letter by letter.
const loaderPrep = `<script>(function(){var l=document.getElementById('loader'),d=document.documentElement;if(!l||d.classList.contains('no-loader'))return;l.style.animation='none';if(!matchMedia('(prefers-reduced-motion: reduce)').matches)l.classList.add('pre')})()</script>`;

const fonts = ['barlow-condensed-500', 'barlow-400', 'barlow-600'];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
        {fonts.map(f => <link key={f} rel="preload" href={`/fonts/${f}.woff2`} as="font" type="font/woff2" crossOrigin="" />)}
      </head>
      <body suppressHydrationWarning>
        <Html html={sprite + loader + loaderPrep} />
        {children}
        <script src="/js/site.js" />
      </body>
    </html>
  );
}
