import Image from 'next/image'
import clsx from 'clsx'
import type { MediaInfo } from '@/lib/media'

/**
 * One frame for every image on the site.
 *
 * - Photos that roughly fit the frame are cropped around their focal point (set in the console).
 * - Posters, flyers and anything with a very different shape are never cropped: the whole image is
 *   shown, sitting on a blurred, colour-matched copy of itself. Event posters carry their text in
 *   the artwork, so cropping them loses information.
 */
export function MediaFrame({
  media,
  ratio,
  sizes,
  priority,
  className,
  fit = 'auto',
  zoom = true,
  fill,
  children,
}: {
  media: MediaInfo | null
  /** frame width / height, e.g. 16 / 9 */
  ratio?: number
  sizes: string
  priority?: boolean
  /** fill a positioned parent instead of setting an aspect ratio */
  className?: string
  fit?: 'auto' | 'cover' | 'contain'
  zoom?: boolean
  /** the frame is sized by its parent (className positions it); ratio is only used to pick the fit */
  fill?: boolean
  children?: React.ReactNode
}) {
  const shape = media ? media.width / media.height : 1
  const frame = ratio ?? shape
  const mismatch = Math.abs(Math.log(shape / frame))
  // > ~30% off the frame's shape (a square poster in a 16:9 card, a phone photo in a landscape slot)
  const contain = fit === 'contain' || (fit === 'auto' && mismatch > Math.log(1.3))

  return (
    <div
      className={clsx('isolate overflow-hidden', contain ? 'bg-night-2' : 'bg-paper-2', !/\b(absolute|fixed)\b/.test(className ?? '') && 'relative', className)}
      style={ratio && !fill ? { aspectRatio: String(ratio) } : undefined}
    >
      {media &&
        (contain ? (
          <>
            <Image
              src={media.thumb}
              alt=""
              aria-hidden
              fill
              sizes="120px"
              className="-z-10 scale-125 object-cover opacity-90 blur-2xl saturate-150"
            />
            <div aria-hidden className="absolute inset-0 -z-10 bg-night/25" />
            <Image
              src={media.src}
              alt={media.alt}
              fill
              priority={priority}
              sizes={sizes}
              className={clsx(
                'object-contain p-[4%] drop-shadow-[0_18px_30px_rgba(3,10,19,0.45)] transition duration-700',
                zoom && 'group-hover:scale-[1.03]',
              )}
            />
          </>
        ) : (
          <Image
            src={media.src}
            alt={media.alt}
            fill
            priority={priority}
            sizes={sizes}
            className={clsx('object-cover transition duration-[1.1s] ease-out', zoom && 'group-hover:scale-[1.05]')}
            style={{ objectPosition: `${media.fx}% ${media.fy}%` }}
          />
        ))}
      {children}
    </div>
  )
}
