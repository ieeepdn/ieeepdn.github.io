'use client'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import clsx from 'clsx'

export function Faq({ items, dark }: { items: { q: string; a: string }[]; dark?: boolean }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className={clsx('flex flex-col border-t', dark ? 'border-white/15' : 'border-line')}>
      {items.map((it, i) => {
        const isOpen = open === i
        return (
          <div key={it.q} className={clsx('border-b', dark ? 'border-white/15' : 'border-line')}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-6 py-6 text-left"
            >
              <span className="font-display text-xl font-bold tracking-[-0.01em] md:text-2xl">{it.q}</span>
              <span
                className={clsx(
                  'grid size-11 shrink-0 place-items-center rounded-full border transition-all duration-500',
                  isOpen ? 'rotate-45 border-ieee bg-ieee text-white' : dark ? 'border-white/25' : 'border-ink/20',
                )}
              >
                <Plus className="size-5" aria-hidden />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className={clsx('max-w-2xl pb-7 text-[16.5px] leading-relaxed', dark ? 'text-white/70' : 'text-ink-3')}>{it.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
