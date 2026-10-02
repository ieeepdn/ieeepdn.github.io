'use client'
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useRef } from 'react'
import { CountUp, Reveal } from '../ui/motion'

type Stat = { value: string; suffix?: string | null; label: string }

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.16, 1])
  return (
    <motion.span style={{ opacity }} className="relative text-ink">
      {children}{' '}
    </motion.span>
  )
}

/** Scroll-scrubbed manifesto — words light up as you read. */
export function Manifesto({ statement, stats, vision, mission }: { statement: string; stats: Stat[]; vision: string; mission: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.8', 'end 0.45'] })
  const words = statement.split(' ')

  return (
    <section id="story" className="relative bg-paper atmos">
      <div className="container-x grid gap-16 py-28 md:py-40 lg:grid-cols-[0.34fr_1fr]">
        <Reveal className="flex flex-col gap-4 lg:sticky lg:top-32 lg:self-start">
          <span className="eyebrow text-brand">Why we exist</span>
          <span className="max-w-[16ch] font-display text-2xl font-bold leading-tight text-ink-2">
            The link between the IEEE global body and every engineering student at Peradeniya.
          </span>
        </Reveal>
        <div ref={ref}>
          <p className="font-display text-[clamp(1.9rem,4.3vw,4.1rem)] font-bold leading-[1.08] tracking-[-0.03em]">
            {words.map((w, i) => {
              const start = i / words.length
              return (
                <Word key={i} progress={scrollYProgress} range={[start, start + 1 / words.length]}>
                  {w}
                </Word>
              )
            })}
          </p>
        </div>
      </div>

      <div className="container-x">
        <div className="grid grid-cols-2 border-t border-line md:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="flex flex-col gap-3 border-b border-line py-10 pr-6 md:border-b-0 md:[&:not(:last-child)]:border-r md:[&:not(:first-child)]:pl-8">
              <CountUp value={s.value} suffix={s.suffix ?? ''} className="font-display text-[clamp(2.8rem,6vw,5rem)] font-extrabold leading-none tracking-[-0.04em] text-ink" />
              <span className="max-w-[22ch] text-[15px] leading-snug text-ink-3">{s.label}</span>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="container-x grid gap-6 pb-28 pt-16 md:grid-cols-2 md:pb-36">
        {[
          ['Our vision', vision],
          ['Our mission', mission],
        ].map(([title, body], i) => (
          <Reveal key={title} delay={i * 0.1} className="group relative overflow-hidden rounded-[1.75rem] border border-line bg-surface p-8 md:p-10">
            <div className="absolute -right-16 -top-16 size-48 rounded-full bg-cyan/10 blur-2xl transition-transform duration-700 group-hover:scale-150" />
            <span className="eyebrow text-brand">{title}</span>
            <p className="relative mt-4 font-display text-[1.45rem] font-semibold leading-snug tracking-[-0.015em] text-ink md:text-[1.65rem]">{body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
