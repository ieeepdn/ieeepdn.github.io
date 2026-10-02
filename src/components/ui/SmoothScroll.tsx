'use client'
import { useEffect } from 'react'
import Lenis from 'lenis'
import { usePathname } from 'next/navigation'

let lenis: Lenis | null = null
export const getLenis = () => lenis

/** Buttery inertial scrolling (disabled for users who prefer reduced motion). */
export function SmoothScroll() {
  const pathname = usePathname()

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true })
    let raf = 0
    const loop = (time: number) => {
      lenis?.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis?.destroy()
      lenis = null
    }
  }, [])

  useEffect(() => {
    if (window.location.hash) return
    lenis?.scrollTo(0, { immediate: true })
  }, [pathname])

  return null
}
