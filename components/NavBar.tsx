'use client'

import { useState } from 'react'
import { filterCategories, typeColors } from '@/lib/types'

interface NavBarProps {
  activeFilter: string
  setActiveFilter: (filter: string) => void
  isScrolled: boolean
  soundEnabled: boolean
  onToggleSound: () => void
  onHoverSound: () => void
  leftKeyPressed: boolean
  rightKeyPressed: boolean
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}

export default function NavBar({
  activeFilter,
  setActiveFilter,
  isScrolled,
  soundEnabled,
  onToggleSound,
  onHoverSound,
  leftKeyPressed,
  rightKeyPressed,
  theme,
  onToggleTheme,
}: NavBarProps) {
  const [hoveredFilter, setHoveredFilter] = useState<string | null>(null)

  return (
    <div
      className="sticky top-0 z-50 px-4 lg:px-12 py-4 lg:py-5 transition-all duration-300"
      style={{
        background: isScrolled
          ? theme === 'dark'
            ? 'rgba(10, 10, 10, 0.95)'
            : 'rgba(245, 245, 245, 0.95)'
          : 'transparent',
        backdropFilter: isScrolled ? 'blur(20px)' : 'none',
        borderBottom: isScrolled
          ? theme === 'dark'
            ? '1px solid #151515'
            : '1px solid #e0e0e0'
          : '1px solid transparent',
      }}
    >
      {/* Desktop layout (1024px+) */}
      <div className="hidden lg:flex max-w-[1600px] mx-auto items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => setActiveFilter('Everything')}
          onMouseEnter={onHoverSound}
          className="font-sans text-sm font-normal text-foreground tracking-widest uppercase hover:opacity-80 transition-opacity"
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
                className="flex items-center gap-1.5 px-3 py-2 rounded font-mono font-bold text-[11px] uppercase tracking-wide transition-all duration-200"
                style={{
                  background: isActive
                    ? 'var(--nav-active-bg)'
                    : isHovered
                    ? 'var(--nav-hover-bg)'
                    : 'transparent',
                  color: isActive ? 'var(--foreground)' : isHovered ? 'var(--muted)' : 'var(--subtle)',
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

        {/* Right side: Navigate + Sound toggle */}
        <div className="flex items-center gap-4">
          {/* Navigate arrows */}
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-[10px] text-[#444] uppercase tracking-wide">
              Navigate
            </span>
            <div className="flex gap-1">
              <div
                className="w-8 h-8 rounded border flex items-center justify-center transition-all duration-150"
                style={{
                  background: leftKeyPressed ? 'var(--arrow-flash-bg)' : 'transparent',
                  borderColor: leftKeyPressed ? 'var(--arrow-flash-border)' : 'var(--border)',
                  color: leftKeyPressed ? 'var(--arrow-flash-text)' : 'var(--subtle)',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </div>
              <div
                className="w-8 h-8 rounded border flex items-center justify-center transition-all duration-150"
                style={{
                  background: rightKeyPressed ? 'var(--arrow-flash-bg)' : 'transparent',
                  borderColor: rightKeyPressed ? 'var(--arrow-flash-border)' : 'var(--border)',
                  color: rightKeyPressed ? 'var(--arrow-flash-text)' : 'var(--subtle)',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </div>
          </div>

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

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            onMouseEnter={onHoverSound}
            className="w-8 h-8 rounded border border-[#333] flex items-center justify-center text-[#444] hover:text-foreground hover:border-[#555] transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile/Tablet layout (below 1024px) */}
      <div className="lg:hidden flex flex-col gap-4">
        {/* Logo - centered on its own line */}
        <button
          onClick={() => setActiveFilter('Everything')}
          onMouseEnter={onHoverSound}
          className="font-sans text-sm font-normal text-foreground tracking-widest uppercase text-center whitespace-nowrap"
        >
          Sam Hayek
        </button>

        {/* Filter buttons - 3x3 grid */}
        <div className="grid grid-cols-3 gap-2">
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
                className="flex items-center justify-center gap-1.5 px-2 py-3 rounded font-mono font-bold text-[10px] uppercase tracking-wide transition-all duration-200"
                style={{
                  background: isActive
                    ? 'var(--nav-active-bg)'
                    : isHovered
                    ? 'var(--nav-hover-bg)'
                    : 'transparent',
                  color: isActive ? 'var(--foreground)' : isHovered ? 'var(--muted)' : 'var(--subtle)',
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
      </div>
    </div>
  )
}
