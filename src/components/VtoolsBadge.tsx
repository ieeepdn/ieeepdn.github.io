import clsx from 'clsx'
import { relativeFromNow } from '@/lib/format'

export function VtoolsBadge({ lastSync, dark, className }: { lastSync?: string | null; dark?: boolean; className?: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-2 rounded-full border px-3.5 py-2 font-mono text-[11.5px] tracking-wide',
        dark ? 'border-white/15 bg-white/5 text-white/75' : 'border-line bg-surface text-ink-2',
        className,
      )}
    >
      <span className="relative flex size-2">
        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70" />
        <span className="relative size-2 rounded-full bg-emerald-500" />
      </span>
      Live from IEEE vTools{lastSync ? ` · synced ${relativeFromNow(lastSync)}` : ''}
    </span>
  )
}
