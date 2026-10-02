import clsx from 'clsx'

export type SectionStyle = {
  background?: 'auto' | 'paper' | 'mist' | 'dark' | 'accent' | null
  spacing?: 'normal' | 'compact' | null
  anchor?: string | null
}

export const isDarkBg = (bg: SectionStyle['background']) => bg === 'dark' || bg === 'accent'

/** Resolve "automatic" backgrounds so neighbouring sections alternate. */
export const resolveBg = (bg: SectionStyle['background'], index: number): Exclude<SectionStyle['background'], 'auto' | null | undefined> =>
  !bg || bg === 'auto' ? (index % 2 ? 'mist' : 'paper') : bg

/**
 * Wrapper for every page section: background, spacing, anchor.
 * Dark and chapter-colour sections switch their subtree to the dark palette with data-theme="dark",
 * so every component inside stays readable without a "dark" prop.
 */
export function Section({
  style,
  index,
  accent,
  className,
  children,
  id,
}: {
  style: SectionStyle
  index: number
  accent: string
  className?: string
  children: React.ReactNode
  id?: string
}) {
  const bg = resolveBg(style.background, index)
  const dark = isDarkBg(bg)
  return (
    <section
      id={style.anchor?.replace(/[^a-z0-9-_]/gi, '-').toLowerCase() || id}
      data-theme={dark ? 'dark' : undefined}
      className={clsx(
        'relative scroll-mt-24 overflow-hidden',
        bg === 'paper' && 'bg-paper atmos',
        bg === 'mist' && 'bg-mist atmos',
        bg === 'dark' && 'bg-night text-ink',
        bg === 'accent' && 'text-ink',
        style.spacing === 'compact' ? 'py-14 md:py-20' : 'py-20 md:py-28',
        className,
      )}
      style={bg === 'accent' ? { background: `radial-gradient(ellipse 80% 90% at 90% 0%, color-mix(in oklab, ${accent} 75%, white 10%), ${accent} 45%, #030a13 120%)` } : undefined}
    >
      {bg === 'dark' && <div aria-hidden className="grid-lines pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />}
      <div className="container-x relative">{children}</div>
    </section>
  )
}
