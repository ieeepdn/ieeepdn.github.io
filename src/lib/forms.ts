import type { Form } from '@/payload-types'

export type FormQuestion = {
  type: string
  name: string
  label: string
  help?: string | null
  required?: boolean
  half?: boolean
  placeholder?: string | null
  options?: string[]
  min?: number | null
  max?: number | null
}
export type FormDefinition = {
  id: number | string
  title: string
  intro?: string | null
  submitLabel: string
  questions: FormQuestion[]
  /** Formspree (or any form service that accepts JSON) — responses go to the chapter's inbox / dashboard */
  endpoint: string | null
  /** …or simply hand visitors over to a Google Form */
  externalUrl: string | null
  confirmationTitle: string | null
  confirmationMessage: string | null
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40) || 'field'

/** Open / not yet open / closed — decided when the site is built (it rebuilds every few hours). */
export function formState(form: Pick<Form, 'status' | 'opensAt' | 'closesAt'>) {
  const now = Date.now()
  if (form.status === 'closed') return { open: false, reason: 'This form is closed.' }
  if (form.opensAt && new Date(form.opensAt).getTime() > now)
    return { open: false, reason: `This form opens on ${new Date(form.opensAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Colombo' })}.` }
  if (form.closesAt && new Date(form.closesAt).getTime() < now) return { open: false, reason: 'This form has closed.' }
  return { open: true, reason: null }
}

/** Only what the browser needs — never the whole form document. */
export function toFormDefinition(form: Form): FormDefinition {
  const used = new Set<string>()
  const f2 = form as Form & { endpoint?: string | null; externalUrl?: string | null }
  return {
    id: form.id,
    endpoint: f2.endpoint || null,
    externalUrl: f2.externalUrl || null,
    confirmationTitle: form.confirmationTitle ?? null,
    confirmationMessage: form.confirmationMessage ?? null,
    title: form.title,
    intro: form.intro,
    submitLabel: form.submitLabel || 'Submit',
    questions: (form.fields ?? []).map((f) => {
      const q = f as Record<string, unknown>
      return {
        type: f.blockType,
        name: (() => {
          let n = String(q.name || slug(String(f.label ?? '')))
          while (used.has(n)) n += '_2'
          used.add(n)
          return n
        })(),
        label: f.label,
        help: (q.help as string) ?? null,
        required: Boolean(q.required),
        half: q.width === 'half',
        placeholder: (q.placeholder as string) ?? null,
        options: Array.isArray(q.options) ? (q.options as { label: string }[]).map((o) => o.label) : undefined,
        min: (q.min as number) ?? null,
        max: (q.max as number) ?? null,
      }
    }),
  }
}

