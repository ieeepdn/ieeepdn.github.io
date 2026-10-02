'use client'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { useEffect } from 'react'
import clsx from 'clsx'

export type EmblemChapter = { slug: string; shortName: string; accent: string; logo?: string | null }

const EASE = [0.16, 1, 0.3, 1] as const
/** Server and browser can disagree in the last digits of Math.cos — round so hydration matches. */
const r2 = (n: number) => Math.round(n * 100) / 100

/**
 * The branch logo as a "signal source": the mark sits at the centre, pulses radiate out into the
 * wave field behind it, and the society chapters orbit it — each node links to its chapter page.
 */
export function HeroEmblem({ chapters, className }: { chapters: EmblemChapter[]; className?: string }) {
  const reduce = useReducedMotion()
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 60, damping: 18 })
  const sy = useSpring(my, { stiffness: 60, damping: 18 })
  const tiltX = useTransform(sy, [-1, 1], [10, -10])
  const tiltY = useTransform(sx, [-1, 1], [-12, 12])
  const nearX = useTransform(sx, [-1, 1], [-14, 14])
  const nearY = useTransform(sy, [-1, 1], [-14, 14])
  const farX = useTransform(sx, [-1, 1], [8, -8])
  const farY = useTransform(sy, [-1, 1], [8, -8])

  useEffect(() => {
    if (reduce) return
    const onMove = (e: PointerEvent) => {
      mx.set((e.clientX / window.innerWidth) * 2 - 1)
      my.set((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [mx, my, reduce])

  const nodes = chapters.slice(0, 8)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.4, delay: 0.35, ease: EASE }}
      className={clsx('group/emblem relative aspect-square w-full select-none', className)}
    >
      {/* glow */}
      <div aria-hidden className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(67,198,244,0.28),rgba(0,98,155,0.18)_38%,transparent_68%)] blur-2xl" />

      {/* rings + radiating pulses (far layer) */}
      <motion.svg aria-hidden viewBox="0 0 400 400" className="absolute inset-0 size-full overflow-visible" style={{ x: farX, y: farY }}>
        <defs>
          <radialGradient id="emblem-pulse" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="rgb(67 198 244)" stopOpacity="0" />
            <stop offset="100%" stopColor="rgb(67 198 244)" stopOpacity="0.5" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="200" r="196" fill="none" stroke="rgb(158 220 246 / 0.10)" />
        <circle cx="200" cy="200" r="160" fill="none" stroke="rgb(158 220 246 / 0.22)" strokeDasharray="2 7" className="origin-center animate-[spin_120s_linear_infinite]" />
        <circle cx="200" cy="200" r="118" fill="none" stroke="rgb(158 220 246 / 0.14)" />
        {!reduce &&
          [0, 1, 2].map((i) => (
            <circle key={i} cx="200" cy="200" r="80" fill="url(#emblem-pulse)" className="emblem-pulse" style={{ animationDelay: `${i * 1.4}s` }} />
          ))}
        {/* tick marks on the outer ring, like an instrument dial */}
        {Array.from({ length: 60 }, (_, i) => {
          const a = (i / 60) * Math.PI * 2
          const outer = 196
          const inner = i % 5 === 0 ? 186 : 191
          return (
            <line
              key={i}
              x1={r2(200 + Math.cos(a) * outer)}
              y1={r2(200 + Math.sin(a) * outer)}
              x2={r2(200 + Math.cos(a) * inner)}
              y2={r2(200 + Math.sin(a) * inner)}
              stroke={i % 5 === 0 ? 'rgb(158 220 246 / 0.4)' : 'rgb(158 220 246 / 0.16)'}
              strokeWidth={1}
            />
          )
        })}
      </motion.svg>

      {/* the mark (near layer, tilts with the pointer) */}
      <motion.div className="absolute inset-[27%] [perspective:900px]" style={{ x: nearX, y: nearY }}>
        <motion.div style={{ rotateX: tiltX, rotateY: tiltY }} className="relative size-full [transform-style:preserve-3d]">
          <div aria-hidden className="absolute inset-[6%] rounded-full bg-[radial-gradient(circle,rgba(210,236,250,0.55),rgba(67,198,244,0.18)_55%,transparent_72%)]" />
          <motion.div
            animate={reduce ? undefined : { y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="relative size-full"
          >
            <Image
              src="/brand/logo-mark.png"
              alt="IEEE Student Branch, University of Peradeniya"
              fill
              priority
              sizes="(min-width: 1024px) 18vw, 40vw"
              className="object-contain drop-shadow-[0_18px_40px_rgba(0,98,155,0.65)]"
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* chapter orbit: the ring turns, each node counter-turns so its label stays upright */}
      <nav aria-label="Chapters" className="absolute inset-[10%] animate-[spin_90s_linear_infinite] group-hover/emblem:[animation-play-state:paused] motion-reduce:animate-none">
        {nodes.map((c, i) => {
          const a = (i / nodes.length) * Math.PI * 2 - Math.PI / 2
          return (
            <span
              key={c.slug}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${r2(50 + Math.cos(a) * 50)}%`, top: `${r2(50 + Math.sin(a) * 50)}%` }}
            >
              <Link
                href={`/chapters/${c.slug}`}
                className="group/node flex animate-[spin_90s_linear_infinite_reverse] flex-col items-center gap-1.5 group-hover/emblem:[animation-play-state:paused] motion-reduce:animate-none"
                aria-label={c.shortName}
              >
                <span
                  className="grid size-11 place-items-center rounded-full bg-white p-1.5 shadow-[0_0_0_4px_rgb(3_10_19/0.6),0_10px_30px_-8px_rgb(0_0_0/0.6)] ring-2 transition-transform duration-500 group-hover/node:scale-125 xl:size-12"
                  style={{ ['--tw-ring-color' as string]: c.accent }}
                >
                  {c.logo ? (
                    <Image src={c.logo} alt="" width={40} height={40} className="size-full object-contain" />
                  ) : (
                    <span className="size-3 rounded-full" style={{ background: c.accent }} />
                  )}
                </span>
                <span className="rounded-full bg-night/70 px-2 py-0.5 font-mono text-[10.5px] tracking-[0.08em] text-white/80 backdrop-blur transition-colors group-hover/node:text-white">
                  {c.shortName}
                </span>
              </Link>
            </span>
          )
        })}
      </nav>
    </motion.div>
  )
}
