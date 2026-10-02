import clsx from 'clsx'
import { ArrowUpRight, MapPin, Navigation } from 'lucide-react'
import type { FeesBlock, ScheduleBlock, SpeakersBlock, VenueBlock } from '@/payload-types'
import { Section, type SectionStyle } from './Section'
import { ScheduleTabs, type ScheduleDay, type ScheduleSlot } from './ScheduleTabs'
import { SpeakerBio } from './SpeakerBio'
import { MapReveal } from './MapReveal'
import { SectionHeader } from '../SectionHeader'
import { MediaFrame } from '../ui/MediaFrame'
import { SmartLink } from '../ui/SmartLink'
import { Reveal } from '../ui/motion'
import { accentVars, mediaInfo, mediaUrl } from '@/lib/data'
import type { BlockCtx } from './RenderBlocks'
import { initials } from '@/lib/names'


type Btn = { label: string; url: string; variant?: 'primary' | 'secondary' | null; id?: string | null }
const styleOf = (b: SectionStyle) => ({ background: b.background, spacing: b.spacing, anchor: b.anchor })

function Head({ eyebrow, heading, text }: { eyebrow?: string | null; heading?: string | null; text?: string | null }) {
  if (!heading && !eyebrow) return null
  return <SectionHeader eyebrow={eyebrow ?? ''} title={heading ?? ''} text={text ?? undefined} />
}

function SmallButtons({ items, accent }: { items?: Btn[] | null; accent: string }) {
  if (!items?.length) return null
  return (
    <div className="flex flex-wrap gap-3">
      {items.map((b, i) => {
        const cls = clsx(
          'group inline-flex h-12 items-center gap-2 rounded-full px-6 font-semibold transition',
          b.variant === 'secondary' ? 'border border-ink/20 text-ink hover:border-ink' : 'text-white hover:brightness-110',
        )
        const style = b.variant === 'secondary' ? undefined : { background: accent }
        const inner = (
          <>
            {b.label}
            <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" aria-hidden />
          </>
        )
        return (
          <SmartLink key={b.id ?? i} href={b.url} className={cls} style={style}>
            {inner}
          </SmartLink>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------- schedule

export function Schedule({ b, ctx, i }: { b: ScheduleBlock; ctx: BlockCtx; i: number }) {
  const days: ScheduleDay[] = (b.days ?? []).map((d, k) => {
    const groups: ScheduleDay['groups'] = []
    for (const s of d.slots ?? []) {
      const slot: ScheduleSlot = { title: s.title, kind: (s.kind ?? 'session') as ScheduleSlot['kind'], speaker: s.speaker, room: s.room, description: s.description }
      const last = groups.at(-1)
      if (last && last.time === s.time) last.slots.push(slot)
      else groups.push({ time: s.time, end: s.end, slots: [slot] })
    }
    return { key: d.id ?? String(k), label: d.label, date: d.date, groups }
  })
  if (!days.length) return null
  return (
    <Section style={styleOf(b)} index={i} accent={ctx.accent} id="schedule">
      <Head eyebrow={b.eyebrow ?? 'Programme'} heading={b.heading ?? 'Schedule.'} text={b.intro} />
      <div style={accentVars(ctx.accent)}>
        <ScheduleTabs days={days} />
      </div>
    </Section>
  )
}

// ---------------------------------------------------------------- fees

export function Fees({ b, ctx, i }: { b: FeesBlock; ctx: BlockCtx; i: number }) {
  const cols = [b.column1, b.column2, b.column3].map((c) => c?.trim()).filter((c): c is string => Boolean(c))
  const price = (r: NonNullable<FeesBlock['rows']>[number], k: number) => [r.price1, r.price2, r.price3][k] || '—'
  const rows = b.rows ?? []
  return (
    <Section style={styleOf(b)} index={i} accent={ctx.accent} id="fees">
      <Head eyebrow={b.eyebrow ?? 'Registration'} heading={b.heading ?? 'Registration fees.'} text={b.intro} />
      <div style={accentVars(ctx.accent)}>
        {/* table from md up */}
        <Reveal className="hidden overflow-hidden rounded-[1.5rem] border border-line bg-surface shadow-[var(--card-shadow)] md:block">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-paper-2/50">
                <th scope="col" className="px-6 py-4 text-sm font-semibold text-ink-2">
                  Category
                </th>
                {cols.map((c, k) => (
                  <th key={k} scope="col" className={clsx('px-6 py-4 text-right text-sm font-semibold', k === 0 ? 'accent-text' : 'text-ink-2')}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, k) => (
                <tr key={r.id ?? k} className={clsx('border-b border-line last:border-0', r.highlight && 'accent-chip')}>
                  <th scope="row" className="px-6 py-5 align-top font-normal">
                    <span className="flex flex-wrap items-center gap-2 font-display text-lg font-bold text-ink">
                      {r.category}
                      {r.highlight && <span className="rounded-full bg-surface px-2 py-0.5 font-sans text-[11px] font-semibold uppercase tracking-[0.1em] accent-text">Most common</span>}
                    </span>
                    {r.note && <span className="mt-1 block text-sm text-ink-3">{r.note}</span>}
                  </th>
                  {cols.map((_, c) => (
                    <td key={c} className={clsx('px-6 py-5 text-right align-top font-mono text-[15px] tabular-nums', c === 0 ? 'font-semibold text-ink' : 'text-ink-2')}>
                      {price(r, c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>

        {/* cards on phones */}
        <ul className="flex flex-col gap-3 md:hidden">
          {rows.map((r, k) => (
            <li key={r.id ?? k} className={clsx('rounded-2xl border p-5', r.highlight ? 'accent-chip border-transparent' : 'border-line bg-surface')}>
              <span className="font-display text-lg font-bold text-ink">{r.category}</span>
              {r.note && <span className="mt-1 block text-sm text-ink-3">{r.note}</span>}
              <dl className="mt-3 grid gap-1.5">
                {cols.map((c, j) => (
                  <div key={j} className="flex items-baseline justify-between gap-4 text-[15px]">
                    <dt className={j === 0 ? 'accent-text font-semibold' : 'text-ink-3'}>{c}</dt>
                    <dd className="font-mono tabular-nums text-ink">{price(r, j)}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>

        {(b.footnote || b.buttons?.length) && (
          <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            {b.footnote && <p className="max-w-2xl whitespace-pre-line text-[15px] leading-relaxed text-ink-3">{b.footnote}</p>}
            <SmallButtons items={b.buttons as Btn[]} accent={ctx.accent} />
          </div>
        )}
      </div>
    </Section>
  )
}

// ---------------------------------------------------------------- speakers

export function Speakers({ b, ctx, i }: { b: SpeakersBlock; ctx: BlockCtx; i: number }) {
  const items = b.items ?? []
  if (!items.length) return null
  const cols = b.columns === '2' ? 'sm:grid-cols-2' : b.columns === '4' ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 lg:grid-cols-3'
  const big = b.columns === '2'
  return (
    <Section style={styleOf(b)} index={i} accent={ctx.accent} id="speakers">
      <Head eyebrow={b.eyebrow ?? 'Speakers'} heading={b.heading ?? 'Speakers.'} />
      <ul className={clsx('grid gap-x-5 gap-y-10', cols)} style={accentVars(ctx.accent)}>
        {items.map((s, k) => {
          const photo = mediaInfo(s.photo, 'card', s.name)
          return (
            <Reveal as="li" key={s.id ?? k} delay={(k % 4) * 0.05} className="group relative flex flex-col gap-4">
              <MediaFrame media={photo} ratio={big ? 5 / 4 : 4 / 5} fit="cover" sizes="(min-width: 1024px) 30vw, 50vw" className="rounded-[1.5rem]">
                {!photo && (
                  <span className="absolute inset-0 grid place-items-center" style={{ background: `linear-gradient(145deg, ${ctx.accent}, #030a13)` }}>
                    <span aria-hidden className="font-display text-5xl font-extrabold tracking-[-0.03em] text-white/80">
                      {initials(s.name)}
                    </span>
                  </span>
                )}
              </MediaFrame>
              <div className="flex flex-col gap-1">
                {s.position && <span className="eyebrow accent-text">{s.position}</span>}
                <span className="font-display text-xl font-bold leading-tight">{s.name}</span>
                {s.affiliation && <span className="text-[15px] text-ink-2">{s.affiliation}</span>}
                {s.talk && <span className="mt-1 text-[15px] italic leading-snug text-ink-3">“{s.talk}”</span>}
                {s.bio ? (
                  <SpeakerBio name={s.name} role={s.position} affiliation={s.affiliation} talk={s.talk} bio={s.bio} link={s.link} photo={mediaUrl(s.photo, 'card')} />
                ) : (
                  s.link && (
                    <a href={s.link} target="_blank" rel="noreferrer" className="mt-1 inline-flex w-fit items-center gap-1 text-sm font-semibold accent-text">
                      Profile <ArrowUpRight className="size-3.5" aria-hidden />
                    </a>
                  )
                )}
              </div>
            </Reveal>
          )
        })}
      </ul>
    </Section>
  )
}

// ---------------------------------------------------------------- venue

export function Venue({ b, ctx, i }: { b: VenueBlock; ctx: BlockCtx; i: number }) {
  const query = b.mapQuery?.trim() || [b.venueName, b.address?.replace(/\n/g, ', ')].filter(Boolean).join(', ')
  const photo = mediaInfo(b.image, 'hero', b.venueName)
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
  const notes = b.notes ?? []
  return (
    <Section style={styleOf(b)} index={i} accent={ctx.accent} id="venue">
      <Head eyebrow={b.eyebrow ?? 'Venue'} heading={b.heading ?? 'Getting there.'} />
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-12" style={accentVars(ctx.accent)}>
        <Reveal className="grid gap-4">
          {photo && <MediaFrame media={photo} ratio={16 / 10} sizes="(min-width: 1024px) 55vw, 100vw" className="rounded-[1.75rem] shadow-[var(--card-shadow)]" />}
          {b.showMap !== false && (
            <div className={clsx('relative overflow-hidden rounded-[1.75rem] border border-line', photo ? 'aspect-[16/7]' : 'aspect-[16/10]')}>
              <MapReveal query={query} title={b.venueName} />
            </div>
          )}
        </Reveal>
        <Reveal delay={0.08} className="flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <span className="accent-chip grid size-12 shrink-0 place-items-center rounded-xl">
              <MapPin className="size-5" aria-hidden />
            </span>
            <div className="flex flex-col gap-1">
              <span className="font-display text-2xl font-bold leading-tight">{b.venueName}</span>
              {b.address && <span className="whitespace-pre-line text-[15px] leading-relaxed text-ink-2">{b.address}</span>}
            </div>
          </div>
          <a
            href={directions}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 w-fit items-center gap-2 rounded-full px-6 font-semibold text-white transition hover:brightness-110"
            style={{ background: ctx.accent }}
          >
            <Navigation className="size-4" aria-hidden /> Get directions
          </a>
          {notes.length > 0 && (
            <dl className="flex flex-col divide-y divide-line border-y border-line">
              {notes.map((n, k) => (
                <div key={n.id ?? k} className="flex flex-col gap-1 py-4">
                  <dt className="font-semibold text-ink">{n.title}</dt>
                  <dd className="whitespace-pre-line text-[15px] leading-relaxed text-ink-3">{n.text}</dd>
                </div>
              ))}
            </dl>
          )}
        </Reveal>
      </div>
    </Section>
  )
}
