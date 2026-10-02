/**
 * Images are served as-is (GitHub Pages has no image optimiser — scripts/media.mjs makes the resized copies).
 * This loader only adds the sub-folder (NEXT_PUBLIC_BASE_PATH) while the site lives at <org>.github.io/<repo>/.
 */
export default function imageLoader({ src }: { src: string; width: number; quality?: number }) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
  return base && src.startsWith('/') && !src.startsWith(`${base}/`) ? `${base}${src}` : src
}
