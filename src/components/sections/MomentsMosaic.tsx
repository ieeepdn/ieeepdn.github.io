'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import { ArrowUpRight, Images } from 'lucide-react'
import clsx from 'clsx'
import { Lightbox, type Photo } from '../ui/Photos'
import { Reveal } from '../ui/motion'

export type MosaicPhoto = Photo & { fx?: number; fy?: number }

/**
 * Editorial photo mosaic: one lead photo, three supporting ones and a gallery door.
 * Static on purpose — auto-scrolling strips get ignored and are hard to read.
 * Picks landscape event photos (posters stay in the gallery, where they are shown uncropped)
 * and spreads the picks across albums.
 */
function pick(photos: MosaicPhoto[], n: number) {
  const ratio = (p: MosaicPhoto) => p.w / p.h
  const good = photos.filter((p) => ratio(p) >= 1.2 && ratio(p) <= 2.2)
  const pool = good.length >= n ? good : [...good, ...photos.filter((p) => !good.includes(p))]
  const byAlbum = new Map<string, MosaicPhoto[]>()
  for (const p of pool) {
    const k = p.caption ?? ''
    if (!byAlbum.has(k)) byAlbum.set(k, [])
    byAlbum.get(k)!.push(p)
  }
  const lanes = [...byAlbum.values()]
  const out: MosaicPhoto[] = []
  for (let round = 0; out.length < n && lanes.some((l) => l.length > round); round++) {
    for (const l of lanes) if (l[round] && out.length < n) out.push(l[round])
  }
  return out
}

export function MomentsMosaic({
  photos,
  eyebrow = 'Moments',
  title,
  galleryHref = '/gallery',
  totalLabel,
  variant = 'light',
}: {
  photos: MosaicPhoto[]
  eyebrow?: string
  title: string
  galleryHref?: string
  totalLabel?: string
  variant?: 'light' | 'dark'
}) {
  const tiles = useMemo(() => pick(photos, 5), [photos])
  const [index, setIndex] = useState<number | null>(null)
  const step = useCallback((d: number) => setIndex((i) => (i === null ? i : (i + d + tiles.length) % tiles.length)), [tiles.length])
  if (tiles.length < 4) return null
  const dark = variant === 'dark'
  const door = tiles.length >= 5 ? tiles[4] : null
  const shown = tiles.slice(0, 4)

  return (
    <section className={clsx('relative overflow-hidden py-24 md:py-32', dark ? 'bg-night text-white' : 'bg-paper atmos')}>
      <div className="container-x">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="flex flex-col gap-4">
            <Reveal>
              <span className={clsx('eyebrow', dark ? 'text-cyan' : 'text-brand')}>{eyebrow}</span>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="max-w-[18ch] font-display text-[clamp(2.4rem,5vw,4.6rem)] font-extrabold leading-[0.98] tracking-[-0.04em]">{title}</h2>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <Link
              href={galleryHref}
              className={clsx(
                'group inline-flex items-center gap-2 rounded-full border px-5 py-3 font-semibold transition',
                dark ? 'border-white/20 hover:border-white hover:bg-white hover:text-night' : 'border-ink/15 hover:border-ink hover:bg-ink hover:text-paper',
              )}
            >
              Open the gallery <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" aria-hidden />
            </Link>
          </Reveal>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-[14rem_14rem] md:gap-4 lg:grid-rows-[17rem_17rem]">
          {shown.map((p, i) => (
            <Reveal
              key={p.full}
              delay={i * 0.06}
              className={clsx(i === 0 ? 'col-span-2 aspect-[4/3] md:row-span-2 md:aspect-auto' : 'aspect-square md:aspect-auto', i === 3 && !door && 'col-span-2')}
            >
              <button
                type="button"
                onClick={() => setIndex(i)}
                className="group relative block size-full overflow-hidden rounded-2xl bg-night-2 md:rounded-[1.5rem]"
                aria-label={`Open photo: ${p.alt || p.caption || 'event photo'}`}
              >
                <Image
                  src={i === 0 ? p.full : p.src}
                  alt={p.alt}
                  fill
                  sizes={i === 0 ? '(min-width: 768px) 50vw, 100vw' : '(min-width: 768px) 25vw, 50vw'}
                  className="object-cover transition duration-[1.2s] ease-out group-hover:scale-[1.05]"
                  style={{ objectPosition: `${p.fx ?? 50}% ${p.fy ?? 50}%` }}
                />
                <span
                  className={clsx(
                    'pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-night/85 via-night/30 to-transparent p-4 pt-16 text-left text-white transition duration-500',
                    i === 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100',
                  )}
                >
                  <span className={clsx('line-clamp-2 font-display font-bold leading-tight', i === 0 ? 'text-xl md:text-2xl' : 'text-[15px]')}>{p.caption}</span>
                  {p.chip && (
                    <span className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: p.chip.accent }}>
                      {p.chip.label}
                    </span>
                  )}
                </span>
              </button>
            </Reveal>
          ))}
          {door && (
            <Reveal delay={0.24} className="aspect-square md:aspect-auto">
              <Link href={galleryHref} className="group relative flex size-full flex-col justify-end overflow-hidden rounded-2xl bg-night-2 p-5 text-white md:rounded-[1.5rem]">
                <Image
                  src={door.src}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover opacity-45 transition duration-[1.2s] group-hover:scale-105 group-hover:opacity-60"
                  style={{ objectPosition: `${door.fx ?? 50}% ${door.fy ?? 50}%` }}
                />
                <span className="absolute inset-0 bg-gradient-to-br from-ieee/70 via-night/40 to-night/80" />
                <Images className="relative mb-auto size-6 text-cyan" aria-hidden />
                <span className="relative font-display text-2xl font-extrabold leading-tight tracking-[-0.02em]">See every album</span>
                {totalLabel && <span className="relative mt-1 text-sm text-white/75">{totalLabel}</span>}
                <ArrowUpRight className="absolute right-5 top-5 size-5 transition-transform duration-500 group-hover:rotate-45" aria-hidden />
              </Link>
            </Reveal>
          )}
        </div>
      </div>
      <Lightbox photos={shown} index={index} onClose={() => setIndex(null)} onStep={step} />
    </section>
  )
}
