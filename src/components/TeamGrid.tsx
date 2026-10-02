import Image from 'next/image'
import clsx from 'clsx'
import { ArrowUpRight } from 'lucide-react'
import type { Person } from '@/payload-types'
import { mediaUrl } from '@/lib/media'
import { Reveal } from './ui/motion'

const initials = (name: string) =>
  name
    .replace(/^(Prof|Dr|Eng|Mr|Ms|Mrs)\.?\s+/i, '')
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

export function PersonCard({ person, accent = '#00629B', size = 'md' }: { person: Person; accent?: string; size?: 'md' | 'lg' }) {
  const photo = mediaUrl(person.photo, 'card')
  return (
    <div className="group relative flex flex-col gap-4">
      <div
        className={clsx('relative overflow-hidden rounded-[1.4rem] bg-paper-2', size === 'lg' ? 'aspect-[4/5]' : 'aspect-square')}
        style={!photo ? { background: `linear-gradient(145deg, ${accent}, #030a13)` } : undefined}
      >
        {photo ? (
          <Image
            src={photo}
            alt={person.name}
            fill
            sizes="(min-width: 1024px) 22vw, 45vw"
            className="object-cover grayscale-[30%] transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center font-display text-5xl font-extrabold text-white/85">{initials(person.name)}</span>
        )}
        {person.linkedin && (
          <a
            href={person.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label={`${person.name} on LinkedIn`}
            className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-full bg-white/90 text-night opacity-0 backdrop-blur transition group-hover:opacity-100"
          >
            <ArrowUpRight className="size-4" aria-hidden />
          </a>
        )}
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="font-display text-[1.15rem] font-bold leading-tight tracking-[-0.01em]">{person.name}</span>
        <span className="text-[14.5px] text-ink-3">{person.position}</span>
      </div>
    </div>
  )
}

export function TeamGrid({ people, accent, title = 'The committee', term }: { people: Person[]; accent?: string; title?: string; term?: string }) {
  const advisors = people.filter((p) => p.group === 'advisor')
  const exec = people.filter((p) => p.group === 'executive')
  const leads = people.filter((p) => p.group === 'lead')
  const members = people.filter((p) => p.group === 'member')
  if (!people.length) return null
  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="flex flex-col gap-3">
          <span className="eyebrow text-brand">Team{term ? ` · ${term}` : ''}</span>
          <h2 className="font-display text-[clamp(2.2rem,4.5vw,4rem)] font-extrabold leading-none tracking-[-0.04em]">{title}</h2>
        </div>
        <p className="max-w-md text-ink-3">
          Volunteers elected each year. Previous committees are archived, not erased — history stays with the branch.
        </p>
      </div>
      {[...advisors, ...exec].length > 0 && (
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {[...advisors, ...exec].map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 0.06}>
              <PersonCard person={p} accent={accent} size="lg" />
            </Reveal>
          ))}
        </div>
      )}
      {[...leads, ...members].length > 0 && (
        <div className="flex flex-col gap-6">
          <h3 className="font-display text-2xl font-bold">Teams</h3>
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-4 lg:grid-cols-6">
            {[...leads, ...members].map((p, i) => (
              <Reveal key={p.id} delay={(i % 6) * 0.04}>
                <PersonCard person={p} accent={accent} />
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
