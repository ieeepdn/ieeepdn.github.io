import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { RichText } from '@/components/RichText'
import { PostCard } from '@/components/PostCard'
import { Reveal } from '@/components/ui/motion'
import { asChapter, getPost, getPosts, isPreview, mediaInfo, mediaUrl } from '@/lib/data'
import { MediaFrame } from '@/components/ui/MediaFrame'
import { PreviewBar } from '@/components/PreviewBar'
import { PhotoSet } from '@/components/ui/Photos'
import { isPhoto, toPhoto } from '@/lib/photos'
import { dateLong } from '@/lib/format'


export const dynamicParams = false

export async function generateStaticParams() {
  return (await getPosts({ limit: 100 })).filter((p) => p.slug).map((p) => ({ slug: p.slug as string }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const p = await getPost(slug)
  if (!p) return {}
  const img = mediaUrl(p.cover, 'hero')
  return { title: p.title, description: p.excerpt ?? undefined, openGraph: img ? { images: [img] } : undefined }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()
  const preview = await isPreview()
  const chapter = asChapter(post.chapter)
  const accent = chapter?.accent || '#00629B'
  const cover = mediaInfo(post.cover, 'hero', post.title)
  const more = await getPosts({ limit: 3, exclude: post.id })
  const gallery = (post.gallery ?? []).map((m) => toPhoto(m, { caption: post.title })).filter(isPhoto)

  return (
    <article>
      {preview && <PreviewBar status={post._status} path={`/news/${post.slug}`} />}
      <header className="relative overflow-hidden bg-night pb-16 pt-40 text-white md:pt-48">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 60% 70% at 85% 0%, ${accent}99, transparent 60%)` }} />
        <div className="container-x relative flex max-w-5xl flex-col gap-7">
          <Link href="/news" className="flex w-fit items-center gap-2 text-sm text-white/70 hover:text-white">
            <ArrowLeft className="size-4" aria-hidden /> All stories
          </Link>
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-[0.14em] text-white/70">
            {chapter && (
              <Link href={chapter.kind === 'branch' ? '/about' : `/chapters/${chapter.slug}`} className="rounded-full px-3 py-1 font-sans text-sm font-semibold normal-case tracking-normal text-white" style={{ background: accent }}>
                {chapter.shortName}
              </Link>
            )}
            <span>{dateLong(post.date)}</span>
          </div>
          <h1 className="font-display text-[clamp(2.3rem,5.5vw,4.8rem)] font-extrabold leading-[0.98] tracking-[-0.04em]">{post.title}</h1>
          {post.excerpt && <p className="max-w-3xl text-xl leading-relaxed text-white/75">{post.excerpt}</p>}
        </div>
      </header>

      {cover && (
        <div className="bg-night">
          <div className="container-x">
            <Reveal className="translate-y-10">
              <MediaFrame media={cover} ratio={16 / 8} priority zoom={false} sizes="(min-width: 1408px) 1300px, 100vw" className="rounded-[2rem] shadow-2xl" />
            </Reveal>
          </div>
        </div>
      )}

      <div className="bg-paper pb-24 pt-24">
        <div className="container-x max-w-3xl">
          <div className="prose-ieee">{post.content ? <RichText data={post.content} /> : null}</div>
          {post.cta?.url && (
            <a href={post.cta.url} target="_blank" rel="noreferrer" className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-ieee px-6 font-semibold text-white hover:bg-ieee-600">
              {post.cta.label || 'Learn more'} <ArrowUpRight className="size-4" aria-hidden />
            </a>
          )}
        </div>
        {gallery.length > 0 && (
          <div className="container-x mt-16 flex max-w-5xl flex-col gap-5">
            <div className="flex items-center gap-4">
              <h2 className="font-display text-2xl font-bold tracking-[-0.02em]">Photos</h2>
              <span className="font-mono text-xs text-ink-3">{gallery.length}</span>
              <span className="h-px flex-1 bg-line" />
            </div>
            <PhotoSet photos={gallery} />
          </div>
        )}
      </div>

      {more.length > 0 && (
        <section className="bg-mist atmos py-20">
          <div className="container-x">
            <h2 className="mb-10 font-display text-3xl font-extrabold tracking-[-0.03em]">Keep reading</h2>
            <div className="grid gap-x-6 gap-y-12 md:grid-cols-3">
              {more.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  )
}
