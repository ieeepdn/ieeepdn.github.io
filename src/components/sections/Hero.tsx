'use client'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { ArrowDown, ArrowRight, CalendarDays, MapPin } from 'lucide-react'
import { Magnetic } from '../ui/motion'
import { AnniversarySeal } from '../ui/AnniversarySeal'
import { HeroEmblem, type EmblemChapter } from './HeroEmblem'

const SignalField = dynamic(() => import('../three/SignalField'), { ssr: false })

export type HeroEvent = {
  title: string
  href: string
  chapter: string
  dateLabel: string
  day: string
  month: string
  venue?: string | null
} | null

const EASE = [0.16, 1, 0.3, 1] as const

export function Hero({
  kicker,
  title,
  accent,
  text,
  nextEvent,
  chapters = [],
}: {
  kicker: string
  title: string
  accent: string
  text: string
  nextEvent: HeroEvent
  chapters?: EmblemChapter[]
}) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '28%'])
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0])
  const titleWords = title.split(' ')
  const accentWords = accent.split(' ')

  return (
    <section
      ref={ref}
      className="grain relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-night text-white"
    >
      {/* atmosphere */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_70%_20%,rgba(0,98,155,0.45),transparent_60%),radial-gradient(ellipse_60%_50%_at_10%_90%,rgba(67,198,244,0.16),transparent_60%)]" />
      <SignalField className="absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_80%,transparent)]" />
      <div className="grid-lines absolute inset-0 -z-10 opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />

      <motion.div
        style={{ y, opacity: fade }}
        className="container-x relative flex flex-1 flex-col justify-center pb-12 pt-32"
      >
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_clamp(18rem,28vw,30rem)] xl:gap-16">
          <div className="min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
              className="mb-8 flex w-fit items-center gap-3 rounded-full border border-white/15 bg-white/5 py-2 pl-3 pr-4 backdrop-blur"
            >
              <span className="size-2 animate-pulse-dot rounded-full bg-cyan" />
              <span className="eyebrow text-white/80">{kicker}</span>
            </motion.div>

            <h1
              className="max-w-[17ch] font-display text-[clamp(2.6rem,6.1vw,6rem)] lg:text-[clamp(3rem,4.6vw,5rem)] font-extrabold leading-[0.96] tracking-[-0.045em]"
              aria-label={`${title} ${accent}`}
            >
              {titleWords.map((w, i) => (
                <span
                  key={i}
                  aria-hidden
                  className="inline-block overflow-hidden pb-[0.14em] -mb-[0.08em] align-bottom"
                >
                  <motion.span
                    className="inline-block"
                    initial={{ y: '110%' }}
                    animate={{ y: '0%' }}
                    transition={{ duration: 1.1, delay: 0.25 + i * 0.07, ease: EASE }}
                  >
                    {w}&nbsp;
                  </motion.span>
                </span>
              ))}
              <br />
              {accentWords.map((w, i) => (
                <span
                  key={`a${i}`}
                  aria-hidden
                  className="inline-block overflow-hidden pb-[0.14em] -mb-[0.08em] align-bottom"
                >
                  <motion.span
                    className="text-gradient inline-block"
                    initial={{ y: '110%' }}
                    animate={{ y: '0%' }}
                    transition={{
                      duration: 1.1,
                      delay: 0.25 + (titleWords.length + i) * 0.07,
                      ease: EASE,
                    }}
                  >
                    {w}&nbsp;
                  </motion.span>
                </span>
              ))}
            </h1>
          </div>
          <HeroEmblem chapters={chapters} className="hidden lg:block" />
        </div>

        <div className="mt-8 grid items-end gap-10 lg:grid-cols-[1fr_auto]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9, ease: EASE }}
            className="flex max-w-xl flex-col gap-8"
          >
            <p className="text-lg leading-relaxed text-white/75 md:text-xl">{text}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Magnetic>
                <Link
                  href="/events"
                  className="group inline-flex h-14 items-center gap-3 rounded-full bg-white pl-6 pr-2 font-semibold text-night transition-colors hover:bg-cyan"
                >
                  Explore events
                  <span className="grid size-10 place-items-center rounded-full bg-night text-white transition-transform duration-500 group-hover:rotate-[-45deg]">
                    <ArrowRight className="size-4" aria-hidden />
                  </span>
                </Link>
              </Magnetic>
              <Link
                href="/chapters"
                className="inline-flex h-14 items-center rounded-full border border-white/25 px-6 font-semibold text-white transition hover:border-white/60 hover:bg-white/5"
              >
                Meet the chapters
              </Link>
            </div>
          </motion.div>

          {nextEvent && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1, delay: 1.1, ease: EASE }}
            >
              <Link
                href={nextEvent.href}
                className="group flex w-full max-w-md items-center gap-5 rounded-3xl border border-white/15 bg-white/[0.06] p-4 pr-6 backdrop-blur-xl transition hover:border-white/30 hover:bg-white/[0.1]"
              >
                <span className="flex size-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-white text-night">
                  <span className="font-display text-3xl font-extrabold leading-none">
                    {nextEvent.day}
                  </span>
                  <span className="font-mono text-[11px] tracking-[0.18em]">{nextEvent.month}</span>
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="eyebrow flex items-center gap-2 text-cyan">
                    <span className="size-1.5 rounded-full bg-signal" /> Next up ·{' '}
                    {nextEvent.chapter}
                  </span>
                  <span className="truncate font-display text-xl font-bold">{nextEvent.title}</span>
                  <span className="flex items-center gap-3 text-sm text-white/65">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="size-3.5" aria-hidden />
                      {nextEvent.dateLabel}
                    </span>
                    {nextEvent.venue && (
                      <span className="hidden items-center gap-1.5 truncate sm:flex">
                        <MapPin className="size-3.5" aria-hidden />
                        {nextEvent.venue}
                      </span>
                    )}
                  </span>
                </span>
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>

      <div className="container-x relative flex items-end justify-between pb-8">
        <motion.a
          href="#story"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="flex items-center gap-3 text-sm text-white/60 hover:text-white"
        >
          <span className="grid size-10 place-items-center rounded-full border border-white/20">
            <motion.span
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            >
              <ArrowDown className="size-4" aria-hidden />
            </motion.span>
          </span>
          Scroll to explore
        </motion.a>
        <AnniversarySeal className="hidden md:block" />
      </div>
    </section>
  )
}
