import type { Photo } from '@/components/ui/Photos'
import { asMedia, mediaUrl, type MaybeMedia } from './media'

/** Turn Payload media into the Photo shape used by the justified rows, mosaics and the lightbox. */
export function toPhoto(m: MaybeMedia, extra: Partial<Photo> = {}): (Photo & { fx: number; fy: number }) | null {
  const media = asMedia(m)
  const src = mediaUrl(media, 'card')
  const full = mediaUrl(media, 'hero') ?? src
  if (!media || !src || !full) return null
  return {
    src,
    full,
    alt: media.alt || extra.caption || '',
    w: media.width || 4,
    h: media.height || 3,
    fx: typeof media.focalX === 'number' ? media.focalX : 50,
    fy: typeof media.focalY === 'number' ? media.focalY : 50,
    ...extra,
  }
}

export const isPhoto = <T,>(p: T | null): p is T => p !== null
