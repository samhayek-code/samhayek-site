'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArchiveItem, typeColors } from '@/lib/types'
import { urlFor } from '@/lib/sanity'

interface CardProps {
  item: ArchiveItem
  onClick: (item: ArchiveItem) => void
  onHoverSound?: () => void
}

export default function Card({ item, onClick, onHoverSound }: CardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const colors = typeColors[item.type] || typeColors.Everything

  const handleMouseEnter = () => {
    setIsHovered(true)
    onHoverSound?.()
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(item)}
      className="card-hover relative overflow-hidden rounded-lg cursor-pointer flex flex-col aspect-square"
      style={{
        background: '#0a0a0a',
        border: `1px solid ${isHovered ? '#222' : '#151515'}`,
      }}
    >
      {/* Background image - spans entire card */}
      {item.coverImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={urlFor(item.coverImage).width(600).height(600).url()}
            alt={item.title}
            fill
            className="object-cover transition-all duration-300 ease-out"
            style={{
              opacity: isHovered ? 0.85 : 0.4,
              filter: isHovered ? 'blur(0px)' : 'blur(2px)',
            }}
          />
        </div>
      )}

      {/* Dark overlay for better text readability */}
      <div
        className="absolute inset-0 z-[1] transition-all duration-300 ease-out"
        style={{
          background: isHovered
            ? 'linear-gradient(to bottom, rgba(10,10,10,0.5) 0%, rgba(10,10,10,0.1) 40%, rgba(10,10,10,0.5) 100%)'
            : 'linear-gradient(to bottom, rgba(10,10,10,0.7) 0%, rgba(10,10,10,0.4) 40%, rgba(10,10,10,0.7) 100%)',
        }}
      />

      {/* Hover gradient */}
      <div
        className="absolute inset-0 z-[2] transition-all duration-400 pointer-events-none"
        style={{
          background: isHovered
            ? `radial-gradient(ellipse at 50% 0%, ${colors.bg}, transparent 70%)`
            : 'transparent',
        }}
      />

      {/* Top row */}
      <div className="relative z-10 flex justify-between items-start p-5">
        <div className="flex-1 pr-4">
          <span className="font-sans text-[15px] text-foreground font-medium leading-tight block">
            {item.title}
          </span>
          {item.year && (
            <span className="font-mono text-[11px] text-subtle mt-1 block">
              {item.year}
            </span>
          )}
        </div>

        {/* Label pill */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded flex-shrink-0"
          style={{
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: colors.dot, opacity: 0.9 }}
          />
          <span className="font-mono text-[10px] text-muted uppercase tracking-wide">
            {item.label}
          </span>
        </div>
      </div>

      {/* Spacer - pushes bottom row down */}
      <div className="flex-1" />

      {/* Bottom row */}
      <div className="relative z-10 flex justify-between items-end p-5">
        {item.price ? (
          <span className="font-mono text-[13px] text-foreground font-medium">
            {item.price}
          </span>
        ) : (
          <span />
        )}

        <button
          className="px-3.5 py-2 rounded text-xs font-medium font-sans transition-all duration-200"
          style={{
            background: isHovered ? '#e5e5e5' : 'rgba(0,0,0,0.5)',
            color: isHovered ? '#0a0a0a' : '#ccc',
            border: `1px solid ${isHovered ? '#e5e5e5' : 'rgba(255,255,255,0.15)'}`,
          }}
        >
          {item.cta}
        </button>
      </div>
    </div>
  )
}
