/** Links typed into the console — pages, other sites, or a placeholder that isn't filled in yet. */
const OWN_HOST = /(^|\.)ieee\.soc\.pdn\.ac\.lk$/i

/** What a link typed into the console points at. */
export function classifyHref(raw: string | null | undefined): { kind: 'internal' | 'external' | 'none'; href: string } {
  const url = (raw ?? '').trim()
  if (!url || /[\s[\]{}<>]/.test(url)) return { kind: 'none', href: '' }
  if (/^(mailto|tel):/i.test(url)) return { kind: 'external', href: url }
  if (/^(https?:)?\/\//i.test(url)) {
    try {
      const u = new URL(url.startsWith('//') ? `https:${url}` : url)
      if (OWN_HOST.test(u.hostname)) return { kind: 'internal', href: `${u.pathname}${u.search}${u.hash}` || '/' }
      return { kind: 'external', href: u.toString() }
    } catch {
      return { kind: 'none', href: '' }
    }
  }
  if (/^[/#?]/.test(url)) return { kind: 'internal', href: url }
  // "www.example.org/cfp" or "easychair.org/…" typed without https://
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+(\/|$)/i.test(url)) return { kind: 'external', href: `https://${url}` }
  return { kind: 'none', href: '' }
}

export const isExternalHref = (raw: string | null | undefined) => classifyHref(raw).kind === 'external'
