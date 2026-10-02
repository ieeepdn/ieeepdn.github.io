import type { MetadataRoute } from 'next'
export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SERVER_URL || 'https://ieee.soc.pdn.ac.lk'
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api'] }], sitemap: `${base}/sitemap.xml` }
}
