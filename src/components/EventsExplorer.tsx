'use client'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { CalendarPlus, Search } from 'lucide-react'
import clsx from 'clsx'
import type { Event } from '@/payload-types'
import { EventCard } from './EventCard'

type ChapterChip = { id: number; slug: string; shortName: string; accent: string; kind: string }

const categories = [
  ['all', 'All types'],
  ['talk', 'Talks'],
  ['workshop', 'Workshops'],
  ['competition', 'Competitions'],
  ['visit', 'Field visits'],
  ['social', 'Outreach'],
] as const

export function EventsExplorer({
  upcoming,
  past,
  chapters,
  initialChapter,
  initialWhen,
}: {
  upcoming: Event[]
  past: Event[]
  chapters: ChapterChip[]
  initialChapter?: string
  initialWhen: 'upcoming' | 'past'
}) {
  const [when, setWhen] = useState<'upcoming' | 'past'>(initialWhen)
  const [chapter, setChapter] = useState<string>(initialChapter && chapters.some((c) => c.slug === initialChapter) ? initialChapter : 'all')
  const [cat, setCat] = useState<string>('all')
  const [q, setQ] = useState('')
  // static site: ?chapter=cs&when=past is read in the browser
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    const ch = sp.get('chapter')
    if (ch && chapters.some((c) => c.slug === ch)) setChapter(ch)
    if (sp.get('when') === 'past') setWhen('past')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const list = useMemo(() => {
    const src = when === 'upcoming' ? upcoming : past
    const needle = q.trim().toLowerCase()
    return src.filter((e) => {
      const ch = typeof e.chapter === 'object' && e.chapter ? e.chapter.slug : null
      if (chapter !== 'all' && ch !== chapter) return false
      if (cat !== 'all' && e.category !== cat) return false
      if (needle && !`${e.title} ${e.summary ?? ''} ${e.venue ?? ''}`.toLowerCase().includes(needle)) return false
      return true
    })
  }, [when, chapter, cat, q, upcoming, past])

  const chapterName = chapters.find((c) => c.slug === chapter)?.shortName

  return (
    <section className="bg-paper atmos pb-28">
      <div className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur-xl">
        <div className="container-x flex flex-col gap-4 py-4 lg:flex-row lg:items-center">
          <div role="group" aria-label="When" className="flex w-fit rounded-full bg-paper-2 p-1">
            {(['upcoming', 'past'] as const).map((w) => (
              <button
                key={w}
                type="button"
                aria-pressed={when === w}
                onClick={() => setWhen(w)}
                className={clsx('relative h-11 rounded-full px-5 text-[15px] font-semibold transition-colors', when === w ? 'text-paper' : 'text-ink-2 hover:text-ink')}
              >
                {when === w && <motion.span layoutId="when-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                <span className="relative">
                  {w === 'upcoming' ? 'Upcoming' : 'Past'} <span className="font-mono text-xs opacity-60">{w === 'upcoming' ? upcoming.length : past.length}</span>
                </span>
              </button>
            ))}
          </div>
          <div role="group" aria-label="Chapter" className="-mx-1 flex flex-1 gap-2 overflow-x-auto px-1 pb-1 lg:pb-0">
            {[{ slug: 'all', shortName: 'All chapters', accent: '#00629B' }, ...chapters].map((c) => (
              <button
                key={c.slug}
                type="button"
                aria-pressed={chapter === c.slug}
                onClick={() => setChapter(c.slug)}
                className={clsx(
                  'flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition',
                  chapter === c.slug ? 'border-transparent text-white' : 'border-line bg-surface text-ink-2 hover:border-ink/30',
                )}
                style={chapter === c.slug ? { background: c.accent } : undefined}
              >
                {c.slug !== 'all' && <span className="size-2 rounded-full" style={{ background: chapter === c.slug ? '#fff' : c.accent }} />}
                {'kind' in c && c.kind === 'branch' ? 'Branch' : c.shortName}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <label className="flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 focus-within:border-brand">
              <Search className="size-4 text-ink-3" aria-hidden />
              <span className="sr-only">Search events</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search events"
                className="w-40 bg-transparent text-[15px] outline-none placeholder:text-ink-3"
              />
            </label>
            <label className="sr-only" htmlFor="cat">Type</label>
            <select
              id="cat"
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="h-11 rounded-full border border-line bg-surface px-4 text-sm font-semibold text-ink-2"
            >
              {categories.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="container-x grid gap-10 pt-10 lg:grid-cols-[1fr_320px]">
        <div>
          <p className="mb-6 font-mono text-xs uppercase tracking-[0.14em] text-ink-3" aria-live="polite">
            {list.length} {when} event{list.length === 1 ? '' : 's'}
            {chapterName ? ` · ${chapterName}` : ''}
          </p>
          <motion.div layout className="grid gap-5 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {list.map((e) => (
                <motion.div
                  key={e.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full"
                >
                  <EventCard event={e} past={when === 'past'} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          {list.length === 0 && (
            <div className="flex flex-col items-start gap-4 rounded-[1.5rem] border border-dashed border-ink/20 bg-surface p-10">
              <span className="font-display text-2xl font-bold">
                Nothing {when === 'upcoming' ? 'scheduled' : 'found'}{chapterName ? ` for ${chapterName}` : ''} yet.
              </span>
              <p className="max-w-lg text-ink-3">
                New events appear here within 30 minutes of being published on IEEE vTools. Check the past events or follow
                the calendar so you don’t miss the next one.
              </p>
              <button type="button" onClick={() => { setChapter('all'); setCat('all'); setQ('') }} className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper">
                Clear filters
              </button>
            </div>
          )}
        </div>

        <aside className="flex flex-col gap-5 lg:sticky lg:top-28 lg:self-start">
          <div className="relative overflow-hidden rounded-[1.5rem] bg-night p-7 text-white">
            <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-ieee/60 blur-3xl" />
            <CalendarPlus className="relative size-7 text-cyan" aria-hidden />
            <h2 className="relative mt-4 font-display text-2xl font-bold">Never miss one</h2>
            <p className="relative mt-2 text-[15px] leading-relaxed text-white/70">
              Subscribe to the branch calendar — one feed for every chapter, generated from vTools.
            </p>
            <a href={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/calendar.ics`} className="relative mt-5 inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-night hover:bg-cyan">
              Add to my calendar
            </a>
          </div>
          <div className="rounded-[1.5rem] border border-line bg-surface p-7">
            <span className="eyebrow text-brand">For organisers</span>
            <h2 className="mt-3 font-display text-xl font-bold leading-snug">Publish once, in vTools.</h2>
            <ol className="mt-4 flex list-decimal flex-col gap-2 pl-5 text-[15px] leading-relaxed text-ink-2">
              <li>Create the event in IEEE vTools under your chapter.</li>
              <li>It appears here and on your chapter page automatically.</li>
              <li>Add a cover photo or request a home-page spot from the webmaster console.</li>
            </ol>
            <a href="https://events.vtools.ieee.org/" target="_blank" rel="noreferrer" className="mt-5 inline-block font-semibold text-brand underline-offset-4 hover:underline">
              Open vTools Events
            </a>
          </div>
        </aside>
      </div>
    </section>
  )
}
