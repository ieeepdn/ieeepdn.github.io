/** Shown only to signed-in webmasters while draft preview is on. */
export function PreviewBar({ status, path }: { status?: string | null; path: string }) {
  return (
    <div role="status" className="fixed inset-x-0 bottom-4 z-[70] mx-auto flex w-fit max-w-[calc(100%-2rem)] items-center gap-4 rounded-full bg-signal px-5 py-3 text-sm font-semibold text-night shadow-2xl">
      <span>Preview{status === 'draft' ? ' · unpublished changes' : ''} — only signed-in webmasters see this</span>
      <a href={`/next/exit-preview?path=${encodeURIComponent(path)}`} className="rounded-full bg-night px-3 py-1.5 text-white hover:bg-night-2">
        Exit preview
      </a>
    </div>
  )
}
