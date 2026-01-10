'use client'

import { useState, useEffect } from 'react'
import { ArchiveItem } from '@/lib/types'
import NavBar from '@/components/NavBar'
import PageHeader from '@/components/PageHeader'
import ArchiveGrid from '@/components/ArchiveGrid'
import Modal from '@/components/Modal'

// Chat items (hardcoded since they're not content-based)
const chatItems: ArchiveItem[] = [
  {
    _id: 'chat-call',
    title: 'Book a Call',
    slug: { current: 'book-a-call' },
    type: 'Chat',
    label: '30 min',
    cta: 'Schedule',
    description: "A 30-minute intro call to discuss your project, goals, and whether we'd be a good fit. No pitch, just conversation.",
    externalUrl: 'https://cal.com/samhayek', // Update with your actual Calendly/Cal link
  },
  {
    _id: 'chat-form',
    title: 'Send a Message',
    slug: { current: 'send-message' },
    type: 'Chat',
    label: 'Async',
    cta: 'Write',
    description: "Prefer to write? Send me a note with some context about your project. I'll respond within 48 hours.",
    externalUrl: 'mailto:hello@samhayek.com', // Update with your email
  },
]

interface HomeClientProps {
  items: ArchiveItem[]
}

export default function HomeClient({ items }: HomeClientProps) {
  const [activeFilter, setActiveFilter] = useState('Everything')
  const [isScrolled, setIsScrolled] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ArchiveItem | null>(null)
  
  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  // Filter items
  const getFilteredItems = () => {
    if (activeFilter === 'Everything') return items
    if (activeFilter === 'Chat') return chatItems
    return items.filter(item => item.type === activeFilter)
  }
  
  return (
    <main className="min-h-screen bg-background text-foreground">
      <PageHeader filter={activeFilter} />
      
      <NavBar 
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        isScrolled={isScrolled}
      />
      
      <ArchiveGrid 
        items={getFilteredItems()} 
        onCardClick={setSelectedItem}
      />
      
      {/* Modal */}
      {selectedItem && (
        <Modal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
      
      {/* Footer */}
      <footer className="px-12 py-12 border-t border-border flex justify-center">
        <span className="font-mono text-[10px] text-[#333] tracking-wide">
          © 2026 Sam Hayek
        </span>
      </footer>
    </main>
  )
}
