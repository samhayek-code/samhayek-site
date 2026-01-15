'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const [isPointer, setIsPointer] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isOverIframe, setIsOverIframe] = useState(false)

  const updateCursor = useCallback((e: MouseEvent) => {
    // Update position directly via ref (no re-render needed)
    if (cursorRef.current) {
      cursorRef.current.style.left = `${e.clientX}px`
      cursorRef.current.style.top = `${e.clientY}px`
    }

    const target = e.target as HTMLElement

    // Check if hovering over iframe - hide custom cursor so native one takes over cleanly
    const iframe = target.closest('iframe')
    setIsOverIframe(!!iframe)

    // Check if hovering over interactive element
    const interactive = target.closest(
      'a, button, [role="button"], input, select, textarea, label, ' +
      '.card-hover, .cursor-pointer, [onclick], summary, .lemonsqueezy-button'
    )
    setIsPointer(!!interactive && !iframe)
  }, [])

  useEffect(() => {
    // Small delay to prevent flash on initial load
    const showTimer = setTimeout(() => setIsVisible(true), 100)

    const handleMouseMove = (e: MouseEvent) => updateCursor(e)
    const handleMouseEnter = () => setIsVisible(true)
    const handleMouseLeave = () => setIsVisible(false)

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseenter', handleMouseEnter)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      clearTimeout(showTimer)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseenter', handleMouseEnter)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [updateCursor])

  // Don't render on touch devices
  if (typeof window !== 'undefined' && 'ontouchstart' in window) {
    return null
  }

  // Sizes: filled outer circle with contrasting center dot (bullseye)
  const defaultSize = 15
  const hoverSize = 9
  const size = isPointer ? hoverSize : defaultSize
  const dotSize = Math.round(size * 0.4)

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed z-[9999]"
      style={{
        left: -100,
        top: -100,
        opacity: isVisible && !isOverIframe ? 1 : 0,
        transition: 'opacity 150ms ease-out',
      }}
    >
      {/* Outer filled circle - centered on cursor position */}
      <div
        className="absolute rounded-full transition-all duration-150 ease-out"
        style={{
          width: size,
          height: size,
          top: -size / 2,
          left: -size / 2,
          backgroundColor: 'var(--cursor-ring)',
        }}
      />
      {/* Center dot - centered on cursor position */}
      <div
        className="absolute rounded-full transition-all duration-150 ease-out"
        style={{
          width: dotSize,
          height: dotSize,
          top: -dotSize / 2,
          left: -dotSize / 2,
          backgroundColor: 'var(--cursor-fill)',
        }}
      />
    </div>
  )
}
