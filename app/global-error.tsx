'use client'

// Catches errors thrown in the root layout itself. It replaces <html>/<body>,
// so it can't rely on globals.css — uses inline styles matching the dark theme.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#111113',
          color: '#E8E8E9',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center', padding: 24 }}>
          <p style={{ fontSize: 18, marginBottom: 16 }}>Something went wrong.</p>
          <button
            onClick={() => reset()}
            style={{
              padding: '12px 20px',
              borderRadius: 12,
              border: '1px solid #2A2A2F',
              background: 'transparent',
              color: '#8A8A8F',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
