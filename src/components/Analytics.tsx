'use client'
import { usePathname } from 'next/navigation'
import Script from 'next/script'
import { useEffect } from 'react'

/**
 * Google Analytics 4, when a measurement ID is set in Site settings (GitHub Pages has no server of its own
 * to count visits). Sends a page view on every client-side navigation.
 */
export function Analytics({ gaId }: { gaId?: string | null }) {
  const pathname = usePathname()
  useEffect(() => {
    if (!pathname || window.parent !== window) return // not inside the console's live preview
    if (gaId && typeof window.gtag === 'function') window.gtag('event', 'page_view', { page_path: pathname })
  }, [pathname, gaId])

  if (!gaId || !/^G-[A-Z0-9]{4,}$/.test(gaId)) return null
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="ga4" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}',{send_page_view:false});`}
      </Script>
    </>
  )
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}
