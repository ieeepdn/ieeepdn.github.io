import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="grain relative flex min-h-[80vh] items-center overflow-hidden bg-night text-white">
      <div className="grid-lines absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="container-x relative flex flex-col gap-6 py-40">
        <span className="eyebrow text-cyan">Error 404 · signal lost</span>
        <h1 className="font-display text-[clamp(3rem,10vw,9rem)] font-extrabold leading-[0.9] tracking-[-0.05em]">
          No carrier <span className="text-gradient">detected.</span>
        </h1>
        <p className="max-w-lg text-lg text-white/70">The page you’re looking for has moved or never existed. Let’s get you back on frequency.</p>
        <div className="flex gap-3">
          <Link href="/" className="rounded-full bg-white px-6 py-3.5 font-semibold text-night hover:bg-cyan">Back home</Link>
          <Link href="/events" className="rounded-full border border-white/25 px-6 py-3.5 font-semibold hover:bg-white/10">See events</Link>
        </div>
      </div>
    </section>
  )
}
