'use client'

import { useEffect } from 'react'

// Route-level error boundary. Renders inside the root layout (fonts + globals.css
// available), so a single bad item/embed/asset no longer white-screens the page.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">
      <div className="max-w-md text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-subtle mb-4">
          Something went wrong
        </p>
        <h1 className="font-sans text-2xl mb-6">This page hit an unexpected error.</h1>
        <button
          onClick={reset}
          className="px-5 py-3 rounded-btn border border-border text-muted hover:text-foreground hover:border-border-hover transition-colors"
        >
          Try again
        </button>
      </div>
    </main>
  )
}
