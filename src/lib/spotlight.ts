import type { Page, SiteSetting } from '@/payload-types'
import { mediaInfo, mediaUrl, type MediaInfo } from './media'
import { classifyHref } from './links'

export type SpotlightButton = { label: string; url: string; variant?: 'primary' | 'secondary' | null; id?: string | null }

export type Spotlight = {
  style: 'hero' | 'banner'
  href: string
  external: boolean
  eyebrow: string | null
  title: string
  text: string | null
  dateLabel: string | null
  venue: string | null
  countdownTo: string | null
  countdownLabel: string | null
  image: MediaInfo | null
  logo: string | null
  accent: string
  buttons: SpotlightButton[]
  topBar: { text: string; url: string } | null
  menu: { label: string; href: string; external: boolean; accent: string } | null
}


/**
 * The home-page spotlight, if it should show right now. Anything left empty falls back to the linked
 * page (its title, card text, cover and colour), so pointing it at a conference page is enough.
 */
export function activeSpotlight(settings: SiteSetting | null | undefined, linked?: Page | null, now = Date.now()): Spotlight | null {
  const s = settings?.spotlight
  if (!s?.active) return null
  if (s.showFrom && new Date(s.showFrom).getTime() > now) return null
  if (s.showUntil && new Date(s.showUntil).getTime() < now) return null

  const page = s.linkType === 'url' ? null : (linked ?? (s.page && typeof s.page === 'object' ? (s.page as Page) : null))
  if (page && page._status !== 'published') return null
  const target = classifyHref(s.linkType === 'url' ? s.url : page ? page.url || page.path : '')
  const href = target.kind === 'none' ? '' : target.href
  const title = s.title?.trim() || page?.title || ''
  if (!title || !href) return null

  const hero = (page?.layout ?? []).find((b) => b.blockType === 'hero' && !b.hidden) as { image?: unknown; dateLabel?: string | null; countdownTo?: string | null } | undefined
  const chapterAccent = page?.chapter && typeof page.chapter === 'object' ? page.chapter.accent : null
  const accent = s.accent || page?.accent || chapterAccent || '#00629B'
  const external = target.kind === 'external'
  const buttons = (s.buttons ?? []).filter((b) => b.label && b.url) as SpotlightButton[]

  return {
    style: s.style === 'hero' ? 'hero' : 'banner',
    href,
    external,
    eyebrow: s.eyebrow || null,
    title,
    text: s.text || page?.summary || null,
    dateLabel: s.dateLabel || hero?.dateLabel || null,
    venue: s.venue || null,
    countdownTo: s.countdownTo || hero?.countdownTo || null,
    countdownLabel: s.countdownLabel || null,
    image: mediaInfo(s.image, 'hero', title) ?? mediaInfo(page?.cover, 'hero', title) ?? mediaInfo(hero?.image as never, 'hero', title),
    logo: mediaUrl(s.logo, 'card'),
    accent,
    buttons: buttons.length ? buttons : [{ label: 'Learn more', url: href, variant: 'primary' }],
    topBar: s.inTopBar ? { text: s.topBarText?.trim() || [title, s.dateLabel].filter(Boolean).join(' · '), url: href } : null,
    menu: s.inMenu ? { label: s.menuLabel?.trim() || title.split(/\s[—–-]\s/)[0].slice(0, 28), href, external, accent } : null,
  }
}
