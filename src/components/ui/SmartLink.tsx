import Link from 'next/link'
import type React from 'react'
import { classifyHref } from '@/lib/links'

export { classifyHref, isExternalHref } from '@/lib/links'

/**
 * A link that never breaks the page: internal paths use next/link, other sites open in a new tab,
 * and placeholder or malformed links ("[paste the link]") render as an inert, dimmed element.
 */
export function SmartLink({
  href,
  className,
  style,
  children,
  ...rest
}: { href: string | null | undefined; className?: string; style?: React.CSSProperties; children: React.ReactNode } & Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  'href' | 'className' | 'style' | 'children'
>) {
  const { kind, href: url } = classifyHref(href)
  if (kind === 'internal')
    return (
      <Link href={url} className={className} style={style} {...rest}>
        {children}
      </Link>
    )
  if (kind === 'external')
    return (
      <a href={url} target="_blank" rel="noreferrer" className={className} style={style} {...rest}>
        {children}
      </a>
    )
  return (
    <span className={className} style={{ ...style, opacity: 0.55, cursor: 'not-allowed' }} aria-disabled="true" title="Link not set yet">
      {children}
    </span>
  )
}
