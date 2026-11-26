import Html from './Html';
import { chromeHome, chromePage, footer } from '@/content/fragments';

/** One page: skip link, scroll bar, phone menu and top nav, then the page content and the footer. */
export default function Page({ main, home = false, scripts = [] }: { main: string; home?: boolean; scripts?: string[] }) {
  return (
    <>
      <Html html={`${home ? chromeHome : chromePage}<main id="main">${main}</main>${footer}`} />
      {scripts.map(src => <script key={src} src={src} />)}
    </>
  );
}
