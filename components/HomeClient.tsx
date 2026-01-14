'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ArchiveItem, filterCategories } from '@/lib/types'
import NavBar from '@/components/NavBar'
import PageHeader from '@/components/PageHeader'
import ArchiveGrid from '@/components/ArchiveGrid'
import Modal from '@/components/Modal'
import LiveClock from '@/components/LiveClock'

// Soft, padded click sound using Web Audio API (E5 - E minor)
function playClickSound(audioContext: AudioContext | null) {
  if (!audioContext || audioContext.state !== 'running') return

  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  // E5 (659 Hz) - E minor root note
  oscillator.frequency.value = 659
  oscillator.type = 'sine'

  // Short attack, quick fade out
  const now = audioContext.currentTime
  gainNode.gain.setValueAtTime(0, now)
  gainNode.gain.linearRampToValueAtTime(0.011, now + 0.008) // 8ms attack
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.04) // 40ms total

  oscillator.start(now)
  oscillator.stop(now + 0.04)
}

interface HomeClientProps {
  items: ArchiveItem[]
}

export default function HomeClient({ items }: HomeClientProps) {
  const [activeFilter, setActiveFilter] = useState('Everything')
  const [isScrolled, setIsScrolled] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ArchiveItem | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true) // Sound on by default
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [leftKeyPressed, setLeftKeyPressed] = useState(false)
  const [rightKeyPressed, setRightKeyPressed] = useState(false)

  const audioContextRef = useRef<AudioContext | null>(null)

  // Initialize audio context immediately, resume on first interaction
  useEffect(() => {
    // Create AudioContext immediately (will be in suspended state)
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()

    const resumeAudio = () => {
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume()
      }
    }

    // Resume on any user interaction (including mouse movement)
    window.addEventListener('click', resumeAudio)
    window.addEventListener('keydown', resumeAudio)
    window.addEventListener('touchstart', resumeAudio)
    window.addEventListener('mousemove', resumeAudio, { once: true })

    return () => {
      window.removeEventListener('click', resumeAudio)
      window.removeEventListener('keydown', resumeAudio)
      window.removeEventListener('touchstart', resumeAudio)
      window.removeEventListener('mousemove', resumeAudio)
    }
  }, [])

  // Load sound preference from localStorage (defaults to true if not set)
  useEffect(() => {
    const saved = localStorage.getItem('soundEnabled')
    if (saved !== null) {
      setSoundEnabled(JSON.parse(saved))
    }
    // If nothing saved, keep default (true)
  }, [])

  // Load theme preference from localStorage (respects system preference on first visit)
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved)
      document.documentElement.classList.toggle('light', saved === 'light')
    } else {
      // Check system preference on first visit
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const initialTheme = prefersDark ? 'dark' : 'light'
      setTheme(initialTheme)
      document.documentElement.classList.toggle('light', initialTheme === 'light')
    }
  }, [])

  // Save sound preference
  const toggleSound = useCallback(async () => {
    // Ensure audio context is running before toggling
    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume()
    }

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

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', newTheme)
      document.documentElement.classList.toggle('light', newTheme === 'light')
      return newTheme
    })
  }, [])

  // Play sound (for hover and click)
  const playSound = useCallback(() => {
    if (soundEnabled && audioContextRef.current) {
      playClickSound(audioContextRef.current)
    }
  }, [soundEnabled])

  // Handle card click - play sound and open modal
  const handleCardClick = useCallback((item: ArchiveItem) => {
    playSound()
    setSelectedItem(item)
  }, [playSound])

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
        onHoverSound={playSound}
        leftKeyPressed={leftKeyPressed}
        rightKeyPressed={rightKeyPressed}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <ArchiveGrid
        items={filteredItems}
        onCardClick={handleCardClick}
        onHoverSound={playSound}
        activeFilter={activeFilter}
        theme={theme}
      />

      {/* Modal */}
      {selectedItem && (
        <Modal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}

      {/* Footer */}
      <footer className="px-4 lg:px-12 py-8 lg:py-12 border-t border-border">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          {/* Left side - Clock */}
          <LiveClock />

          {/* Social icons - center */}
          <div className="flex items-center gap-4 lg:gap-5">
            <a
              href="https://github.com/samhayek-code"
              target="_blank"
              rel="noopener noreferrer"
              className="text-subtle hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a
              href="https://x.com/samhayek_"
              target="_blank"
              rel="noopener noreferrer"
              className="text-subtle hover:text-foreground transition-colors"
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
              className="text-subtle hover:text-foreground transition-colors"
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
              className="text-subtle hover:text-foreground transition-colors"
              aria-label="YouTube"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>

          {/* Copyright - right side */}
          <span className="font-mono text-[10px] text-subtle tracking-wide">
            © 2026
          </span>
        </div>
      </footer>
    </main>
  )
}
