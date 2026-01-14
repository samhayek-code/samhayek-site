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
  // Both scale down together on hover
  const defaultSize = 15 // ~10% bigger than 14
  const hoverSize = 9    // ~10% smaller than 10
  const dotRatio = 0.4 // Center dot is 40% of outer circle

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed z-[9999]"
      style={{
        left: -100,
        top: -100,
        transform: 'translate(-50%, -50%)',
        opacity: isVisible && !isOverIframe ? 1 : 0,
        transition: 'opacity 150ms ease-out',
      }}
    >
      {/* Cursor container - scales as a group */}
      <div
        className="relative transition-all duration-150 ease-out"
        style={{
          width: isPointer ? `${hoverSize}px` : `${defaultSize}px`,
          height: isPointer ? `${hoverSize}px` : `${defaultSize}px`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Outer filled circle */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: 'var(--cursor-ring)' }}
        />
        {/* Center dot - on top */}
        <div
          className="absolute rounded-full"
          style={{
            width: `${dotRatio * 100}%`,
            height: `${dotRatio * 100}%`,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'var(--cursor-fill)',
          }}
        />
      </div>
    </div>
  )
}
