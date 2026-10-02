import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageHero } from '@/components/PageHero'
import { FormView } from '@/components/blocks/FormView'
import { toFormDefinition } from '@/lib/forms'
import { formState } from '@/lib/forms'
import { asChapter, getAllForms, getForm } from '@/lib/data'


export const dynamicParams = false

export async function generateStaticParams() {
  const forms = (await getAllForms()).map((f) => ({ slug: String(f.slug || f.id) }))
  // static export needs at least one page per route; this one is a 404
  return forms.length ? forms : [{ slug: '_' }]
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const form = await getForm((await params).slug)
  return form ? { title: form.title, description: form.intro ?? undefined, robots: { index: false } } : {}
}

/** A form's own shareable page: /forms/<address> */
export default async function FormPage({ params }: { params: Promise<{ slug: string }> }) {
  const form = await getForm((await params).slug)
  if (!form) notFound()
  const chapter = asChapter(form.chapter)
  const accent = chapter?.accent || '#00629B'
  const state = formState(form)
  return (
    <>
      <PageHero eyebrow={chapter ? chapter.name : 'IEEE Student Branch'} title={form.title} text={form.intro} accent={accent} compact />
      <section className="bg-paper atmos py-16 md:py-24">
        <div className="container-x max-w-3xl">
          <FormView form={toFormDefinition(form)} state={state} accent={accent} />
        </div>
      </section>
    </>
  )
}
