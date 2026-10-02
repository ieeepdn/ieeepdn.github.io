import type { Chapter, Media } from '@/payload-types'

export type MaybeMedia = number | Media | null | undefined

export const asMedia = (m: MaybeMedia): Media | null => (m && typeof m === 'object' ? m : null)

/** Payload returns absolute URLs when serverURL is set — keep them relative so next/image treats them as local. */
const relative = (url?: string | null) => {
  if (!url) return null
  if (/^https?:\/\//.test(url)) {
    try {
      const u = new URL(url)
      if (u.pathname.startsWith('/api/media/')) return u.pathname + u.search
    } catch {}
  }
  return url
}

export const mediaUrl = (m: MaybeMedia, size: 'thumb' | 'card' | 'hero' | 'original' = 'card'): string | null => {
  const media = asMedia(m)
  if (!media) return null
  if (size !== 'original') {
    const s = media.sizes?.[size]
    if (s?.url) return relative(s.url)
  }
  return relative(media.url)
}

export type MediaInfo = {
  src: string
  /** small version for blurred backdrops */
  thumb: string
  alt: string
  width: number
  height: number
  /** focal point in % (Payload's focal point tool), defaults to the centre */
  fx: number
  fy: number
}

/** Everything a layout needs to place an image well: URL, intrinsic size and focal point. */
export const mediaInfo = (m: MaybeMedia, size: 'thumb' | 'card' | 'hero' = 'card', fallbackAlt = ''): MediaInfo | null => {
  const media = asMedia(m)
  const src = mediaUrl(media, size)
  if (!media || !src) return null
  return {
    src,
    thumb: mediaUrl(media, 'thumb') ?? src,
    alt: media.alt || fallbackAlt,
    width: media.width || 4,
    height: media.height || 3,
    fx: typeof media.focalX === 'number' ? media.focalX : 50,
    fy: typeof media.focalY === 'number' ? media.focalY : 50,
  }
}

/** Exposes a chapter accent as --accent for the .accent-text / .accent-chip utilities (theme-aware). */
export const accentVars = (accent?: string | null) => ({ '--accent': accent || '#00629B' }) as React.CSSProperties

export const asChapter = (c: number | Chapter | null | undefined): Chapter | null =>
  c && typeof c === 'object' ? c : null
