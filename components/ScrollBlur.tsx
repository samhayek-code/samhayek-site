'use client'

import { useEffect, useState } from 'react'

// Progressive (gradual) blur band fixed to the bottom of the viewport.
// Each layer blurs a little more and is masked to sit lower, so the bottom
// edge reads as the most blurred and it ramps smoothly to sharp going up.
const LAYERS = [
  { blur: 1, mask: 'linear-gradient(to top, #000 0%, #000 80%, transparent 100%)' },
  { blur: 2, mask: 'linear-gradient(to top, #000 0%, #000 60%, transparent 90%)' },
  { blur: 4, mask: 'linear-gradient(to top, #000 0%, #000 40%, transparent 70%)' },
  { blur: 8, mask: 'linear-gradient(to top, #000 0%, #000 20%, transparent 50%)' },
  { blur: 12, mask: 'linear-gradient(to top, #000 0%, transparent 30%)' },
]

export default function ScrollBlur() {
  // Only show when the page actually overflows AND we're not at the bottom,
  // so it never permanently blurs the footer / last row.
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    const update = () => {
      const scrollable = root.scrollHeight > window.innerHeight + 8
      const atBottom =
        window.innerHeight + window.scrollY >= root.scrollHeight - 24
      setVisible(scrollable && !atBottom)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    // Recompute when content height changes (e.g. switching filter categories)
    const ro = new ResizeObserver(update)
    ro.observe(document.body)

    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      ro.disconnect()
    }
  }, [])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-28"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 300ms ease' }}
    >
      {LAYERS.map((layer, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{
            backdropFilter: `blur(${layer.blur}px)`,
            WebkitBackdropFilter: `blur(${layer.blur}px)`,
            maskImage: layer.mask,
            WebkitMaskImage: layer.mask,
          }}
        />
      ))}
    </div>
  )
}
