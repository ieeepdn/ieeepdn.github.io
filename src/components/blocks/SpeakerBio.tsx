'use client'
import { useRef } from 'react'
import Image from 'next/image'
import { ArrowUpRight, X } from 'lucide-react'

/** "Read bio" button + a native modal dialog (focus trap, Esc and backdrop click close it). */
export function SpeakerBio({
  name,
  role,
  affiliation,
  talk,
  bio,
  link,
  photo,
}: {
  name: string
  role?: string | null
  affiliation?: string | null
  talk?: string | null
  bio: string
  link?: string | null
  photo?: string | null
}) {
  const ref = useRef<HTMLDialogElement>(null)
  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className="mt-1 inline-flex w-fit items-center gap-1 text-sm font-semibold accent-text after:absolute after:inset-0 after:content-['']"
        aria-haspopup="dialog"
      >
        Read bio <ArrowUpRight className="size-3.5" aria-hidden />
      </button>
      <dialog
        ref={ref}
        aria-label={name}
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close()
        }}
        className="m-auto w-[min(40rem,calc(100vw-2rem))] max-h-[85vh] overflow-y-auto rounded-[1.75rem] border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-night/70 backdrop:backdrop-blur-sm"
      >
        <div className="flex flex-col gap-5 p-7 md:p-9">
          <div className="flex items-start gap-5">
            {photo && (
              <span className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-paper-2">
                <Image src={photo} alt="" fill sizes="80px" className="object-cover object-top" />
              </span>
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              {role && <span className="eyebrow accent-text">{role}</span>}
              <span className="font-display text-2xl font-extrabold leading-tight">{name}</span>
              {affiliation && <span className="text-[15px] text-ink-2">{affiliation}</span>}
            </div>
            <button type="button" onClick={() => ref.current?.close()} aria-label="Close" className="grid size-10 shrink-0 place-items-center rounded-full border border-line hover:border-ink/40">
              <X className="size-4" aria-hidden />
            </button>
          </div>
          {talk && (
            <p className="rounded-2xl bg-paper-2/60 px-5 py-4 font-display text-lg font-semibold leading-snug">
              <span className="mb-1 block font-mono text-[11px] font-normal uppercase tracking-[0.14em] text-ink-3">Talk</span>
              {talk}
            </p>
          )}
          <div className="flex flex-col gap-3 text-[15.5px] leading-relaxed text-ink-2">
            {bio.split(/\n\s*\n/).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {link && (
            <a href={link} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-1.5 font-semibold accent-text">
              Profile <ArrowUpRight className="size-4" aria-hidden />
            </a>
          )}
        </div>
      </dialog>
    </>
  )
}
