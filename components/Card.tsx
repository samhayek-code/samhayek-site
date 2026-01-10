'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArchiveItem, typeColors } from '@/lib/types'
import { urlFor } from '@/lib/sanity'

interface CardProps {
  item: ArchiveItem
  onClick: (item: ArchiveItem) => void
}

export default function Card({ item, onClick }: CardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const colors = typeColors[item.type] || typeColors.Everything
  
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(item)}
      className="card-hover relative overflow-hidden rounded-lg p-6 cursor-pointer flex flex-col aspect-square"
      style={{
        background: isHovered ? '#111' : '#0a0a0a',
        border: `1px solid ${isHovered ? '#222' : '#151515'}`,
      }}
    >
      {/* Hover gradient */}
      <div 
        className="absolute inset-0 transition-all duration-400 pointer-events-none"
        style={{
          background: isHovered 
            ? `radial-gradient(ellipse at 50% 0%, ${colors.bg}, transparent 70%)`
            : 'transparent',
        }}
      />
      
      {/* Top row */}
      <div className="relative z-10 flex justify-between items-start">
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
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
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
      
      {/* Content area */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        {item.coverImage ? (
          <div className="w-16 h-16 relative rounded overflow-hidden">
            <Image
              src={urlFor(item.coverImage).width(128).height(128).url()}
              alt={item.title}
              fill
              className="object-cover"
              style={{ opacity: isHovered ? 0.8 : 0.6 }}
            />
          </div>
        ) : (
          <div 
            className="w-16 h-16 rounded transition-opacity duration-300"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              opacity: isHovered ? 0.8 : 0.4,
            }}
          />
        )}
      </div>
      
      {/* Bottom row */}
      <div className="relative z-10 flex justify-between items-end">
        {item.price ? (
          <span className="font-mono text-[13px] text-subtle">
            {item.price}
          </span>
        ) : (
          <span />
        )}
        
        <button 
          className="px-3.5 py-2 rounded text-xs font-medium font-sans transition-all duration-200"
          style={{
            background: isHovered ? '#e5e5e5' : 'transparent',
            color: isHovered ? '#0a0a0a' : '#666',
            border: `1px solid ${isHovered ? '#e5e5e5' : '#333'}`,
          }}
        >
          {item.cta}
        </button>
      </div>
    </div>
  )
}
