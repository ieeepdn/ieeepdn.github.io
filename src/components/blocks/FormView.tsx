'use client'
import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import clsx from 'clsx'

import type { FormDefinition } from '@/lib/forms'

const input =
  'h-12 w-full rounded-xl border border-line bg-surface px-4 text-[15px] text-ink outline-none transition placeholder:text-ink-3 focus:border-brand focus:ring-2 focus:ring-brand/25 aria-[invalid=true]:border-red-500'

export function FormView({ form, state, accent }: { form: FormDefinition; state: { open: boolean; reason: string | null }; accent: string }) {
  const [values, setValues] = useState<Record<string, unknown>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState<{ title?: string; text?: string }>({})
  const set = (name: string, v: unknown) => setValues((s) => ({ ...s, [name]: v }))

  if (!state.open) {
    return <div className="rounded-[1.5rem] border border-dashed border-ink/20 bg-surface p-8 text-ink-2">{state.reason}</div>
  }
  if (status === 'done') {
    return (
      <div role="status" className="flex flex-col items-start gap-3 rounded-[1.5rem] border border-line bg-surface p-8">
        <CheckCircle2 className="size-8" style={{ color: accent }} aria-hidden />
        <h3 className="font-display text-2xl font-bold">{message.title || 'Thank you!'}</h3>
        {message.text && <p className="whitespace-pre-line text-ink-2">{message.text}</p>}
      </div>
    )
  }

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const website = (new FormData(e.currentTarget).get('website') as string) || ''
    if (website) return setStatus('done') // honeypot: quietly ignore bots
    // validate in the browser — there is no server of our own on GitHub Pages
    const errs: Record<string, string> = {}
    for (const q of form.questions) {
      if (q.type === 'section') continue
      const v = values[q.name]
      const empty = v == null || v === '' || (Array.isArray(v) && v.length === 0)
      if (q.required && empty) errs[q.name] = 'This question is required.'
      else if (!empty && q.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v))) errs[q.name] = 'Enter a valid email address.'
    }
    if (Object.keys(errs).length) {
      setErrors(errs)
      setMessage({ text: 'Please check the highlighted answers.' })
      setStatus('error')
      return
    }
    if (!form.endpoint) {
      setMessage({ text: 'This form is not connected to an inbox yet — please contact the organisers.' })
      setStatus('error')
      return
    }
    setStatus('sending')
    setErrors({})
    try {
      const payload: Record<string, unknown> = { _form: form.title }
      for (const q of form.questions) if (q.type !== 'section') payload[q.label || q.name] = Array.isArray(values[q.name]) ? (values[q.name] as unknown[]).join(', ') : (values[q.name] ?? '')
      const email = form.questions.find((q) => q.type === 'email')
      if (email && values[email.name]) payload._replyto = values[email.name]
      const res = await fetch(form.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setMessage({ title: form.confirmationTitle ?? undefined, text: form.confirmationMessage ?? 'Your response has been recorded.' })
        setStatus('done')
      } else {
        const json = await res.json().catch(() => ({}))
        setMessage({ text: json.error || json.errors?.[0]?.message || 'Something went wrong. Please try again.' })
        setStatus('error')
      }
    } catch {
      setMessage({ text: 'You seem to be offline. Please try again.' })
      setStatus('error')
    }
  }

  if (form.externalUrl && !form.endpoint) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-[1.5rem] border border-line bg-surface p-8">
        <p className="text-ink-2">This form is hosted on Google Forms.</p>
        <a href={form.externalUrl} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex h-12 items-center rounded-full px-6 font-semibold text-white" style={{ background: accent }}>
          Open the form
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="grid grid-cols-2 gap-x-4 gap-y-5 rounded-[1.75rem] border border-line bg-surface p-6 shadow-[var(--card-shadow)] md:p-8">
      {/* honeypot: hidden from people, irresistible to bots */}
      <label className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden>
        Website <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      {form.questions.map((q, i) => {
        const id = `f${form.id}-${q.name || i}`
        const err = errors[q.name]
        const wrap = clsx('flex flex-col gap-2', q.half ? 'col-span-2 sm:col-span-1' : 'col-span-2')
        const labelEl = (
          <label htmlFor={id} className="text-sm font-semibold text-ink">
            {q.label}
            {q.required && <span className="ml-0.5 text-red-500" aria-hidden>*</span>}
          </label>
        )
        const help = q.help && q.type !== 'section' ? <span className="text-[13px] text-ink-3">{q.help}</span> : null
        const errEl = err ? (
          <span id={`${id}-err`} className="text-[13px] font-medium text-red-500">
            {err}
          </span>
        ) : null
        const common = { id, name: q.name, 'aria-invalid': Boolean(err) || undefined, 'aria-describedby': err ? `${id}-err` : undefined, required: q.required }
        switch (q.type) {
          case 'section':
            return (
              <div key={i} className="col-span-2 mt-3 flex flex-col gap-1 border-t border-line pt-5 first:mt-0 first:border-0 first:pt-0">
                <h3 className="font-display text-xl font-bold">{q.label}</h3>
                {q.help && <p className="text-[14px] text-ink-3">{q.help}</p>}
              </div>
            )
          case 'longText':
            return (
              <div key={i} className={wrap}>
                {labelEl}
                <textarea {...common} rows={5} placeholder={q.placeholder ?? undefined} className={clsx(input, 'h-auto py-3')} onChange={(e) => set(q.name, e.target.value)} />
                {help}
                {errEl}
              </div>
            )
          case 'select':
            return (
              <div key={i} className={wrap}>
                {labelEl}
                <select {...common} className={input} defaultValue="" onChange={(e) => set(q.name, e.target.value)}>
                  <option value="" disabled>
                    Choose…
                  </option>
                  {q.options?.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
                {help}
                {errEl}
              </div>
            )
          case 'radio':
          case 'checkboxes':
            return (
              <fieldset key={i} className={wrap} aria-invalid={Boolean(err) || undefined}>
                <legend className="mb-2 text-sm font-semibold text-ink">
                  {q.label}
                  {q.required && <span className="ml-0.5 text-red-500" aria-hidden>*</span>}
                </legend>
                <div className="flex flex-col gap-2">
                  {q.options?.map((o) => {
                    const multi = q.type === 'checkboxes'
                    const cur = values[q.name]
                    const checked = multi ? Array.isArray(cur) && cur.includes(o) : cur === o
                    return (
                      <label key={o} className={clsx('flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-[15px] transition', checked ? 'border-brand bg-brand/5' : 'border-line hover:border-ink/30')}>
                        <input
                          type={multi ? 'checkbox' : 'radio'}
                          name={q.name}
                          checked={checked}
                          onChange={() => {
                            if (!multi) return set(q.name, o)
                            const list = Array.isArray(cur) ? (cur as string[]) : []
                            set(q.name, checked ? list.filter((x) => x !== o) : [...list, o])
                          }}
                          className="size-4 accent-[var(--color-brand)]"
                        />
                        {o}
                      </label>
                    )
                  })}
                </div>
                {help}
                {errEl}
              </fieldset>
            )
          case 'consent':
            return (
              <div key={i} className="col-span-2 flex flex-col gap-2">
                <label className="flex cursor-pointer items-start gap-3 text-[15px] text-ink-2">
                  <input type="checkbox" {...common} className="mt-1 size-4 accent-[var(--color-brand)]" onChange={(e) => set(q.name, e.target.checked)} />
                  <span>
                    {q.label}
                    {q.required && <span className="ml-0.5 text-red-500" aria-hidden>*</span>}
                  </span>
                </label>
                {help}
                {errEl}
              </div>
            )
          default: {
            const type = q.type === 'email' ? 'email' : q.type === 'phone' ? 'tel' : q.type === 'number' ? 'number' : q.type === 'date' ? 'date' : q.type === 'url' ? 'url' : 'text'
            return (
              <div key={i} className={wrap}>
                {labelEl}
                <input
                  {...common}
                  type={type}
                  min={q.min ?? undefined}
                  max={q.max ?? undefined}
                  placeholder={q.placeholder ?? (type === 'url' ? 'https://' : undefined)}
                  autoComplete={type === 'email' ? 'email' : type === 'tel' ? 'tel' : undefined}
                  className={input}
                  onChange={(e) => set(q.name, e.target.value)}
                />
                {help}
                {errEl}
              </div>
            )
          }
        }
      })}
      {status === 'error' && message.text && (
        <p role="alert" className="col-span-2 rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-300">
          {message.text}
        </p>
      )}
      <div className="col-span-2 pt-1">
        <button type="submit" disabled={status === 'sending'} className="inline-flex h-12 items-center gap-2 rounded-full px-7 font-semibold text-white transition hover:brightness-110 disabled:opacity-60" style={{ background: accent }}>
          {status === 'sending' && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {form.submitLabel}
        </button>
      </div>
    </form>
  )
}
