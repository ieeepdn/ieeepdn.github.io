'use client'
import Image from 'next/image'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'
import clsx from 'clsx'
import { getLenis } from './SmoothScroll'

export type Photo = {
  /** grid-size image */
  src: string
  /** large image for the lightbox (≥ 2× the grid size) */
  full: string
  alt: string
  w: number
  h: number
  caption?: string | null
  chip?: { label: string; accent: string } | null
}

/**
 * Justified rows (the Flickr / Google Photos layout): every photo keeps its own shape, rows run edge
 * to edge and share one height, and reading order stays left → right. Nothing is cropped.
 */
export function JustifiedRows({
  photos,
  onOpen,
  offset = 0,
  className,
  rows = '[--row:140px] sm:[--row:180px] lg:[--row:230px]',
}: {
  photos: Photo[]
  onOpen: (index: number) => void
  offset?: number
  className?: string
  rows?: string
}) {
  return (
    <ul className={clsx('flex flex-wrap gap-2 md:gap-3', rows, className)}>
      {photos.map((p, i) => {
        const r = Math.min(Math.max(p.w / p.h, 0.5), 3)
        return (
          <li key={p.full + i} className="min-w-0" style={{ flexGrow: r, flexBasis: `calc(var(--row) * ${r.toFixed(3)})` }}>
            <button
              type="button"
              onClick={() => onOpen(offset + i)}
              className="group relative block w-full overflow-hidden rounded-xl bg-paper-2 focus-visible:outline-offset-2"
              style={{ aspectRatio: `${r}` }}
              aria-label={`Open photo${p.alt ? `: ${p.alt}` : ''}`}
            >
              <Image
                src={p.src}
                alt={p.alt}
                fill
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 70vw"
                className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
              />
              <span className="pointer-events-none absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-night/55 text-white opacity-0 backdrop-blur transition group-hover:opacity-100 group-focus-visible:opacity-100">
                <Expand className="size-3.5" aria-hidden />
              </span>
            </button>
          </li>
        )
      })}
      {/* keeps the last row at its natural height instead of stretching it */}
      <li aria-hidden className="h-0 grow-[999]" />
    </ul>
  )
}

/** Full-screen viewer: arrows, Esc, swipe; focus moves in and comes back. */
export function Lightbox({ photos, index, onClose, onStep }: { photos: Photo[]; index: number | null; onClose: () => void; onStep: (d: number) => void }) {
  const current = index !== null ? photos[index] : null
  const closeRef = useRef<HTMLButtonElement>(null)
  const returnTo = useRef<HTMLElement | null>(null)
  const touch = useRef<number | null>(null)

  useEffect(() => {
    if (index === null) return
    returnTo.current = document.activeElement as HTMLElement | null
    getLenis()?.stop()
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onStep(1)
      if (e.key === 'ArrowLeft') onStep(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      getLenis()?.start()
      returnTo.current?.focus?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index === null])

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          className="fixed inset-0 z-[90] flex flex-col bg-night/95 text-white backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={current.caption || current.alt || 'Photo viewer'}
          onPointerDown={(e) => (touch.current = e.clientX)}
          onPointerUp={(e) => {
            if (touch.current === null) return
            const dx = e.clientX - touch.current
            touch.current = null
            if (Math.abs(dx) > 60) onStep(dx < 0 ? 1 : -1)
          }}
        >
          <div className="flex items-center justify-between gap-4 p-4 md:p-6">
            <div className="flex min-w-0 items-center gap-3">
              {current.chip && (
                <span className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: current.chip.accent }}>
                  {current.chip.label}
                </span>
              )}
              <span className="truncate text-sm text-white/80">{current.caption}</span>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="font-mono text-xs text-white/60" aria-live="polite">
                {(index ?? 0) + 1} / {photos.length}
              </span>
              <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="grid size-11 place-items-center rounded-full bg-white/10 hover:bg-white/20">
                <X className="size-5" aria-hidden />
              </button>
            </div>
          </div>

          <div className="relative min-h-0 flex-1 px-4 md:px-20" onClick={onClose}>
            <motion.div
              key={current.full}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative size-full"
            >
              <Image src={current.full} alt={current.alt} fill sizes="100vw" className="object-contain" onClick={(e) => e.stopPropagation()} />
            </motion.div>
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onStep(-1)
                  }}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 hover:bg-white/20 md:left-5"
                >
                  <ChevronLeft className="size-6" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onStep(1)
                  }}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 hover:bg-white/20 md:right-5"
                >
                  <ChevronRight className="size-6" aria-hidden />
                </button>
              </>
            )}
          </div>
          <p className="px-6 pb-5 pt-3 text-center text-[13px] text-white/60">{current.alt}</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Rows + viewer in one, for article galleries. */
export function PhotoSet({ photos, className, rows }: { photos: Photo[]; className?: string; rows?: string }) {
  const [index, setIndex] = useState<number | null>(null)
  const step = useCallback((d: number) => setIndex((i) => (i === null ? i : (i + d + photos.length) % photos.length)), [photos.length])
  if (!photos.length) return null
  return (
    <>
      <JustifiedRows photos={photos} onOpen={setIndex} className={className} rows={rows} />
      <Lightbox photos={photos} index={index} onClose={() => setIndex(null)} onStep={step} />
    </>
  )
}
