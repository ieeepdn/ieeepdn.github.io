'use client'
import { useId, useRef, useState } from 'react'
import clsx from 'clsx'
import { Coffee, Mic2, Sparkles, Users, Wrench } from 'lucide-react'

export type ScheduleSlot = {
  title: string
  kind: 'session' | 'keynote' | 'workshop' | 'break' | 'ceremony'
  speaker?: string | null
  room?: string | null
  description?: string | null
}
export type ScheduleGroup = { time: string; end?: string | null; slots: ScheduleSlot[] }
export type ScheduleDay = { key: string; label: string; date?: string | null; groups: ScheduleGroup[] }

const KIND = {
  keynote: { label: 'Keynote', Icon: Mic2 },
  workshop: { label: 'Workshop', Icon: Wrench },
  ceremony: { label: 'Ceremony', Icon: Sparkles },
  session: { label: 'Session', Icon: Users },
  break: { label: 'Break', Icon: Coffee },
} as const

/** Day tabs (arrow keys move between days) with time rows; slots that share a start time sit side by side. */
export function ScheduleTabs({ days }: { days: ScheduleDay[] }) {
  const [active, setActive] = useState(0)
  const base = useId()
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const next = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? days.length - 1 : null
    if (next === null) return
    e.preventDefault()
    const n = (next + days.length) % days.length
    setActive(n)
    tabs.current[n]?.focus()
  }

  const day = days[active]
  return (
    <div className="flex flex-col gap-8">
      {days.length > 1 && (
        <div role="tablist" aria-label="Conference days" className="flex gap-2 overflow-x-auto pb-1">
          {days.map((d, i) => (
            <button
              key={d.key}
              ref={(el) => {
                tabs.current[i] = el
              }}
              type="button"
              role="tab"
              id={`${base}-tab-${i}`}
              aria-selected={i === active}
              aria-controls={`${base}-panel`}
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => onKey(e, i)}
              className={clsx(
                'flex shrink-0 flex-col items-start rounded-2xl border px-5 py-3 text-left transition',
                i === active ? 'border-transparent bg-ink text-paper' : 'border-line bg-surface text-ink hover:border-ink/30',
              )}
            >
              <span className="font-display text-lg font-bold leading-tight">{d.label}</span>
              {d.date && <span className={clsx('text-sm', i === active ? 'text-paper/75' : 'text-ink-3')}>{d.date}</span>}
            </button>
          ))}
        </div>
      )}

      <div role={days.length > 1 ? 'tabpanel' : undefined} id={`${base}-panel`} aria-labelledby={days.length > 1 ? `${base}-tab-${active}` : undefined}>
        {days.length === 1 && (day.label || day.date) && (
          <p className="mb-6 font-display text-xl font-bold">
            {day.label}
            {day.date && <span className="ml-2 font-sans text-base font-normal text-ink-3">{day.date}</span>}
          </p>
        )}
        <ol className="flex flex-col border-t border-line">
          {day.groups.map((g, k) => {
            const onlyBreak = g.slots.every((s) => s.kind === 'break')
            return (
              <li key={k} className="grid gap-3 border-b border-line py-5 sm:grid-cols-[7.5rem_1fr] sm:gap-6">
                <span className="font-mono text-sm tabular-nums text-ink-2 sm:pt-4">
                  {g.time}
                  {g.end && <span className="text-ink-3">–{g.end}</span>}
                </span>
                {onlyBreak ? (
                  <span className="flex items-center gap-3 rounded-2xl bg-paper-2/60 px-5 py-3 text-[15px] text-ink-2">
                    <Coffee className="size-4 text-ink-3" aria-hidden />
                    {g.slots.map((s) => s.title).join(' · ')}
                  </span>
                ) : (
                  <div className={clsx('grid gap-3', g.slots.length === 2 && 'md:grid-cols-2', g.slots.length >= 3 && 'md:grid-cols-2 xl:grid-cols-3')}>
                    {g.slots.map((s, j) => {
                      const kind = KIND[s.kind] ?? KIND.session
                      const strong = s.kind === 'keynote'
                      return (
                        <div
                          key={j}
                          className={clsx(
                            'flex flex-col gap-2 rounded-2xl border p-5',
                            strong ? 'accent-chip border-transparent' : 'border-line bg-surface',
                          )}
                        >
                          <span className="flex flex-wrap items-center gap-2">
                            <span className={clsx('inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em]', strong ? 'accent-text' : 'text-ink-3')}>
                              <kind.Icon className="size-3.5" aria-hidden />
                              {kind.label}
                            </span>
                            {s.room && <span className="rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs text-ink-2">{s.room}</span>}
                          </span>
                          <span className="font-display text-lg font-bold leading-snug text-ink">{s.title}</span>
                          {s.speaker && <span className="text-[15px] text-ink-2">{s.speaker}</span>}
                          {s.description && <span className="whitespace-pre-line text-sm leading-relaxed text-ink-3">{s.description}</span>}
                        </div>
                      )
                    })}
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
