'use client'
import { useState } from 'react'
import { MapPin } from 'lucide-react'

/** A Google map that loads only after the visitor asks for it (no Google requests or cookies before that). */
export function MapReveal({ query, title }: { query: string; title: string }) {
  const [show, setShow] = useState(false)
  if (show) {
    return (
      <iframe
        src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`}
        title={`Map: ${title}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute inset-0 size-full border-0"
      />
    )
  }
  return (
    <div className="absolute inset-0 grid place-items-center bg-night-2 text-white" data-theme="dark">
      <div aria-hidden className="grid-lines absolute inset-0 opacity-40" />
      <div className="relative flex flex-col items-center gap-3 px-6 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-white/10">
          <MapPin className="size-6" aria-hidden />
        </span>
        <button type="button" onClick={() => setShow(true)} className="rounded-full bg-white px-5 py-2.5 font-semibold text-night transition hover:bg-cyan">
          Show the map
        </button>
        <span className="text-xs text-white/60">Loads Google Maps</span>
      </div>
    </div>
  )
}
