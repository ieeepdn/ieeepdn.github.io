import Image from 'next/image'
import clsx from 'clsx'
import { ArrowDown, ArrowUpRight, CalendarDays, MapPin } from 'lucide-react'
import type { Spotlight, SpotlightButton } from '@/lib/spotlight'
import { SmartLink } from '../ui/SmartLink'
import { Countdown } from '../blocks/Countdown'
import { MediaFrame } from '../ui/MediaFrame'
import { Reveal } from '../ui/motion'

function Buttons({ items }: { items: SpotlightButton[] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {items.map((b, i) => {
        const cls = clsx(
          'group inline-flex h-14 items-center gap-2 rounded-full px-7 font-semibold transition',
          b.variant === 'secondary' ? 'border border-white/30 text-white hover:border-white/60 hover:bg-white/10' : 'bg-white text-night hover:bg-cyan',
        )
        const inner = (
          <>
            {b.label}
            <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" aria-hidden />
          </>
        )
        return (
          <SmartLink key={b.id ?? i} href={b.url} className={cls}>
            {inner}
          </SmartLink>
        )
      })}
    </div>
  )
}

function Meta({ s }: { s: Spotlight }) {
  if (!s.dateLabel && !s.venue) return null
  return (
    <div className="flex flex-wrap gap-2">
      {s.dateLabel && (
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-[15px] font-medium text-white/90 backdrop-blur">
          <CalendarDays className="size-4 text-white/70" aria-hidden />
          {s.dateLabel}
        </span>
      )}
      {s.venue && (
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-[15px] font-medium text-white/90 backdrop-blur">
          <MapPin className="size-4 text-white/70" aria-hidden />
          {s.venue}
        </span>
      )}
    </div>
  )
}

function Clock({ s }: { s: Spotlight }) {
  if (!s.countdownTo || new Date(s.countdownTo).getTime() < Date.now()) return null
  return (
    <div className="flex flex-col gap-2">
      {s.countdownLabel && <span className="font-mono text-xs uppercase tracking-[0.16em] text-white/65">{s.countdownLabel}</span>}
      <Countdown to={s.countdownTo} />
    </div>
  )
}

const Eyebrow = ({ s }: { s: Spotlight }) =>
  s.eyebrow ? (
    <span className="flex w-fit items-center gap-3 rounded-full border border-white/15 bg-white/[0.06] py-2 pl-3 pr-4 backdrop-blur">
      <span className="size-2 animate-pulse-dot rounded-full" style={{ background: `color-mix(in oklab, ${s.accent} 55%, white)` }} />
      <span className="eyebrow text-white/85">{s.eyebrow}</span>
    </span>
  ) : null

/** The spotlight takes over the top of the home page (a conference, a flagship) while it is on. */
export function SpotlightHero({ s }: { s: Spotlight }) {
  const img = s.image
  const poster = img ? img.width / img.height < 1.05 : false
  return (
    <section data-theme="dark" className="grain relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-night text-white" aria-label={s.title}>
      {img &&
        (poster ? (
          <Image src={img.thumb} alt="" aria-hidden fill sizes="120px" className="-z-20 scale-125 object-cover opacity-50 blur-3xl saturate-150" />
        ) : (
          <Image src={img.src} alt="" fill priority sizes="100vw" className="-z-20 object-cover opacity-45" style={{ objectPosition: `${img.fx}% ${img.fy}%` }} />
        ))}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(ellipse 75% 70% at 85% 10%, ${s.accent}c0, transparent 65%), radial-gradient(ellipse 60% 50% at 0% 100%, ${s.accent}55, transparent 60%), linear-gradient(to bottom, rgba(3,10,19,0.35), rgba(3,10,19,0.2) 40%, #030a13)`,
        }}
      />
      <div aria-hidden className="grid-lines absolute inset-0 -z-10 opacity-30 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" />

      <div className={clsx('container-x grid flex-1 items-center gap-12 pb-10 pt-36 md:pt-40', poster && 'lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]')}>
        <div className="flex min-w-0 flex-col gap-7">
          <Reveal className="flex flex-wrap items-center gap-4">
            {s.logo && (
              <span className="relative block h-16 w-40 md:h-20 md:w-48">
                <Image src={s.logo} alt="" fill sizes="192px" className="object-contain object-left" />
              </span>
            )}
            <Eyebrow s={s} />
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="max-w-[16ch] font-display text-[clamp(2.8rem,6.6vw,6.4rem)] font-extrabold leading-[0.93] tracking-[-0.045em]">{s.title}</h1>
          </Reveal>
          {s.text && (
            <Reveal delay={0.12}>
              <p className="max-w-2xl text-lg leading-relaxed text-white/80 md:text-xl">{s.text}</p>
            </Reveal>
          )}
          <Reveal delay={0.16}>
            <Meta s={s} />
          </Reveal>
          <Reveal delay={0.2}>
            <Clock s={s} />
          </Reveal>
          <Reveal delay={0.24}>
            <Buttons items={s.buttons} />
          </Reveal>
        </div>
        {poster && img && (
          <Reveal delay={0.18} className="hidden w-full max-w-[28rem] justify-self-end lg:block">
            <SmartLink href={s.href} className="block rotate-[2deg] transition duration-700 hover:rotate-0" tabIndex={-1} aria-hidden>
              <MediaFrame media={img} ratio={img.width / img.height} sizes="30vw" priority className="rounded-[1.5rem] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/15" />
            </SmartLink>
          </Reveal>
        )}
      </div>

      <div className="container-x relative flex items-end justify-between pb-8">
        <a href="#story" className="flex items-center gap-3 text-sm text-white/60 hover:text-white">
          <span className="grid size-10 place-items-center rounded-full border border-white/20">
            <ArrowDown className="size-4" aria-hidden />
          </span>
          Explore the Student Branch
        </a>
        <span className="hidden font-mono text-xs uppercase tracking-[0.16em] text-white/45 md:block">IEEE Student Branch · University of Peradeniya</span>
      </div>
    </section>
  )
}

/** A bold banner directly under the normal home-page hero. */
export function SpotlightBanner({ s }: { s: Spotlight }) {
  const img = s.image
  return (
    <section className="bg-paper atmos py-12 md:py-16" aria-label={s.title}>
      <div className="container-x">
        <Reveal>
          <div
            data-theme="dark"
            className={clsx('relative isolate grid overflow-hidden rounded-[2rem] text-white shadow-[var(--card-shadow)]', img && 'lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]')}
            style={{ background: `radial-gradient(ellipse 80% 110% at 0% 0%, color-mix(in oklab, ${s.accent} 80%, #43c6f4 20%), ${s.accent} 45%, #030a13 125%)` }}
          >
            <div aria-hidden className="grid-lines pointer-events-none absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_at_left,black,transparent_75%)]" />
            <div className="flex flex-col gap-6 p-8 md:p-12">
              <div className="flex flex-wrap items-center gap-4">
                {s.logo && (
                  <span className="relative block h-12 w-32">
                    <Image src={s.logo} alt="" fill sizes="128px" className="object-contain object-left" />
                  </span>
                )}
                <Eyebrow s={s} />
              </div>
              <h2 className="max-w-[20ch] font-display text-[clamp(2.1rem,4.4vw,3.9rem)] font-extrabold leading-[0.98] tracking-[-0.04em]">{s.title}</h2>
              {s.text && <p className="max-w-xl text-lg leading-relaxed text-white/80">{s.text}</p>}
              <Meta s={s} />
              <Clock s={s} />
              <Buttons items={s.buttons} />
            </div>
            {img && (
              <SmartLink href={s.href} className="relative block min-h-[18rem] lg:min-h-full" tabIndex={-1} aria-hidden>
                <MediaFrame media={img} ratio={4 / 3} fill fit={img.width / img.height >= 1.05 ? 'cover' : 'auto'} sizes="(min-width: 1024px) 45vw, 100vw" className="absolute inset-0" />
              </SmartLink>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
