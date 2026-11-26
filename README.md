# portfolio-code

The code behind my portfolio, [alyonaryzhenko.com](https://www.alyonaryzhenko.com).

I'm a product designer. I designed this site and built it myself with Claude Code, from a single approved HTML draft to a Next.js site on Vercel. This repository shows how it works. The case studies, images and texts stay private, so the case pages here are placeholders.

## What's inside

| Part | Where |
| --- | --- |
| Next.js App Router: one page per case, static generation, metadata, sitemap, 404 and error pages | `app/` |
| Hero "needles": thin dashes on a canvas that funnel into one line between the headline and subtitle | `public/js/site.js` |
| Flowing light with film grain, a small WebGL shader | `public/js/site.js` (`startFlow`) |
| Loading screen: the name builds letter by letter, once per visit | `public/js/site.js`, `app/layout.tsx` |
| Light and dark theme, remembered on the device, applied before the first paint | `app/layout.tsx` |
| Page switch with cross-document view transitions | `app/site.css` |
| Design tokens: colour, type, spacing, radius for both themes | `app/site.css` (`:root`) |
| Same dashes on the 404 and error pages | `public/js/needles-error.js` |

Everything respects `prefers-reduced-motion`, and canvases pause when they leave the screen.

## Run it

```bash
npm install
npm run dev
```

Needs Node 20.9 or newer.

## Stack

Next.js 16, React 19, TypeScript, plain CSS, Canvas 2D and WebGL. Fonts: Barlow and Barlow Condensed (SIL Open Font License).

## Licence

You are welcome to read the code and learn from it. Please don't reuse the design, texts or images.
