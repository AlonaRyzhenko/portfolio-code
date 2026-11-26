/** Renders approved markup from content/fragments.ts as is, without adding a wrapper box. */
export default function Html({ html }: { html: string }) {
  return <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}
