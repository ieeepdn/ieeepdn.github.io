import Link from 'next/link'
import { ArrowUpRight, Clock, MapPin, Video } from 'lucide-react'
import clsx from 'clsx'
import type { Event } from '@/payload-types'
import { accentVars, asChapter, mediaInfo } from '@/lib/media'
import { MediaFrame } from './ui/MediaFrame'
import { dayOf, isMidnight, monthOf, timeRange, yearOf, dateShort } from '@/lib/format'

const categoryLabel: Record<string, string> = {
  talk: 'Talk',
  workshop: 'Workshop',
  competition: 'Competition',
  visit: 'Field visit',
  social: 'Outreach',
  meeting: 'Meeting',
}

export function EventCard({ event, variant = 'light', past }: { event: Event; variant?: 'light' | 'dark'; past?: boolean }) {
  const chapter = asChapter(event.chapter)
  const accent = chapter?.accent || '#00629B'
  const cover = mediaInfo(event.cover, 'card', event.title)
  const dark = variant === 'dark'
  const href = `/events/${event.slug || event.vtoolsId || event.id}`
  return (
    <article
      className={clsx(
        'group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border transition-all duration-500 hover:-translate-y-1',
        dark ? 'border-white/10 bg-white/[0.04] text-white hover:border-white/25' : 'border-line bg-surface hover:shadow-[0_30px_60px_-30px_rgba(3,10,19,0.35)]',
      )}
    >
      <MediaFrame media={cover} ratio={16 / 9} sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw">
        {!cover && (
          <div
            aria-hidden
            className="absolute inset-0 transition duration-700 group-hover:scale-105"
            style={{ background: `radial-gradient(ellipse 80% 90% at 85% 0%, ${accent}, transparent 70%), linear-gradient(160deg, #061729, #030a13)` }}
          >
            <div className="grid-lines absolute inset-0 opacity-60" />
            <span className="absolute bottom-3 left-5 font-display text-[4.5rem] font-extrabold leading-none tracking-[-0.05em] text-white/15">
              {chapter?.kind === 'branch' ? 'IEEE' : chapter?.shortName}
            </span>
            <span className="absolute right-5 top-4 font-mono text-[10.5px] uppercase tracking-[0.18em] text-white/60">
              {categoryLabel[event.category ?? 'talk']}
            </span>
          </div>
        )}
      </MediaFrame>
      <div className="flex flex-1 flex-col gap-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div
            className={clsx(
              'flex size-[68px] shrink-0 flex-col items-center justify-center rounded-2xl',
              past ? (dark ? 'bg-white/10' : 'bg-paper-2 text-ink-2') : 'text-white',
            )}
            style={past ? undefined : { background: accent }}
          >
            <span className="font-display text-[26px] font-extrabold leading-none">{dayOf(event.start)}</span>
            <span className="font-mono text-[10.5px] tracking-[0.16em]">{monthOf(event.start)}</span>
            {past && <span className="font-mono text-[9px] opacity-70">{yearOf(event.start)}</span>}
          </div>
          <div className="flex flex-wrap justify-end gap-1.5">
            {chapter && (
              <span
                className={clsx('rounded-full px-2.5 py-1 text-xs font-semibold', !dark && 'accent-chip')}
                style={dark ? { background: `${accent}1f`, color: '#cfeaf7' } : accentVars(accent)}
              >
                {chapter.kind === 'branch' ? 'Branch' : chapter.shortName}
              </span>
            )}
            <span className={clsx('rounded-full px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em]', dark ? 'bg-white/10 text-white/70' : 'bg-paper text-ink-3')}>
              {categoryLabel[event.category ?? 'talk'] ?? 'Event'}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-display text-[1.45rem] font-bold leading-[1.15] tracking-[-0.02em]">
            <Link href={href} className="after:absolute after:inset-0">
              {event.title}
            </Link>
          </h3>
          {event.summary && (
            <p className={clsx('line-clamp-3 text-[15px] leading-relaxed', dark ? 'text-white/65' : 'text-ink-3')}>{event.summary}</p>
          )}
        </div>
        <div className={clsx('mt-auto flex flex-col gap-1.5 text-sm', dark ? 'text-white/70' : 'text-ink-2')}>
          <span className="flex items-center gap-2">
            <Clock className="size-4 opacity-60" aria-hidden />
            {past ? dateShort(event.start) : isMidnight(event.start) ? dateShort(event.start) : `${dateShort(event.start)} · ${timeRange(event.start, event.end)}`}
          </span>
          {(event.venue || event.virtual) && (
            <span className="flex items-center gap-2">
              {event.virtual ? <Video className="size-4 opacity-60" aria-hidden /> : <MapPin className="size-4 opacity-60" aria-hidden />}
              <span className="line-clamp-1">{event.virtual ? 'Online' : event.venue}</span>
            </span>
          )}
        </div>
        <div className={clsx('flex items-center justify-between border-t pt-4', dark ? 'border-white/10' : 'border-line')}>
          <span className={clsx('font-mono text-[11px]', dark ? 'text-white/45' : 'text-ink-3')}>
            {event.source === 'vtools' ? `vTools #${event.vtoolsId}` : past ? 'From the archive' : `Posted by ${chapter?.kind === 'branch' ? 'the branch' : chapter?.shortName ?? 'the branch'}`}
          </span>
          <span className={clsx('flex items-center gap-1 text-sm font-semibold', dark ? 'text-cyan' : 'text-brand')}>
            {past ? 'Details' : event.registrationUrl ? 'Register' : 'Details'}
            <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
          </span>
        </div>
      </div>
    </article>
  )
}
