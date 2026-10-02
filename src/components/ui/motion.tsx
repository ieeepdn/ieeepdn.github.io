'use client'
import { motion, useInView, useMotionValue, useScroll, useSpring, useTransform, type HTMLMotionProps } from 'motion/react'
import React, { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'

const EASE = [0.16, 1, 0.3, 1] as const

/** Fade + rise into view once. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = 'div',
  ...rest
}: { children: React.ReactNode; delay?: number; y?: number; className?: string; as?: 'div' | 'li' | 'section' | 'article' } & Omit<
  HTMLMotionProps<'div'>,
  'children'
>) {
  const Comp = motion[as] as typeof motion.div
  return (
    <Comp
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.9, delay, ease: EASE }}
      className={className}
      {...rest}
    >
      {children}
    </Comp>
  )
}

/** Stagger children in (wrap each child with <RevealItem>). */
export function Stagger({ children, className, gap = 0.08 }: { children: React.ReactNode; className?: string; gap?: number }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  )
}

export function RevealItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{ hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } } }}
    >
      {children}
    </motion.div>
  )
}

/** Headline that reveals word by word from behind a mask. */
export function SplitHeading({
  text,
  as = 'h2',
  className,
  wordClassName,
  delay = 0,
  highlight,
}: {
  text: string
  as?: 'h1' | 'h2' | 'h3' | 'p'
  className?: string
  wordClassName?: string
  delay?: number
  /** words (exact match) to render with the gradient accent */
  highlight?: string[]
}) {
  const Tag = as
  const words = text.split(' ')
  return (
    <Tag className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className={clsx('inline-block', wordClassName, highlight?.includes(w.replace(/[.,]/g, '')) && 'text-gradient')}
            initial={{ y: '105%', rotate: 4 }}
            whileInView={{ y: '0%', rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: delay + i * 0.055, ease: EASE }}
          >
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

/** Number that counts up when it scrolls into view. Non-numeric values render as-is. */
export function CountUp({ value, suffix = '', className }: { value: string; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const match = value.match(/^(\D*)(\d[\d,]*)(\D*)$/)
  const target = match ? Number(match[2].replace(/,/g, '')) : null
  const [n, setN] = useState(target !== null && target > 100 && target < 2100 ? target : 0)
  useEffect(() => {
    if (!inView || target === null) return
    const isYear = target > 1900 && target < 2100
    const from = isYear ? target - 25 : 0
    const start = performance.now()
    const dur = 1600
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur)
      const eased = 1 - Math.pow(1 - p, 4)
      setN(Math.round(from + (target - from) * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, target])
  if (!match || target === null)
    return (
      <span ref={ref} className={className}>
        {value}
        {suffix}
      </span>
    )
  return (
    <span ref={ref} className={clsx('tabular-nums', className)}>
      {match[1]}
      {target > 9999 ? n.toLocaleString('en-US') : n}
      {match[3]}
      {suffix}
    </span>
  )
}

/** Pulls toward the cursor a little — for primary CTAs. */
export function Magnetic({ children, strength = 0.28, className }: { children: React.ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 })
  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy }}
      className={clsx('inline-block', className)}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse' || !ref.current) return
        const r = ref.current.getBoundingClientRect()
        x.set((e.clientX - (r.left + r.width / 2)) * strength)
        y.set((e.clientY - (r.top + r.height / 2)) * strength)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}

/** Adds --mx/--my CSS vars for the .spotlight hover glow. */
export function Spotlight({
  children,
  className,
  color,
  ...rest
}: { children: React.ReactNode; className?: string; color?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={clsx('spotlight', className)}
      style={{ ...(color ? ({ '--spot': color } as React.CSSProperties) : {}), ...rest.style }}
      onPointerMove={(e) => {
        const el = e.currentTarget
        const r = el.getBoundingClientRect()
        el.style.setProperty('--mx', `${e.clientX - r.left}px`)
        el.style.setProperty('--my', `${e.clientY - r.top}px`)
      }}
    >
      {children}
    </div>
  )
}

/** Image wrapper that drifts slower than the page. */
export function Parallax({ children, className, amount = 60 }: { children: React.ReactNode; className?: string; amount?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [-amount, amount])
  return (
    <div ref={ref} className={clsx('overflow-hidden', className)}>
      <motion.div style={{ y, scale: 1.12 }} className="size-full">
        {children}
      </motion.div>
    </div>
  )
}

/** Infinite horizontal ticker. */
export function Marquee({
  children,
  className,
  duration = 40,
  reverse,
}: {
  children: React.ReactNode
  className?: string
  duration?: number
  reverse?: boolean
}) {
  return (
    <div className={clsx('group relative flex overflow-hidden', className)}>
      <div
        className="flex w-max animate-marquee items-center group-hover:[animation-play-state:paused]"
        style={{ ['--marquee-duration' as string]: `${duration}s`, animationDirection: reverse ? 'reverse' : 'normal' }}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  )
}
