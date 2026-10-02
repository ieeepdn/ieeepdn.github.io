'use client'
import { useEffect, useState } from 'react'

const parts = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000))
  return [
    [Math.floor(s / 86400), 'days'],
    [Math.floor((s % 86400) / 3600), 'hrs'],
    [Math.floor((s % 3600) / 60), 'min'],
    [s % 60, 'sec'],
  ] as const
}

/** Live countdown to an event; renders nothing once the moment has passed. */
export function Countdown({ to }: { to: string }) {
  const target = new Date(to).getTime()
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    setNow(Date.now())
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  if (now !== null && target <= now) return null
  const p = parts(target - (now ?? target))
  return (
    <div role="timer" aria-label="Time left" className="flex items-center gap-2">
      {p.map(([v, label]) => (
        <span key={label} className="flex min-w-[4.2rem] flex-col items-center rounded-2xl border border-white/15 bg-white/[0.06] px-3 py-2 backdrop-blur">
          <span className="font-display text-2xl font-extrabold tabular-nums leading-none" suppressHydrationWarning>
            {now === null ? '–' : String(v).padStart(2, '0')}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/60">{label}</span>
        </span>
      ))}
    </div>
  )
}
