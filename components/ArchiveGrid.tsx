'use client'

import Card from './Card'
import { ArchiveItem } from '@/lib/types'

interface ArchiveGridProps {
  items: ArchiveItem[]
  onCardClick: (item: ArchiveItem) => void
  focusedIndex: number
  onHoverSound: () => void
}

export default function ArchiveGrid({ items, onCardClick, focusedIndex, onHoverSound }: ArchiveGridProps) {
  return (
    <div className="px-12 pb-20 pt-6">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item, index) => (
          <Card
            key={item._id}
            item={item}
            onClick={onCardClick}
            isFocused={index === focusedIndex}
            onHoverSound={onHoverSound}
          />
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-32">
          <span className="font-sans text-sm text-[#333]">
            Nothing here yet.
          </span>
        </div>
      )}
    </div>
  )
}
