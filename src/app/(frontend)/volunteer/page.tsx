import type { Metadata } from 'next'
import { ArrowUpRight, Brush, Code2, Megaphone, PenLine, Users, Wrench } from 'lucide-react'
import { PageHero } from '@/components/PageHero'
import { Faq } from '@/components/Faq'
import { Reveal } from '@/components/ui/motion'
import { getSettings } from '@/lib/data'

export const metadata: Metadata = { title: 'Volunteer', description: 'Join the organising committees and teams of the IEEE Student Branch, University of Peradeniya.' }

const teams = [
  { icon: Users, title: 'Organising committees', body: 'Run flagship programmes like Pera Xtreme, Predicta and MentorSpark from idea to closing ceremony.' },
  { icon: Code2, title: 'Programming', body: 'Build the branch’s tools and this very website — Next.js, Payload CMS and the vTools API.' },
  { icon: Brush, title: 'Design', body: 'Posters, social media, event branding and motion — the visual voice of the branch.' },
  { icon: PenLine, title: 'Editorial', body: 'Write recaps, interviews and announcements that go out on the site and social channels.' },
  { icon: Megaphone, title: 'External relations', body: 'Work with industry partners, sponsors and other IEEE units across Sri Lanka and Region 10.' },
  { icon: Wrench, title: 'Chapter teams', body: 'Join a society chapter or WIE and help run technical workshops, talks and field visits.' },
]

export default async function VolunteerPage() {
  const settings = await getSettings()
  const form = settings.volunteerForm
  return (
    <>
      <PageHero
        eyebrow="Volunteer"
        title="Your first IEEE role starts here."
        text="We are a volunteering entity of young, enthusiastic undergraduates. Volunteer calls open every term — pick a team, learn by doing and grow into leadership."
      >
        {form && (
          <a href={form} target="_blank" rel="noreferrer" className="mt-4 inline-flex h-14 w-fit items-center gap-2 rounded-full bg-white px-6 font-semibold text-night hover:bg-cyan">
            Apply to volunteer <ArrowUpRight className="size-4" aria-hidden />
          </a>
        )}
      </PageHero>
      <section className="bg-paper atmos py-24 md:py-32">
        <div className="container-x">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((t, i) => (
              <Reveal key={t.title} delay={(i % 3) * 0.06} className="group flex flex-col gap-4 rounded-[1.6rem] border border-line bg-surface p-8 transition hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(3,10,19,0.3)]">
                <span className="grid size-14 place-items-center rounded-2xl bg-brand/10 text-brand transition group-hover:bg-ieee group-hover:text-white">
                  <t.icon className="size-6" aria-hidden />
                </span>
                <h2 className="font-display text-2xl font-bold">{t.title}</h2>
                <p className="leading-relaxed text-ink-3">{t.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-mist atmos py-24 md:py-32">
        <div className="container-x grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal className="flex flex-col gap-4">
            <span className="eyebrow text-brand">How it works</span>
            <h2 className="font-display text-[clamp(2rem,4vw,3.4rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">From first meeting to first event.</h2>
          </Reveal>
          <Faq
            items={[
              { q: 'Do I need experience?', a: 'No. Most volunteers start with zero experience. You’ll learn from senior members, and every committee has team leads who mentor new volunteers.' },
              { q: 'How much time does it take?', a: 'It depends on the role — usually a few hours a week, with more during the build-up to a big event. Tell the team your availability and they’ll plan around exams.' },
              { q: 'How are committees chosen?', a: 'The branch and each chapter elect a new executive committee every year at their AGM. Team members are selected through volunteer calls announced on this site and our social channels.' },
              { q: 'Can first-years join?', a: 'Absolutely. WIE Unveil, MentorSpark and chapter introduction sessions are designed for new batches — it’s the best time to start.' },
            ]}
          />
        </div>
      </section>
    </>
  )
}
