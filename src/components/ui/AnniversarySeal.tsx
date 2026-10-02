import clsx from 'clsx'

/** Rotating "25 years" seal — the branch turned 25 on 19 July 2026. */
export function AnniversarySeal({ className, size = 132 }: { className?: string; size?: number }) {
  const text = 'SRI LANKA’S FIRST IEEE STUDENT BRANCH · 2001 — 2026 · '
  return (
    <div className={clsx('relative', className)} style={{ width: size, height: size }} aria-label="25 years, 2001 to 2026">
      <svg viewBox="0 0 200 200" className="absolute inset-0 animate-spin-slow" aria-hidden>
        <defs>
          <path id="seal-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <text fill="currentColor" className="fill-white/70 font-mono" style={{ fontSize: 13.2, letterSpacing: '0.18em' }}>
          <textPath href="#seal-circle">{text}</textPath>
        </text>
      </svg>
      <div className="absolute inset-[26%] flex flex-col items-center justify-center rounded-full bg-gradient-to-br from-cyan to-ieee text-night shadow-[0_0_40px_rgba(67,198,244,0.45)]">
        <span className="font-display text-[1.9rem] font-extrabold leading-none">25</span>
        <span className="font-mono text-[9px] font-medium tracking-[0.2em]">YEARS</span>
      </div>
    </div>
  )
}
