#!/usr/bin/env node
/**
 * Keeps uploaded photos a sensible size. Phone photos dropped into Pages CMS are often 4000+ px and 5–10 MB;
 * the website never shows more than 2400 px, and big originals make the repository slow to work with.
 * Runs in GitHub Actions before each build: any image in public/media wider/taller than 2400 px or larger than
 * 1.5 MB is resized to fit 2400 px (same file name and format, so nothing that links to it changes).
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const DIR = path.join(process.cwd(), 'public/media')
const MAX_PX = 2400
const MAX_BYTES = 1.5 * 1024 * 1024
const walk = (d) =>
  fs.existsSync(d)
    ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
        const p = path.join(d, e.name)
        if (e.isDirectory()) return e.name === '_sizes' ? [] : walk(p)
        return /\.(jpe?g|png|webp)$/i.test(e.name) ? [p] : []
      })
    : []

let changed = 0
let saved = 0
for (const file of walk(DIR)) {
  const before = fs.statSync(file).size
  let meta
  try {
    meta = await sharp(file).metadata()
  } catch {
    continue
  }
  const big = Math.max(meta.width ?? 0, meta.height ?? 0) > MAX_PX
  if (!big && before <= MAX_BYTES) continue
  const ext = path.extname(file).toLowerCase()
  let img = sharp(file).rotate().resize({ width: MAX_PX, height: MAX_PX, fit: 'inside', withoutEnlargement: true })
  img = ext === '.png' ? img.png({ compressionLevel: 9 }) : ext === '.webp' ? img.webp({ quality: 84 }) : img.jpeg({ quality: 84, mozjpeg: true })
  const out = await img.toBuffer()
  if (out.length >= before && !big) continue
  fs.writeFileSync(file, out)
  changed++
  saved += before - out.length
  console.log(`shrunk ${path.relative(process.cwd(), file)}: ${(before / 1048576).toFixed(1)} MB → ${(out.length / 1048576).toFixed(1)} MB`)
}
console.log(`uploads: ${changed} photo${changed === 1 ? '' : 's'} resized, ${(saved / 1048576).toFixed(1)} MB saved`)
