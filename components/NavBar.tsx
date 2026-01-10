'use client'

import { filterCategories, typeColors } from '@/lib/types'
import LiveClock from './LiveClock'

interface NavBarProps {
  activeFilter: string
  setActiveFilter: (filter: string) => void
  isScrolled: boolean
}

export default function NavBar({ activeFilter, setActiveFilter, isScrolled }: NavBarProps) {
  return (
    <div 
      className="sticky top-0 z-50 px-12 py-5 transition-all duration-300"
      style={{
        background: isScrolled ? 'rgba(10, 10, 10, 0.95)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(20px)' : 'none',
        borderBottom: isScrolled ? '1px solid #151515' : '1px solid transparent',
      }}
    >
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        {/* Logo */}
        <button 
          onClick={() => setActiveFilter('Everything')}
          className="font-sans text-sm font-medium text-foreground tracking-widest uppercase hover:opacity-80 transition-opacity"
        >
          Sam Hayek
        </button>
        
        {/* Filter buttons */}
        <div className="flex gap-1">
          {filterCategories.map((filter) => {
            const isActive = activeFilter === filter
            const colors = typeColors[filter]
            
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className="flex items-center gap-1.5 px-3 py-2 rounded font-mono text-[11px] uppercase tracking-wide transition-all duration-200"
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
        
        {/* Clock */}
        <LiveClock />
      </div>
    </div>
  )
}
