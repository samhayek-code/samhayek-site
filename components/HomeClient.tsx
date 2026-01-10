'use client'

import { useState, useEffect } from 'react'
import { ArchiveItem } from '@/lib/types'
import NavBar from '@/components/NavBar'
import PageHeader from '@/components/PageHeader'
import ArchiveGrid from '@/components/ArchiveGrid'
import Modal from '@/components/Modal'

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
