'use client';
import { useEffect } from 'react';
import Html from '@/components/Html';
import { chromePage, footer, error as markup } from '@/content/fragments';

export default function Error() {
  useEffect(() => {
    const s = document.createElement('script');
    s.src = '/js/needles-error.js';
    document.body.appendChild(s);
    return () => s.remove();
  }, []);
  return <Html html={`${chromePage}<main id="main">${markup}</main>${footer}`} />;
}
