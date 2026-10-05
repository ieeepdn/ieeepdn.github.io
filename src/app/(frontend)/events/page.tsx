import type { Metadata } from 'next'
import { PageHero } from '@/components/PageHero'
import { EventsExplorer } from '@/components/EventsExplorer'
import { VtoolsBadge } from '@/components/VtoolsBadge'
import { getChapters, getEvents, getSettings, slimEvent } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Events',
  description: 'Every branch and chapter event — synced live from IEEE vTools.',
}

export default async function EventsPage() {
  const [upcoming, past, chapters, settings] = await Promise.all([
    getEvents({ when: 'upcoming', limit: 100 }),
    getEvents({ when: 'past', limit: 200 }),
    getChapters(),
    getSettings(),
  ])

  return (
    <>
      <PageHero
        eyebrow="Events"
        title="What’s on at the branch."
        text="Talks, workshops, competitions and field visits from every chapter — published once on IEEE vTools and shown here automatically. Register straight from any listing."
        compact
      >
        <VtoolsBadge lastSync={settings.vtoolsLastSync} dark className="mt-2 w-fit" />
      </PageHero>
      <EventsExplorer
        upcoming={upcoming.map(slimEvent)}
        past={past.map(slimEvent)}
        chapters={chapters.map((c) => ({ id: c.id, slug: c.slug ?? '', shortName: c.shortName, accent: c.accent ?? '#00629B', kind: c.kind }))}
        initialWhen={!upcoming.length ? 'past' : 'upcoming'}
      />
    </>
  )
}
