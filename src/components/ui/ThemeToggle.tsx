'use client'
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import clsx from 'clsx'

import { THEME_KEY as KEY, type Theme } from '@/lib/theme'

const current = (): Theme => (document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light')

function apply(t: Theme, persist: boolean) {
  document.documentElement.setAttribute('data-theme', t)
  if (persist) {
    try {
      localStorage.setItem(KEY, t)
    } catch {}
  }
}

/** Sun/moon switch. Uses a circular View Transition reveal from the button where supported. */
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => {
    setTheme(current())
    // Follow the OS setting until the visitor makes a choice of their own
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => {
      let saved: string | null = null
      try {
        saved = localStorage.getItem(KEY)
      } catch {}
      if (saved) return
      apply(e.matches ? 'dark' : 'light', false)
      setTheme(e.matches ? 'dark' : 'light')
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next: Theme = current() === 'dark' ? 'light' : 'dark'
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } }
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const commit = () => {
      apply(next, true)
      setTheme(next)
    }
    if (!doc.startViewTransition || reduce) return commit()

    const r = e.currentTarget.getBoundingClientRect()
    const x = r.left + r.width / 2
    const y = r.top + r.height / 2
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    const vt = doc.startViewTransition(commit)
    vt.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 700, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' },
        )
      })
      .catch(() => {})
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Dark theme"
      aria-pressed={theme ? theme === 'dark' : undefined}
      title="Switch light / dark theme"
      className={clsx(
        'relative inline-flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 text-white transition hover:border-white/50 hover:bg-white/10',
        className,
      )}
    >
      <Sun
        aria-hidden
        className="absolute size-[18px] rotate-90 scale-0 opacity-0 transition-all duration-500 dark:rotate-0 dark:scale-100 dark:opacity-100"
      />
      <Moon
        aria-hidden
        className="absolute size-[18px] rotate-0 scale-100 opacity-100 transition-all duration-500 dark:-rotate-90 dark:scale-0 dark:opacity-0"
      />
    </button>
  )
}
