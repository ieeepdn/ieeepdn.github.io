'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import { JustifiedRows, Lightbox, type Photo } from './ui/Photos'
import { Reveal } from './ui/motion'

export type GalleryAlbum = {
  id: string
  title: string
  date: string | null
  dateLabel: string | null
  description?: string | null
  chapter: { slug: string; shortName: string; accent: string } | null
  photos: Photo[]
}

const PREVIEW = 10

/** Albums as chapters of a story: a header per album, its photos in justified rows, one shared viewer. */
export function GalleryGrid({ albums, initialChapter }: { albums: GalleryAlbum[]; initialChapter?: string }) {
  const chapters = useMemo(() => {
    const m = new Map<string, { slug: string; shortName: string; accent: string }>()
    albums.forEach((a) => a.chapter && m.set(a.chapter.slug, a.chapter))
    return [...m.values()]
  }, [albums])
  const [filter, setFilter] = useState(initialChapter && chapters.some((c) => c.slug === initialChapter) ? initialChapter : 'all')
  const [open, setOpen] = useState<Record<string, boolean>>({})
  useEffect(() => {
    const ch = new URLSearchParams(window.location.search).get('chapter')
    if (ch && chapters.some((c) => c.slug === ch)) setFilter(ch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const visible = useMemo(() => albums.filter((a) => a.photos.length && (filter === 'all' || a.chapter?.slug === filter)), [albums, filter])
  // what each album shows right now, and where its photos start in the shared viewer
  const sections = useMemo(() => {
    let offset = 0
    return visible.map((a) => {
      const shown = open[a.id] ? a.photos : a.photos.slice(0, PREVIEW)
      const s = { album: a, shown, offset }
      offset += shown.length
      return s
    })
  }, [visible, open])
  const flat = useMemo(() => sections.flatMap((s) => s.shown), [sections])
  const total = visible.reduce((n, a) => n + a.photos.length, 0)

  const [index, setIndex] = useState<number | null>(null)
  const step = useCallback((d: number) => setIndex((i) => (i === null ? i : (i + d + flat.length) % flat.length)), [flat.length])

  return (
    <section className="bg-paper atmos pb-28 pt-10">
      <div className="container-x">
        <div className="sticky top-0 z-20 -mx-4 mb-12 flex flex-wrap items-center justify-between gap-4 border-b border-line bg-paper/85 px-4 py-4 backdrop-blur-xl">
          <div role="group" aria-label="Filter by chapter" className="flex flex-wrap gap-2">
            {[{ slug: 'all', shortName: 'Everything', accent: '#00629B' }, ...chapters].map((c) => (
              <button
                key={c.slug}
                type="button"
                aria-pressed={filter === c.slug}
                onClick={() => setFilter(c.slug)}
                className={clsx('h-11 rounded-full border px-4 text-sm font-semibold transition', filter === c.slug ? 'border-transparent text-white' : 'border-line bg-surface hover:border-ink/30')}
                style={filter === c.slug ? { background: c.accent } : undefined}
              >
                {c.shortName}
              </button>
            ))}
          </div>
          <span className="font-mono text-xs text-ink-3">
            {visible.length} albums · {total} photos
          </span>
        </div>

        <div className="flex flex-col gap-20">
          {sections.map(({ album: a, shown, offset }) => (
            <article key={a.id} aria-labelledby={`album-${a.id}`} className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10">
              <Reveal className="flex flex-col gap-3 lg:sticky lg:top-28 lg:self-start">
                <div className="flex flex-wrap items-center gap-2 font-mono text-[11.5px] uppercase tracking-[0.14em] text-ink-3">
                  {a.chapter && (
                    <span className="rounded-full px-2.5 py-1 font-sans text-xs font-semibold normal-case tracking-normal text-white" style={{ background: a.chapter.accent }}>
                      {a.chapter.shortName}
                    </span>
                  )}
                  {a.dateLabel && <span>{a.dateLabel}</span>}
                </div>
                <h2 id={`album-${a.id}`} className="font-display text-[1.75rem] font-extrabold leading-[1.05] tracking-[-0.03em]">
                  {a.title}
                </h2>
                {a.description && <p className="text-[15px] leading-relaxed text-ink-3">{a.description}</p>}
                <span className="text-sm text-ink-3">{a.photos.length} photos</span>
              </Reveal>
              <div className="flex flex-col gap-4">
                <JustifiedRows photos={shown} offset={offset} onOpen={setIndex} />
                {a.photos.length > PREVIEW && (
                  <button
                    type="button"
                    onClick={() => setOpen((o) => ({ ...o, [a.id]: !o[a.id] }))}
                    aria-expanded={Boolean(open[a.id])}
                    className="inline-flex h-11 w-fit items-center gap-2 rounded-full border border-line bg-surface px-5 text-sm font-semibold transition hover:border-ink/30"
                  >
                    {open[a.id] ? 'Show fewer' : `Show all ${a.photos.length} photos`}
                    <ChevronDown className={clsx('size-4 transition-transform', open[a.id] && 'rotate-180')} aria-hidden />
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
        {!sections.length && <p className="text-ink-3">No photos yet.</p>}
      </div>

      <Lightbox photos={flat} index={index} onClose={() => setIndex(null)} onStep={step} />
    </section>
  )
}
