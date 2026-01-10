'use client'

import { useState } from 'react'
import { filterCategories, typeColors } from '@/lib/types'
import LiveClock from './LiveClock'

interface NavBarProps {
  activeFilter: string
  setActiveFilter: (filter: string) => void
  isScrolled: boolean
  soundEnabled: boolean
  onToggleSound: () => void
  onHoverSound: () => void
}

export default function NavBar({
  activeFilter,
  setActiveFilter,
  isScrolled,
  soundEnabled,
  onToggleSound,
  onHoverSound,
}: NavBarProps) {
  const [hoveredFilter, setHoveredFilter] = useState<string | null>(null)

  return (
    <div
      className="sticky top-0 z-50 px-4 sm:px-12 py-4 sm:py-5 transition-all duration-300"
      style={{
        background: isScrolled ? 'rgba(10, 10, 10, 0.95)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(20px)' : 'none',
        borderBottom: isScrolled ? '1px solid #151515' : '1px solid transparent',
      }}
    >
      {/* Desktop layout */}
      <div className="hidden sm:flex max-w-[1600px] mx-auto items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => setActiveFilter('Everything')}
          onMouseEnter={onHoverSound}
          className="font-sans text-sm font-medium text-foreground tracking-widest uppercase hover:opacity-80 transition-opacity"
        >
          Sam Hayek
        </button>

        {/* Filter buttons */}
        <div className="flex gap-1">
          {filterCategories.map((filter) => {
            const isActive = activeFilter === filter
            const isHovered = hoveredFilter === filter && !isActive
            const colors = typeColors[filter]

            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                onMouseEnter={() => {
                  setHoveredFilter(filter)
                  onHoverSound()
                }}
                onMouseLeave={() => setHoveredFilter(null)}
                className="flex items-center gap-1.5 px-3 py-2 rounded font-mono text-[11px] uppercase tracking-wide transition-all duration-200"
                style={{
                  background: isActive
                    ? 'rgba(255,255,255,0.1)'
                    : isHovered
                    ? 'rgba(255,255,255,0.04)'
                    : 'transparent',
                  color: isActive ? '#e5e5e5' : isHovered ? '#888' : '#555',
                }}
              >
                <div
                  className="w-[5px] h-[5px] rounded-full transition-all duration-200"
                  style={{
                    background: isActive ? colors.dot : isHovered ? colors.dot : 'transparent',
                    border: `1px solid ${isActive ? colors.dot : isHovered ? colors.dot : '#444'}`,
                    opacity: isActive ? 1 : isHovered ? 0.4 : 1,
                  }}
                />
                {filter}
              </button>
            )
          })}
        </div>

        {/* Right side: Clock + Sound toggle */}
        <div className="flex items-center gap-4">
          <LiveClock />

          {/* Sound toggle */}
          <button
            onClick={onToggleSound}
            onMouseEnter={onHoverSound}
            className="w-8 h-8 rounded border border-[#333] flex items-center justify-center text-[#444] hover:text-foreground hover:border-[#555] transition-colors"
            aria-label={soundEnabled ? 'Disable sound' : 'Enable sound'}
          >
            {soundEnabled ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="sm:hidden flex flex-col gap-4">
        {/* Logo - centered on its own line */}
        <button
          onClick={() => setActiveFilter('Everything')}
          className="font-sans text-sm font-medium text-foreground tracking-widest uppercase text-center whitespace-nowrap"
        >
          Sam Hayek
        </button>

        {/* Filter buttons - 3x3 grid */}
        <div className="grid grid-cols-3 gap-2">
          {filterCategories.map((filter) => {
            const isActive = activeFilter === filter
            const colors = typeColors[filter]

            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className="flex items-center justify-center gap-1.5 px-2 py-3 rounded font-mono text-[10px] uppercase tracking-wide transition-all duration-200"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: isActive ? '#e5e5e5' : '#555',
                }}
              >
                <div
                  className="w-[5px] h-[5px] rounded-full transition-all duration-200"
                  style={{
                    background: isActive ? colors.dot : 'transparent',
                    border: `1px solid ${isActive ? colors.dot : '#444'}`,
                  }}
                />
                {filter}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
