import type { Metadata } from 'next'
import Image from 'next/image'
import { PageHero } from '@/components/PageHero'
import { Committee } from '@/components/Committee'
import { toCommittee } from '@/lib/committee'
import { Timeline } from '@/components/sections/Timeline'
import { CtaBand } from '@/components/sections/CtaBand'
import { Faq } from '@/components/Faq'
import { Reveal } from '@/components/ui/motion'
import { getChapters, getPeople, mediaUrl } from '@/lib/data'
import { milestones } from '@/lib/milestones'

export const metadata: Metadata = {
  title: 'About',
  description: 'The IEEE Student Branch of the University of Peradeniya — Sri Lanka’s first, established 19 July 2001.',
}

export default async function AboutPage() {
  const chapters = await getChapters()
  const branch = chapters.find((c) => c.kind === 'branch')
  const people = branch ? await getPeople(branch.id) : []
  const cover = mediaUrl(branch?.cover, 'hero')

  return (
    <>
      <PageHero
        eyebrow="About the branch"
        title="Twenty-five years of engineers, building for tomorrow."
        text="The Institute of Electrical and Electronics Engineers Student Branch of the University of Peradeniya (IEEE SB UoP) was established on 19 July 2001 — the first IEEE student branch in Sri Lanka."
        image={cover}
      />

      <section className="bg-paper atmos py-24 md:py-32">
        <div className="container-x grid gap-16 lg:grid-cols-[1fr_1fr]">
          <Reveal className="flex flex-col gap-6">
            <span className="eyebrow text-brand">Our story</span>
            <h2 className="font-display text-[clamp(2rem,4vw,3.4rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">
              One of the great, very active student branches in the IEEE community.
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="prose-ieee">
            <p>
              IEEE SB UoP was founded with the help of IEEE senior members and dedicated student members, and exists first
              and foremost for the benefit of students with IEEE.
            </p>
            <p>
              Over the years the branch has organised events across telecommunication, robotics, electronics and power &amp;
              energy — building social and professional skills along the way. Workshops have been conducted with
              organisations such as the Ceylon Electricity Board, Dialog and Huawei, and field trips to the Hambantota wind
              power plant, the Laxapana hydro power complex, Norochcholai coal power plant, Heladanavi diesel power plant,
              Galle SVC and an MDF board manufacturer remain treasured memories.
            </p>
            <p>
              In 2010 the committee headed by Mr. B.L.D.S. Balasooriya launched the branch’s first website — guided by
              Prof. Lilantha Samaranayake (Chair, IEEE Sri Lanka Section, 2010) and student counsellor Dr. A. Atputharaja —
              and it won the IEEE Region 10 website contest that year.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="overflow-hidden bg-mist atmos py-24 md:py-32">
        <div className="container-x grid items-center gap-14 lg:grid-cols-[1.1fr_1fr]">
          <Reveal className="relative grid aspect-[5/4] place-items-center overflow-hidden rounded-[2rem] bg-[radial-gradient(ellipse_at_center,#7a1f1f,#2a0808_70%)]">
            <div className="grid-lines absolute inset-0 opacity-30" />
            <Image src="/brand/uop-crest.png" alt="University of Peradeniya crest" width={340} height={340} className="relative w-[58%] max-w-[340px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <span className="font-mono text-xs tracking-widest text-white/80">UNIVERSITY OF PERADENIYA · EST. 1942</span>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="flex flex-col gap-6">
            <span className="eyebrow text-brand">Our home</span>
            <h2 className="font-display text-[clamp(2rem,4vw,3.4rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">
              One of the world’s most beautiful campuses.
            </h2>
            <div className="prose-ieee">
              <p>
                The University of Ceylon was established in Colombo on 1 July 1942 and moved to the banks of the Mahaweli
                river, renamed the University of Peradeniya in 1978. Its first Vice-Chancellor, Sir Ivor Jennings, envisioned
                graduates who were well educated and rich in soft skills and wisdom through different experiences.
              </p>
              <p>
                Within the Faculty of Engineering, the Department of Electrical &amp; Electronic Engineering is home to many
                clubs and societies that motivate innovation and creativity — and the IEEE Student Branch is a proud example.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <Timeline items={milestones} />

      <section id="team" className="scroll-mt-24 bg-paper atmos py-24 md:py-32">
        <div className="container-x">
          <Committee people={toCommittee(people)} title="Executive committee" term={people.find((p) => p.term)?.term} chapterName="the Student Branch" />
        </div>
      </section>

      <section className="bg-mist atmos py-24 md:py-32">
        <div className="container-x grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal className="flex flex-col gap-4">
            <span className="eyebrow text-brand">FAQ</span>
            <h2 className="font-display text-[clamp(2rem,4vw,3.4rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">Good questions.</h2>
          </Reveal>
          <Faq
            items={[
              {
                q: 'Who can volunteer with IEEE?',
                a: 'Any undergraduate of the Faculty of Engineering can volunteer — you don’t need prior experience. Committees are elected each year, and volunteer calls for organising committees, design, editorial and programming teams open throughout the term.',
              },
              {
                q: 'Do I need to be an IEEE member?',
                a: 'You can attend most events without membership. IEEE student membership unlocks competitions like IEEEXtreme, society chapters, IEEE Xplore access and a global network — and the branch regularly runs membership sponsorship programmes.',
              },
              {
                q: 'How wide is the IEEE network?',
                a: 'IEEE is the world’s largest technical professional organisation — hundreds of thousands of members in over 190 countries. Through Region 10 (Asia-Pacific) and the IEEE Sri Lanka Section, our students connect with professionals, conferences and opportunities worldwide.',
              },
              {
                q: 'How do I find out about events?',
                a: 'Every event is published on IEEE vTools and appears on this site automatically. Subscribe to the branch calendar on the Events page, or follow us on social media.',
              },
            ]}
          />
        </div>
      </section>

      <CtaBand />
    </>
  )
}
