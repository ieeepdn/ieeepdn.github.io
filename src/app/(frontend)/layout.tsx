import React from 'react'
import type { Metadata, Viewport } from 'next'
import '@fontsource-variable/bricolage-grotesque/opsz.css'
import '@fontsource/ibm-plex-sans/latin-400.css'
import '@fontsource/ibm-plex-sans/latin-500.css'
import '@fontsource/ibm-plex-sans/latin-600.css'
import '@fontsource/ibm-plex-sans/latin-700.css'
import '@fontsource/ibm-plex-mono/latin-400.css'
import '@fontsource/ibm-plex-mono/latin-500.css'
import './globals.css'
import { SmoothScroll } from '@/components/ui/SmoothScroll'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { ScrollProgress } from '@/components/ui/ScrollProgress'
import { Analytics } from '@/components/Analytics'
import { getChapters, getSettings, getSpotlight } from '@/lib/data'
import { themeScript } from '@/lib/theme'

const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://ieee.soc.pdn.ac.lk'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'IEEE Student Branch · University of Peradeniya',
    template: '%s · IEEE SB University of Peradeniya',
  },
  description:
    'Sri Lanka’s first IEEE Student Branch (est. 2001). Seven chapters and affinity groups at the Faculty of Engineering, University of Peradeniya — events live from IEEE vTools.',
  keywords: ['IEEE', 'University of Peradeniya', 'Student Branch', 'Sri Lanka', 'IEEE Computer Society', 'WIE', 'IEEEXtreme'],
  icons: { icon: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/brand/favicon.png`, apple: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/brand/favicon.png` },
  openGraph: {
    type: 'website',
    siteName: 'IEEE Student Branch · University of Peradeniya',
    images: [`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/brand/og.jpg`],
  },
}

export const viewport: Viewport = {
  themeColor: '#030a13',
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [settings, chapters, spotlight] = await Promise.all([getSettings(), getChapters(), getSpotlight()])
  const announcement = settings.announcement?.active
    ? { text: settings.announcement.text ?? '', url: settings.announcement.url ?? '' }
    : (spotlight?.topBar ?? null)
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh bg-paper text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-night"
        >
          Skip to content
        </a>
        <SmoothScroll />
        <Analytics gaId={settings.googleAnalyticsId} />
        <ScrollProgress />
        <SiteHeader
          chapters={chapters.map((c) => ({ name: c.name, shortName: c.shortName, slug: c.slug ?? '', kind: c.kind, accent: c.accent ?? '#00629B' }))}
          announcement={announcement}
          spotlight={spotlight?.menu ?? null}
        />
        <main id="main">{children}</main>
        <SiteFooter settings={settings} chapters={chapters} />
      </body>
    </html>
  )
}
