/**
 * Prepares images for the static site (runs before `next dev` / `next build`):
 *  - reads every image under public/media (what Pages CMS uploads to)
 *  - writes resized WebP copies to public/media/_sizes (thumb 480 px, card 960 px, hero 1920 px wide)
 *  - writes src/content/media-index.json with each image's size and its resized copies
 * Resized copies are cached: an image is only processed again when it changes.
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = process.cwd()
const MEDIA = path.join(ROOT, 'public/media')
const SIZES_DIR = path.join(MEDIA, '_sizes')
const INDEX = path.join(ROOT, 'src/content/media-index.json')
const SIZES = { thumb: 480, card: 960, hero: 1920 }
const IMG = /\.(jpe?g|png|webp|avif|gif|tiff?)$/i

const walk = (dir) =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
        const p = path.join(dir, d.name)
        if (d.isDirectory()) return d.name === '_sizes' ? [] : walk(p)
        return IMG.test(d.name) ? [p] : []
      })
    : []

const old = fs.existsSync(INDEX) ? JSON.parse(fs.readFileSync(INDEX, 'utf8')) : {}
fs.mkdirSync(SIZES_DIR, { recursive: true })
const files = walk(MEDIA)
const index = {}
let made = 0
const started = Date.now()

const queue = [...files]
const worker = async () => {
  while (queue.length) {
    const file = queue.shift()
    const rel = '/' + path.relative(path.join(ROOT, 'public'), file).split(path.sep).join('/')
    const stat = fs.statSync(file)
    const prev = old[rel]
    const stem = rel.replace(/^\/media\//, '').replace(/\//g, '__').replace(/\.[^.]+$/, '')
    try {
      let width = prev?.width
      let height = prev?.height
      if (!prev || prev.mtime !== stat.mtimeMs || !width) {
        const meta = await sharp(file, { animated: false }).rotate().metadata()
        const turned = (meta.orientation ?? 1) >= 5
        width = turned ? meta.height : meta.width
        height = turned ? meta.width : meta.height
      }
      const sizes = {}
      for (const [name, w] of Object.entries(SIZES)) {
        if (!width || width <= w) continue // never enlarge (same as Payload)
        const out = path.join(SIZES_DIR, `${stem}-${w}.webp`)
        const h = Math.round((height * w) / width)
        if (!fs.existsSync(out) || fs.statSync(out).mtimeMs < stat.mtimeMs) {
          await sharp(file).rotate().resize({ width: w }).webp({ quality: name === 'thumb' ? 78 : 80 }).toFile(out)
          made++
        }
        sizes[name] = { url: `/media/_sizes/${stem}-${w}.webp`, width: w, height: h }
      }
      index[rel] = { width, height, mtime: stat.mtimeMs, sizes }
    } catch (e) {
      console.warn(`! skipped ${rel}: ${e.message}`)
    }
  }
}
await Promise.all(Array.from({ length: 4 }, worker))
fs.mkdirSync(path.dirname(INDEX), { recursive: true })
fs.writeFileSync(INDEX, JSON.stringify(index))
console.log(`media: ${files.length} images, ${made} resized copies made in ${((Date.now() - started) / 1000).toFixed(1)}s`)
