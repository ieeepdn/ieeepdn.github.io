import type { Metadata } from 'next'
import { PageHero } from '@/components/PageHero'
import { GalleryGrid, type GalleryAlbum } from '@/components/GalleryGrid'
import { asChapter, getAlbums } from '@/lib/data'
import { isPhoto, toPhoto } from '@/lib/photos'
import { dateShort } from '@/lib/format'

export const metadata: Metadata = { title: 'Gallery', description: 'Photos from IEEE Student Branch events at the University of Peradeniya.' }

export default async function GalleryPage() {
  const albums = await getAlbums()
  const data: GalleryAlbum[] = albums.map((a) => {
    const ch = asChapter(a.chapter)
    const chip = ch ? { label: ch.kind === 'branch' ? 'Branch' : ch.shortName, accent: ch.accent ?? '#00629B' } : null
    return {
      id: String(a.id),
      title: a.title,
      date: a.date ?? null,
      dateLabel: a.date ? dateShort(a.date) : null,
      description: a.description,
      chapter: ch ? { slug: ch.slug ?? '', shortName: chip!.label, accent: chip!.accent } : null,
      photos: (a.photos ?? []).map((p) => toPhoto(p, { caption: a.title, chip })).filter(isPhoto),
    }
  })
  return (
    <>
      <PageHero eyebrow="Gallery" title="Moments worth keeping." text="Workshops, competitions, field visits and outreach — shot by our volunteers. Chapter webmasters add new albums after every event." compact />
      <GalleryGrid albums={data} />
    </>
  )
}
