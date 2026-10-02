'use client'
import { Suspense, type ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'

/**
 * Static-site stand-in for a server page that read ?param=… : every variant is pre-rendered at build time
 * and the browser shows the one the address asks for (e.g. /news?chapter=cs).
 */
function Switch({ views, param, fallback }: { views: Record<string, ReactNode>; param: string; fallback: string }) {
  const key = useSearchParams().get(param) ?? fallback
  return <>{views[key] ?? views[fallback]}</>
}

export function QueryViews({ views, param, fallback }: { views: Record<string, ReactNode>; param: string; fallback: string }) {
  return (
    <Suspense fallback={views[fallback]}>
      <Switch views={views} param={param} fallback={fallback} />
    </Suspense>
  )
}
