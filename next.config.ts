import type { NextConfig } from 'next'
import path from 'path'

/**
 * Static export for GitHub Pages: `next build` writes the whole site to ./out.
 * NEXT_PUBLIC_BASE_PATH is only needed when the site is served from a sub-folder
 * (https://<org>.github.io/<repo>/). With a custom domain (ieee.soc.pdn.ac.lk) or an
 * <org>.github.io repository, leave it empty.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: basePath || undefined,
  images: { loader: 'custom', loaderFile: './src/lib/image-loader.ts' },
  turbopack: { root: path.resolve('.') },
}

export default nextConfig
