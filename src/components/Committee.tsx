'use client'
import Image from 'next/image'
import { useMemo } from 'react'
import { ArrowUpRight, PenLine, Sparkles } from 'lucide-react'
import clsx from 'clsx'
import { Reveal } from './ui/motion'
import { accentVars } from '@/lib/media'

export type CommitteeMember = {
  id: string | number
  name: string
  position: string
  group: 'advisor' | 'executive' | 'lead' | 'member'
  team?: string | null
  photo?: string | null
  photoLarge?: string | null
  linkedin?: string | null
}

const isChair = (p: CommitteeMember) => /^(chair(man|person)?|president)$/i.test(p.position.trim())
const isWebmaster = (p: CommitteeMember) => /web\s*master/i.test(p.position) && !/team/i.test(p.position)

const initials = (name: string) =>
  name
    .replace(/^(Prof|Dr|Eng|Mr|Ms|Mrs)\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

function Portrait({
  person,
  accent,
  sizes,
  className,
  round,
}: {
  person: CommitteeMember
  accent: string
  sizes: string
  className?: string
  round?: boolean
}) {
  const src = person.photoLarge || person.photo
  return (
    <div
      className={clsx('relative overflow-hidden bg-paper-2', round ? 'rounded-full' : 'rounded-[1.25rem]', className)}
      style={!src ? { background: `linear-gradient(145deg, ${accent}, #030a13)` } : undefined}
    >
      {src ? (
        <>
          <Image
            src={src}
            alt={person.name}
            fill
            sizes={sizes}
            className="object-cover object-[50%_22%] saturate-[0.9] transition duration-700 group-hover:scale-[1.04] group-hover:saturate-100"
          />
          {/* unifies the very different photo backgrounds with a soft chapter-coloured wash */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-60 mix-blend-soft-light transition-opacity duration-500 group-hover:opacity-20"
            style={{ background: `linear-gradient(180deg, transparent 45%, ${accent})` }}
          />
        </>
      ) : (
        <span className="absolute inset-0 grid place-items-center font-display text-3xl font-extrabold text-white/85">{initials(person.name)}</span>
      )}
    </div>
  )
}

function RoleTag({ children, accent, solid, light }: { children: React.ReactNode; accent: string; solid?: boolean; light?: boolean }) {
  return (
    <span
      className={clsx(
        'inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.12em]',
        !light && !solid && 'accent-chip',
      )}
      style={light ? { background: '#ffffff', color: '#06121f' } : solid ? { background: accent, color: '#fff' } : accentVars(accent)}
    >
      {children}
    </span>
  )
}

function WebmasterChip() {
  return (
    <span className="inline-flex w-fit items-center gap-1 rounded-full bg-signal/20 px-2 py-0.5 text-[11px] font-semibold text-signal-ink">
      <PenLine className="size-3" aria-hidden /> Maintains this page
    </span>
  )
}

type Team = { name: string; leads: CommitteeMember[]; members: CommitteeMember[] }

/** "Editorial Team" inside the Editorial team says nothing new — only show positions that add information. */
const telling = (p: CommitteeMember, team: string) =>
  !/\bteam$/i.test(p.position.trim()) && p.position.trim().toLowerCase() !== team.toLowerCase()

function TeamCard({ team, index, accent }: { team: Team; index: number; accent: string }) {
  const count = team.leads.length + team.members.length
  return (
    <article className="@container relative overflow-hidden rounded-[1.75rem] border border-line bg-surface shadow-[var(--card-shadow)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-28"
        style={{ background: `radial-gradient(ellipse 85% 100% at 0% 0%, ${accent}30, transparent 72%)` }}
      />
      <span aria-hidden className="absolute inset-x-6 top-0 h-[3px] rounded-b-full" style={{ background: accent }} />
      <header className="relative flex items-start justify-between gap-4 px-6 pb-4 pt-6">
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="accent-text font-mono text-[11px] tracking-[0.18em]" style={accentVars(accent)}>
            TEAM {String(index + 1).padStart(2, '0')}
          </span>
          <h4 className="font-display text-[1.65rem] font-extrabold leading-none tracking-[-0.03em]">{team.name}</h4>
        </div>
        <span className="mt-1 shrink-0 rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-ink-3">
          {count} {count === 1 ? 'person' : 'people'}
        </span>
      </header>

      {team.leads.length > 0 && (
        <div className="relative flex flex-col gap-2 px-3">
          {team.leads.map((l) => (
            <div key={l.id} className="group flex items-center gap-4 rounded-[1.25rem] bg-mist p-3">
              <Portrait person={l} accent={accent} sizes="120px" className="aspect-[4/5] w-[4.75rem] shrink-0" />
              <div className="flex min-w-0 flex-col gap-1.5">
                <RoleTag accent={accent} solid>
                  Team lead
                </RoleTag>
                <span className="font-display text-lg font-bold leading-tight tracking-[-0.015em]">{l.name}</span>
                {isWebmaster(l) && <WebmasterChip />}
              </div>
            </div>
          ))}
        </div>
      )}

      {team.members.length > 0 ? (
        <ul className="relative flex flex-wrap justify-center gap-y-5 px-4 pb-6 pt-5">
          {team.members.map((m) => (
            <li
              key={m.id}
              className={clsx(
                'group flex w-1/3 flex-col items-center gap-2.5 px-1 text-center',
                team.members.length % 4 === 0 ? '@sm:w-1/4' : '@2xl:w-1/5',
              )}
            >
              <Portrait person={m} accent={accent} sizes="96px" className="size-[4.5rem] @md:size-20" round />
              <div className="flex flex-col gap-0.5">
                <span className="text-[13.5px] font-semibold leading-tight">{m.name}</span>
                {telling(m, team.name) && <span className="text-[11.5px] leading-snug text-ink-3">{m.position}</span>}
                {isWebmaster(m) && (
                  <span className="mt-1 flex justify-center">
                    <WebmasterChip />
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="h-3" />
      )}
    </article>
  )
}

/** Advisor + Chair spotlight → officers grid → every team, side by side. */

export function Committee({
  people,
  accent = '#00629B',
  title = 'The committee',
  term,
  chapterName,
}: {
  people: CommitteeMember[]
  accent?: string
  title?: string
  term?: string | null
  chapterName?: string
}) {
  const { advisors, chair, officers, teams } = useMemo(() => {
    const advisors = people.filter((p) => p.group === 'advisor')
    const execs = people.filter((p) => p.group === 'executive')
    const chair = execs.find(isChair) ?? null
    const officers = execs.filter((p) => p !== chair)
    const teamMap = new Map<string, CommitteeMember[]>()
    for (const p of people.filter((x) => x.group === 'lead' || x.group === 'member')) {
      const key = (p.team || 'Committee').trim()
      if (!teamMap.has(key)) teamMap.set(key, [])
      teamMap.get(key)!.push(p)
    }
    const teams = [...teamMap.entries()].map(([name, list]) => ({
      name,
      leads: list.filter((p) => p.group === 'lead'),
      members: list.filter((p) => p.group === 'member'),
    }))
    return { advisors, chair, officers, teams }
  }, [people])

  if (!people.length) return null

  return (
    <div className="flex flex-col gap-14 md:gap-20">
      {/* Header */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="flex flex-col gap-3">
          <span className="eyebrow accent-text" style={accentVars(accent)}>
            Committee{term ? ` · ${term}` : ''}
          </span>
          <h2 className="font-display text-[clamp(2.2rem,4.8vw,4.2rem)] font-extrabold leading-[0.98] tracking-[-0.04em]">{title}</h2>
        </div>
        <dl className="flex gap-8">
          {[
            [people.length, 'volunteers'],
            [officers.length + (chair ? 1 : 0), 'officers'],
            [teams.length, teams.length === 1 ? 'team' : 'teams'],
          ].map(([n, l]) => (
            <div key={l as string} className="flex flex-col">
              <dt className="order-2 text-sm text-ink-3">{l}</dt>
              <dd className="font-display text-4xl font-extrabold tracking-[-0.03em]">{n}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Leadership spotlight */}
      {(chair || advisors.length > 0) && (
        <div className={clsx('grid gap-5', chair && advisors.length ? 'lg:grid-cols-[1.55fr_1fr]' : '')}>
          {chair && (
            <Reveal>
              <article
                className="group relative grid h-full overflow-hidden rounded-[1.75rem] text-white sm:grid-cols-[0.9fr_1.1fr]"
                style={{ background: `radial-gradient(ellipse 90% 90% at 100% 0%, ${accent}cc, transparent 65%), #061729` }}
              >
                <div className="grid-lines pointer-events-none absolute inset-0 opacity-40" />
                <Portrait person={chair} accent={accent} sizes="(min-width: 1024px) 26vw, 90vw" className="aspect-[4/5] !rounded-none sm:aspect-auto sm:min-h-[340px]" />
                <div className="relative flex flex-col justify-end gap-4 p-7 md:p-9">
                  <RoleTag accent={accent} light>
                    <Sparkles className="size-3" aria-hidden /> {chair.position}
                  </RoleTag>
                  <h3 className="font-display text-[clamp(2rem,3.4vw,3rem)] font-extrabold leading-[0.95] tracking-[-0.035em]">{chair.name}</h3>
                  {chapterName && <p className="text-white/65">Leading {chapterName}{term ? ` for ${term}` : ''}.</p>}
                  {chair.linkedin && (
                    <a href={chair.linkedin} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-cyan hover:text-white">
                      LinkedIn <ArrowUpRight className="size-4" aria-hidden />
                    </a>
                  )}
                </div>
              </article>
            </Reveal>
          )}
          {advisors.length > 0 && (
            <div className="flex flex-col gap-5">
              {advisors.map((a, i) => (
                <Reveal key={a.id} delay={0.08 + i * 0.06} className="h-full">
                  <article className="group flex h-full items-center gap-5 rounded-[1.75rem] border border-line bg-surface p-5 shadow-[var(--card-shadow)] md:p-6">
                    <Portrait person={a} accent={accent} sizes="160px" className="size-28 shrink-0 md:size-32" round />
                    <div className="flex min-w-0 flex-col gap-2">
                      <RoleTag accent={accent}>{a.position}</RoleTag>
                      <h3 className="font-display text-2xl font-bold leading-tight tracking-[-0.02em]">{a.name}</h3>
                      <p className="text-sm text-ink-3">Academic staff guidance &amp; support</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Officers */}
      {officers.length > 0 && (
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <h3 className="font-display text-2xl font-bold tracking-[-0.02em]">Office bearers</h3>
            <span className="h-px flex-1 bg-line" />
          </div>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {officers.map((p, i) => (
              <Reveal as="li" key={p.id} delay={(i % 6) * 0.05} className="group flex flex-col gap-3">
                <Portrait person={p} accent={accent} sizes="(min-width: 1280px) 15vw, (min-width: 640px) 30vw, 45vw" className="aspect-square sm:aspect-[4/5]" />
                <div className="flex flex-col gap-1.5">
                  <span className="font-display text-[1.05rem] font-bold leading-tight tracking-[-0.01em]">{p.name}</span>
                  <span className="text-[13.5px] leading-snug text-ink-3">{p.position}</span>
                  {isWebmaster(p) && <WebmasterChip />}
                </div>
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      {/* Teams — every team visible at once */}
      {teams.length > 0 && (
        <section className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-4">
            <h3 className="font-display text-2xl font-bold tracking-[-0.02em]">Teams</h3>
            <span className="font-mono text-xs text-ink-3">
              {teams.length} {teams.length === 1 ? 'team' : 'teams'} · {teams.reduce((n, t) => n + t.leads.length + t.members.length, 0)} people
            </span>
            <span className="hidden h-px flex-1 bg-line md:block" />
          </div>
          <div className="grid items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
            {teams.map((t, i) => (
              <Reveal key={t.name} delay={(i % 3) * 0.06}>
                <TeamCard team={t} index={i} accent={accent} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <p className="text-sm text-ink-3">
        Committees are elected every year. Previous committees are archived — not erased — so the branch’s history stays intact.
      </p>
    </div>
  )
}
