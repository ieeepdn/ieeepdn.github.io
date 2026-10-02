import Link from 'next/link'
import clsx from 'clsx'
import type { Post } from '@/payload-types'
import { asChapter, mediaInfo } from '@/lib/media'
import { MediaFrame } from './ui/MediaFrame'
import { dateShort } from '@/lib/format'

const kinds: Record<string, string> = { recap: 'Event recap', announcement: 'Announcement', story: 'Story', achievement: 'Achievement' }

export function PostCard({ post, large, className }: { post: Post; large?: boolean; className?: string }) {
  const chapter = asChapter(post.chapter)
  const cover = mediaInfo(post.cover, large ? 'hero' : 'card')
  const accent = chapter?.accent || '#00629B'
  return (
    <article className={clsx('group relative flex flex-col gap-5', className)}>
      <MediaFrame
        media={cover}
        ratio={large ? 16 / 10 : 4 / 3}
        sizes={large ? '(min-width: 1024px) 60vw, 100vw' : '(min-width: 1024px) 30vw, 100vw'}
        className="rounded-[1.5rem]"
      >
        {!cover && (
          <div className="absolute inset-0 grid place-items-center" style={{ background: `linear-gradient(135deg, ${accent}, #030a13)` }}>
            <div className="grid-lines absolute inset-0 opacity-50" />
            <span className="relative font-display text-6xl font-extrabold text-white/80">{chapter?.kind === 'branch' ? 'IEEE' : chapter?.shortName}</span>
          </div>
        )}
        <div className="absolute left-4 top-4 flex gap-2">
          {chapter && (
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold backdrop-blur" style={{ color: accent }}>
              {chapter.kind === 'branch' ? 'Branch' : chapter.shortName}
            </span>
          )}
        </div>
      </MediaFrame>
      <div className="flex flex-col gap-2.5">
        <span className="font-mono text-[11.5px] uppercase tracking-[0.14em] text-ink-3">
          {kinds[post.kind ?? 'story']} · {dateShort(post.date)}
        </span>
        <h3 className={clsx('font-display font-bold leading-[1.12] tracking-[-0.02em]', large ? 'text-[clamp(1.8rem,3vw,2.6rem)]' : 'text-[1.45rem]')}>
          <Link href={`/news/${post.slug}`} className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_2px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 after:absolute after:inset-0 group-hover:bg-[length:100%_2px]">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && <p className={clsx('leading-relaxed text-ink-3', large ? 'text-lg' : 'line-clamp-2 text-[15px]')}>{post.excerpt}</p>}
      </div>
    </article>
  )
}
