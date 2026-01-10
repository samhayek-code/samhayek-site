'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ArchiveItem, filterCategories } from '@/lib/types'
import NavBar from '@/components/NavBar'
import PageHeader from '@/components/PageHeader'
import ArchiveGrid from '@/components/ArchiveGrid'
import Modal from '@/components/Modal'

// Soft click sound using Web Audio API
function playClickSound(audioContext: AudioContext | null) {
  if (!audioContext) return

  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  // Softer, more muted click
  oscillator.frequency.value = 800
  oscillator.type = 'sine'

  gainNode.gain.setValueAtTime(0.015, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.03)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.03)
}

interface HomeClientProps {
  items: ArchiveItem[]
}

export default function HomeClient({ items }: HomeClientProps) {
  const [activeFilter, setActiveFilter] = useState('Everything')
  const [isScrolled, setIsScrolled] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ArchiveItem | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [leftKeyPressed, setLeftKeyPressed] = useState(false)
  const [rightKeyPressed, setRightKeyPressed] = useState(false)

  const audioContextRef = useRef<AudioContext | null>(null)

  // Initialize audio context on first interaction
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      window.removeEventListener('click', initAudio)
      window.removeEventListener('keydown', initAudio)
    }

    window.addEventListener('click', initAudio)
    window.addEventListener('keydown', initAudio)

    return () => {
      window.removeEventListener('click', initAudio)
      window.removeEventListener('keydown', initAudio)
    }
  }, [])

  // Load sound preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('soundEnabled')
    if (saved !== null) {
      setSoundEnabled(JSON.parse(saved))
    }
  }, [])

  // Save sound preference
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const newValue = !prev
      localStorage.setItem('soundEnabled', JSON.stringify(newValue))
      // Play a click when enabling sound
      if (newValue && audioContextRef.current) {
        playClickSound(audioContextRef.current)
      }
      return newValue
    })
  }, [])

  // Play hover sound
  const playHoverSound = useCallback(() => {
    if (soundEnabled && audioContextRef.current) {
      playClickSound(audioContextRef.current)
    }
  }, [soundEnabled])

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  // Filter items
  const filteredItems = activeFilter === 'Everything'
    ? items
    : items.filter(item => item.type === activeFilter)

  // Keyboard navigation for filter categories
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't navigate when modal is open
      if (selectedItem) return

      const currentIndex = filterCategories.indexOf(activeFilter)

      if (e.key === 'ArrowLeft') {
        setLeftKeyPressed(true)
        setTimeout(() => setLeftKeyPressed(false), 150)
        const newIndex = currentIndex <= 0 ? filterCategories.length - 1 : currentIndex - 1
        setActiveFilter(filterCategories[newIndex])
        if (soundEnabled && audioContextRef.current) {
          playClickSound(audioContextRef.current)
        }
      } else if (e.key === 'ArrowRight') {
        setRightKeyPressed(true)
        setTimeout(() => setRightKeyPressed(false), 150)
        const newIndex = currentIndex >= filterCategories.length - 1 ? 0 : currentIndex + 1
        setActiveFilter(filterCategories[newIndex])
        if (soundEnabled && audioContextRef.current) {
          playClickSound(audioContextRef.current)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeFilter, selectedItem, soundEnabled])
  
  return (
    <main className="min-h-screen bg-background text-foreground">
      <PageHeader filter={activeFilter} />

      <NavBar
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        isScrolled={isScrolled}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onHoverSound={playHoverSound}
      />

      <ArchiveGrid
        items={filteredItems}
        onCardClick={setSelectedItem}
        onHoverSound={playHoverSound}
      />

      {/* Modal */}
      {selectedItem && (
        <Modal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}

      {/* Footer */}
      <footer className="px-12 py-12 border-t border-border">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          {/* Keyboard navigation indicator - bottom left */}
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-[#444] uppercase tracking-wide">
              Navigate
            </span>
            <div className="flex gap-1">
              {/* Left arrow key */}
              <div
                className={`w-7 h-7 rounded border flex items-center justify-center transition-all duration-150 ${
                  leftKeyPressed
                    ? 'bg-white border-white text-black'
                    : 'bg-transparent border-[#333] text-[#444]'
                }`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </div>
              {/* Right arrow key */}
              <div
                className={`w-7 h-7 rounded border flex items-center justify-center transition-all duration-150 ${
                  rightKeyPressed
                    ? 'bg-white border-white text-black'
                    : 'bg-transparent border-[#333] text-[#444]'
                }`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Social icons - center */}
          <div className="flex items-center gap-5">
            <a
              href="https://x.com/samhayek_"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#444] hover:text-foreground transition-colors"
              aria-label="X (Twitter)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a
              href="https://instagram.com/samhayek_"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#444] hover:text-foreground transition-colors"
              aria-label="Instagram"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a
              href="https://youtube.com/@samhayek_"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#444] hover:text-foreground transition-colors"
              aria-label="YouTube"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>

          {/* Copyright - bottom right */}
          <span className="font-mono text-[10px] text-[#333] tracking-wide">
            © 2025 Sam Hayek
          </span>
        </div>
      </footer>
    </main>
  )
}
