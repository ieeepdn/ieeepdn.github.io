import clsx from 'clsx'

/**
 * Rich text from the content files. Pages CMS stores rich text as HTML (its editor only produces safe,
 * simple markup: paragraphs, headings, lists, links, images), so it is rendered as-is.
 */
export function RichText({ data, className }: { data: unknown; className?: string }) {
  if (!data || typeof data !== 'string') return null
  const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const html = base ? data.replace(/(src|href)="\/(?!\/)/g, `$1="${base}/`) : data
  return <div className={clsx('rich-text', className)} dangerouslySetInnerHTML={{ __html: html }} />
}
