'use client'
import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'

/** Giant outlined wordmark that rises into view at the bottom of every page. */
export function FooterWordmark() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const y = useTransform(scrollYProgress, [0, 1], ['40%', '0%'])
  const opacity = useTransform(scrollYProgress, [0, 1], [0.2, 1])
  return (
    <div ref={ref} aria-hidden className="relative overflow-hidden">
      <motion.div style={{ y, opacity }} className="container-x select-none pb-[0.18em]">
        <div
          className="font-display font-extrabold leading-[1.08] tracking-[-0.06em] text-transparent"
          style={{
            fontSize: 'clamp(4rem, 19vw, 19rem)',
            WebkitTextStroke: '1px rgb(158 220 246 / 0.35)',
            backgroundImage: 'linear-gradient(180deg, rgb(67 198 244 / 0.28), transparent 75%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
          }}
        >
          #ieeepdn
        </div>
      </motion.div>
    </div>
  )
}
