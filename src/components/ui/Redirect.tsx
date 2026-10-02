'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** GitHub Pages cannot send HTTP redirects — forward in the browser (and tell search engines the right address). */
export function Redirect({ to }: { to: string }) {
  const router = useRouter()
  useEffect(() => router.replace(to), [router, to])
  return (
    <>
      <meta httpEquiv="refresh" content={`0; url=${(process.env.NEXT_PUBLIC_BASE_PATH || '') + to}`} />
      <link rel="canonical" href={to} />
      <p className="container-x py-32 text-center text-ink-2">
        This page has moved to <a className="underline" href={(process.env.NEXT_PUBLIC_BASE_PATH || '') + to}>{to}</a>.
      </p>
    </>
  )
}
