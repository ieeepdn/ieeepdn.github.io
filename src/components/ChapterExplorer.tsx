'use client'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useRef, useState } from 'react'
import { ArrowRight, ArrowUpRight, CalendarDays, Newspaper, Users } from 'lucide-react'
import clsx from 'clsx'
import { accentVars } from '@/lib/media'

export type ExplorerLeader = { name: string; position: string; photo?: string | null }
export type ExplorerChapter = {
  slug: string
  shortName: string
  name: string
  kind: string
  tagline?: string | null
  about?: string | null
  accent: string
  logo?: string | null
  cover?: string | null
  faces: string[]
  leaders: ExplorerLeader[]
  members: number
  upcoming: number
  events: number
  stories: number
  founded?: number | null
  highlights: { value: string; label: string }[]
}

const EASE = [0.16, 1, 0.3, 1] as const

function Visual({ c, className }: { c: ExplorerChapter; className?: string }) {
  return (
    <div className={clsx('overflow-hidden', className ?? 'relative')} style={{ background: `radial-gradient(ellipse 90% 90% at 100% 0%, ${c.accent}, #030a13 70%)` }}>
      {c.cover ? (
        <Image src={c.cover} alt="" fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover opacity-70" />
      ) : c.faces.length >= 6 ? (
        <div aria-hidden className="absolute inset-0 grid grid-cols-5 content-start opacity-80 sm:grid-cols-8">
          {c.faces.slice(0, 24).map((f, i) => (
            <div key={i} className="relative aspect-square">
              <Image src={f} alt="" fill sizes="110px" loading="eager" className="object-cover object-[50%_22%] grayscale" />
            </div>
          ))}
        </div>
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-night/10" />
      <div className="absolute inset-0 mix-blend-soft-light" style={{ background: `linear-gradient(135deg, ${c.accent}, transparent 70%)` }} />
    </div>
  )
}

function Stats({ c, dark }: { c: ExplorerChapter; dark?: boolean }) {
  const items = [
    { icon: Users, value: c.members, label: 'on the team' },
    { icon: CalendarDays, value: c.upcoming || c.events, label: c.upcoming ? 'upcoming events' : 'events so far' },
    { icon: Newspaper, value: c.stories, label: 'stories' },
  ]
  return (
    <dl className="grid grid-cols-3 gap-3">
      {items.map((s) => (
        <div key={s.label} className={clsx('flex flex-col gap-0.5 rounded-2xl border px-4 py-3', dark ? 'border-white/10 bg-white/[0.04]' : 'border-line bg-paper')}>
          <s.icon className="size-4 opacity-60" aria-hidden />
          <dd className="font-display text-[1.7rem] font-extrabold leading-tight tracking-[-0.03em]">{s.value}</dd>
          <dt className={clsx('text-xs', dark ? 'text-white/60' : 'text-ink-3')}>{s.label}</dt>
        </div>
      ))}
    </dl>
  )
}

function Leaders({ c, dark }: { c: ExplorerChapter; dark?: boolean }) {
  if (!c.leaders.length) return null
  return (
    <ul className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
      {c.leaders.map((l) => (
        <li key={l.name + l.position} className="flex min-w-0 items-center gap-3">
          <span className={clsx('relative size-12 shrink-0 overflow-hidden rounded-full ring-2', dark ? 'ring-white/15' : 'ring-line')}>
            {l.photo ? (
              <Image src={l.photo} alt="" fill sizes="56px" className="object-cover object-[50%_22%]" />
            ) : (
              <span className="absolute inset-0" style={{ background: c.accent }} />
            )}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold leading-tight">{l.name}</span>
            <span className={clsx('truncate text-xs', dark ? 'text-white/55' : 'text-ink-3')}>{l.position}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

/** Desktop: list ↔ live preview. Mobile: stacked cards. */
export function ChapterExplorer({ chapters }: { chapters: ExplorerChapter[] }) {
  const [active, setActive] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const c = chapters[active]

  const onKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
      e.preventDefault()
      const next = (active + (e.key === 'ArrowDown' ? 1 : -1) + chapters.length) % chapters.length
      setActive(next)
      listRef.current?.querySelectorAll<HTMLButtonElement>('button[data-chapter]')[next]?.focus()
    },
    [active, chapters.length],
  )

  if (!c) return null

  return (
    <>
      {/* Desktop explorer */}
      <div className="hidden gap-10 lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.3fr)]">
        <div ref={listRef} role="tablist" aria-label="Chapters" aria-orientation="vertical" onKeyDown={onKey} className="flex flex-col">
          {chapters.map((ch, i) => {
            const on = i === active
            return (
              <button
                key={ch.slug}
                type="button"
                role="tab"
                data-chapter
                aria-selected={on}
                aria-controls="chapter-preview"
                tabIndex={on ? 0 : -1}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                className="group relative flex items-center gap-5 border-b border-line py-4 text-left"
              >
                {on && (
                  <motion.span
                    layoutId="chapter-bar"
                    className="absolute -left-4 top-3 bottom-3 w-1 rounded-full"
                    style={{ background: ch.accent }}
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="w-7 font-mono text-xs text-ink-3">0{i + 1}</span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span
                    className={clsx(
                      'font-display text-[clamp(2.2rem,3.6vw,3.4rem)] font-extrabold leading-none tracking-[-0.045em] transition-colors duration-300',
                      on ? 'accent-text' : 'text-ink/40 group-hover:text-ink/70',
                    )}
                    style={on ? accentVars(ch.accent) : undefined}
                  >
                    {ch.shortName}
                  </span>
                  <span className={clsx('mt-1.5 truncate text-sm transition-colors', on ? 'text-ink-2' : 'text-ink-3')}>{ch.name}</span>
                </span>
                <span
                  className={clsx(
                    'grid size-10 shrink-0 place-items-center rounded-full border transition-all duration-500',
                    on ? 'rotate-0 border-transparent text-white' : '-rotate-45 border-line text-ink-3 opacity-0 group-hover:opacity-100',
                  )}
                  style={on ? { background: ch.accent } : undefined}
                >
                  <ArrowRight className="size-4" aria-hidden />
                </span>
              </button>
            )
          })}
        </div>

        <div className="relative">
          <div className="sticky top-28" id="chapter-preview" role="tabpanel" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.article
                key={c.slug}
                initial={{ opacity: 0, y: 18, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.99 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="overflow-hidden rounded-[2rem] bg-night text-white shadow-[0_40px_100px_-40px_rgba(3,10,19,0.6)]"
              >
                <div className="relative h-52">
                  <Visual c={c} className="absolute inset-0" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-7">
                    <div className="flex items-center gap-4">
                      {c.logo && (
                        <span className="grid size-20 shrink-0 place-items-center rounded-2xl bg-white p-2 shadow-xl">
                          <Image src={c.logo} alt={`${c.shortName} logo`} width={72} height={72} className="size-full object-contain" />
                        </span>
                      )}
                      <div className="flex flex-col gap-1">
                        <span className="eyebrow text-white/70">{c.kind === 'affinity' ? 'Affinity group' : 'Society chapter'}{c.founded ? ` · since ${c.founded}` : ''}</span>
                        <h2 className="font-display text-3xl font-extrabold leading-tight tracking-[-0.03em]">{c.name}</h2>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-6 p-7">
                  {c.tagline && <p className="font-display text-xl font-semibold leading-snug text-white/90">{c.tagline}</p>}
                  <Stats c={c} dark />
                  {c.leaders.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <span className="eyebrow text-white/50">Leading the chapter</span>
                      <Leaders c={c} dark />
                    </div>
                  )}
                  {c.highlights.length > 0 && (
                    <ul className="flex flex-wrap gap-2">
                      {c.highlights.map((h) => (
                        <li key={h.label} className="rounded-full border border-white/12 px-3 py-1.5 text-xs text-white/75">
                          <strong className="text-white">{h.value}</strong> {h.label}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex flex-wrap gap-3 border-t border-white/10 pt-6">
                    <Link
                      href={`/chapters/${c.slug}`}
                      className="group inline-flex h-12 items-center gap-2 rounded-full bg-white px-5 font-semibold text-night transition hover:bg-cyan"
                    >
                      Visit {c.shortName} <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" aria-hidden />
                    </Link>
                    <Link href={`/chapters/${c.slug}#team`} className="inline-flex h-12 items-center rounded-full border border-white/20 px-5 font-semibold hover:bg-white/10">
                      Meet the team
                    </Link>
                    <Link href={`/events?chapter=${c.slug}`} className="inline-flex h-12 items-center rounded-full px-3 font-semibold text-cyan hover:text-white">
                      Events
                    </Link>
                  </div>
                </div>
              </motion.article>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile / tablet cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:hidden">
        {chapters.map((ch) => (
          <article key={ch.slug} className="overflow-hidden rounded-[1.75rem] bg-night text-white">
            <Link href={`/chapters/${ch.slug}`} className="block">
              <div className="relative h-44">
                <Visual c={ch} className="absolute inset-0" />
                <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-5">
                  {ch.logo && (
                    <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-white p-1.5">
                      <Image src={ch.logo} alt="" width={52} height={52} className="size-full object-contain" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <span className="font-display text-3xl font-extrabold leading-none tracking-[-0.04em]" style={{ color: '#fff' }}>
                      {ch.shortName}
                    </span>
                    <span className="mt-1 block truncate text-sm text-white/70">{ch.name}</span>
                  </div>
                </div>
              </div>
            </Link>
            <div className="flex flex-col gap-5 p-5">
              {ch.tagline && <p className="text-[15px] leading-relaxed text-white/75">{ch.tagline}</p>}
              <Stats c={ch} dark />
              <Leaders c={ch} dark />
              <Link href={`/chapters/${ch.slug}`} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white font-semibold text-night">
                Visit {ch.shortName} <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
