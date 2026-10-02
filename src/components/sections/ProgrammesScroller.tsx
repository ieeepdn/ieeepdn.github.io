'use client'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { Reveal } from '../ui/motion'

export type ProgrammeCard = {
  slug: string
  name: string
  edition?: string | null
  tagline: string
  summary: string
  accent: string
  cover?: string | null
  stats: { value: string; label: string }[]
}

function Panel({ p, i, stacked }: { p: ProgrammeCard; i: number; stacked?: boolean }) {
  return (
    <article className={`group relative flex shrink-0 overflow-hidden rounded-[2rem] bg-night-2 text-white ${stacked ? 'min-h-[560px] w-full' : 'h-[78vh] min-h-[520px] w-[72vw] lg:w-[62vw]'}`}>
      {p.cover && (
        <Image
          src={p.cover}
          alt=""
          fill
          sizes="(min-width: 1024px) 62vw, 90vw"
          className="object-cover opacity-70 transition duration-[1.4s] ease-out group-hover:scale-[1.04]"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-night via-night/60 to-transparent" />
      <div className="absolute inset-0 opacity-60 mix-blend-soft-light" style={{ background: `linear-gradient(135deg, ${p.accent}, transparent 60%)` }} />
      <div className="relative mt-auto flex w-full flex-col gap-6 p-7 md:p-12">
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm text-cyan">0{i + 1}</span>
          {p.edition && <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-mono text-xs backdrop-blur">{p.edition}</span>}
        </div>
        <h3 className="font-display text-[clamp(2.8rem,7vw,6.5rem)] font-extrabold leading-[0.9] tracking-[-0.045em]">{p.name}</h3>
        <div className="grid gap-6 md:grid-cols-[1.3fr_1fr] md:items-end">
          <div className="flex flex-col gap-4">
            <p className="font-display text-xl font-semibold text-cyan-soft md:text-2xl">{p.tagline}</p>
            <p className="max-w-xl text-[15.5px] leading-relaxed text-white/75">{p.summary}</p>
          </div>
          <div className="flex flex-col gap-5 md:items-end">
            {p.stats.length > 0 && (
              <div className="flex gap-6">
                {p.stats.slice(0, 3).map((s) => (
                  <div key={s.label} className="flex flex-col">
                    <span className="font-display text-3xl font-extrabold">{s.value}</span>
                    <span className="text-xs text-white/60">{s.label}</span>
                  </div>
                ))}
              </div>
            )}
            <Link
              href={`/programmes/${p.slug}`}
              className="inline-flex h-12 w-fit items-center gap-2 rounded-full bg-white px-5 font-semibold text-night transition hover:bg-cyan"
            >
              Explore {p.name} <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

export function ProgrammesScroller({ programmes }: { programmes: ProgrammeCard[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, [0, 1], ['0%', `-${Math.max(0, programmes.length - 1) * 64}%`])

  return (
    <section className="relative bg-paper atmos">
      <div className="container-x flex flex-col gap-4 pb-12 pt-28 md:flex-row md:items-end md:justify-between md:pt-36">
        <div className="flex flex-col gap-4">
          <Reveal><span className="eyebrow text-brand">Flagship programmes</span></Reveal>
          <Reveal delay={0.05}>
            <h2 className="max-w-[14ch] font-display text-[clamp(2.4rem,5.5vw,5rem)] font-extrabold leading-[0.98] tracking-[-0.04em]">
              What the branch is known for.
            </h2>
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <Link href="/programmes" className="link-underline font-semibold text-brand">All programmes</Link>
        </Reveal>
      </div>

      {/* Desktop: pinned horizontal scroll */}
      <div ref={ref} className="relative hidden md:block" style={{ height: `${programmes.length * 90}vh` }}>
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <motion.div style={{ x }} className="flex gap-6 pl-[max(3.5rem,calc((100vw-88rem)/2+3.5rem))]">
            {programmes.map((p, i) => (
              <Panel key={p.slug} p={p} i={i} />
            ))}
          </motion.div>
        </div>
      </div>

      {/* Mobile: stacked */}
      <div className="container-x flex flex-col gap-5 pb-24 md:hidden">
        {programmes.map((p, i) => (
          <Panel key={p.slug} p={p} i={i} stacked />
        ))}
      </div>
    </section>
  )
}
