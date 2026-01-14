'use client'

import { useEffect, useState, useCallback } from 'react'

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 })
  const [isPointer, setIsPointer] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const updateCursor = useCallback((e: MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY })

    // Check if hovering over interactive element
    const target = e.target as HTMLElement
    const interactive = target.closest(
      'a, button, [role="button"], input, select, textarea, label, ' +
      '.card-hover, .cursor-pointer, [onclick], summary, .lemonsqueezy-button'
    )
    setIsPointer(!!interactive)
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

  return (
    <div
      className="pointer-events-none fixed z-[9999] transition-transform duration-150 ease-out"
      style={{
        left: position.x,
        top: position.y,
        transform: `translate(-50%, -50%) scale(${isPointer ? 0.7 : 1})`,
        opacity: isVisible ? 1 : 0,
      }}
    >
      {/* Outer ring */}
      <div
        className="absolute inset-0 rounded-full border transition-all duration-150 ease-out"
        style={{
          width: isPointer ? '6px' : '12px',
          height: isPointer ? '6px' : '12px',
          borderColor: 'var(--cursor-color)',
          borderWidth: isPointer ? '1px' : '2.5px',
          transform: 'translate(-50%, -50%)',
        }}
      />
      {/* Center dot - only visible on pointer state */}
      <div
        className="absolute rounded-full transition-all duration-150 ease-out"
        style={{
          width: '3px',
          height: '3px',
          backgroundColor: 'var(--cursor-color)',
          transform: 'translate(-50%, -50%)',
          opacity: isPointer ? 1 : 0,
          scale: isPointer ? 1 : 0,
        }}
      />
    </div>
  )
}
