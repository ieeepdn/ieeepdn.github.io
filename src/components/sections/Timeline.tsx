'use client'
import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { Reveal } from '../ui/motion'

export type Milestone = { year: string; title: string; body: string }

/** 25-year story as a scroll-drawn timeline. */
export function Timeline({ items }: { items: Milestone[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.75', 'end 0.6'] })
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section className="relative overflow-hidden bg-night-2 py-28 text-white md:py-36">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan/40 to-transparent" />
      <div className="container-x grid gap-16 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="flex flex-col gap-5 lg:sticky lg:top-32 lg:self-start">
          <Reveal><span className="eyebrow text-cyan">2001 — 2026</span></Reveal>
          <Reveal delay={0.05}>
            <h2 className="font-display text-[clamp(2.4rem,5vw,4.6rem)] font-extrabold leading-[0.98] tracking-[-0.04em]">
              Twenty-five years of <span className="text-gradient">firsts.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-md text-lg leading-relaxed text-white/65">
              From the first IEEE student branch in the country to seven active chapters — a quarter-century of
              engineers building for a better tomorrow.
            </p>
          </Reveal>
        </div>

        <div ref={ref} className="relative pl-10 md:pl-14">
          <div className="absolute bottom-0 left-[7px] top-0 w-px bg-white/10 md:left-[11px]" />
          <motion.div style={{ scaleY }} className="absolute bottom-0 left-[7px] top-0 w-px origin-top bg-gradient-to-b from-cyan via-ieee to-signal md:left-[11px]" />
          <ol className="flex flex-col gap-14">
            {items.map((m, i) => (
              <Reveal as="li" key={m.year + m.title} delay={0.05} className="relative">
                <span className="absolute -left-10 top-2 grid size-4 place-items-center rounded-full border border-cyan/60 bg-night md:-left-14 md:size-6">
                  <span className="size-1.5 rounded-full bg-cyan md:size-2" />
                </span>
                <div className="flex flex-col gap-3">
                  <span className="font-display text-5xl font-extrabold tracking-[-0.04em] text-white/90 md:text-6xl">{m.year}</span>
                  <h3 className="font-display text-2xl font-bold">{m.title}</h3>
                  <p className="max-w-xl text-[16px] leading-relaxed text-white/65">{m.body}</p>
                </div>
                {i === items.length - 1 && <span className="sr-only">Latest milestone</span>}
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
