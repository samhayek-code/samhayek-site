'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { animate, JSAnimation } from 'animejs'
import { ArchiveItem, typeColors, extractPlainText } from '@/lib/types'
import { urlFor } from '@/lib/sanity'

// Filled SVG icons for Connect type cards
// Hover colors for Connect type icons
const connectIconColors: Record<string, string> = {
  'book-a-call': '#fbbf24',  // yellow
  'send-message': '#60a5fa', // blue
  'support': '#34d399',      // green
  'resume': '#a78bfa',       // purple
}

const connectIcons: Record<string, JSX.Element> = {
  'book-a-call': (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24">
      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5v-5z"/>
    </svg>
  ),
  'send-message': (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
      <path d="M7 9h10v2H7zm0-3h10v2H7zm0 6h7v2H7z"/>
    </svg>
  ),
  'support': (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
    </svg>
  ),
  'resume': (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24">
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
      <path d="M8 12h8v2H8zm0 4h8v2H8zm0-8h3v2H8z"/>
    </svg>
  ),
}

interface CardProps {
  item: ArchiveItem
  onClick: (item: ArchiveItem) => void
  onHoverSound?: () => void
  index?: number
}

// Convert hex color to RGB values for CSS custom property
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return '255, 255, 255'
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
}

export default function Card({ item, onClick, onHoverSound, index = 0 }: CardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const borderRef = useRef<SVGRectElement>(null)
  const animationRef = useRef<JSAnimation | null>(null)
  const colors = typeColors[item.type] || typeColors.Everything
  const isWritingType = item.type === 'Writing'
  const isConnectType = item.type === 'Connect'
  const bodyText = isWritingType ? (item.body ? extractPlainText(item.body) : item.description || '') : ''
  const connectIcon = isConnectType ? connectIcons[item.slug?.current] : null
  const connectColor = isConnectType ? connectIconColors[item.slug?.current] || colors.dot : colors.dot

  // Calculate stagger delay (40ms per card, max 400ms)
  const entranceDelay = Math.min(index * 40, 400)
  const glowColorRgb = hexToRgb(colors.dot)

  // Simple colored border glow on hover
  useEffect(() => {
    if (!borderRef.current) return

    if (isHovered) {
      animationRef.current = animate(borderRef.current, {
        opacity: [0, 0.6],
        duration: 300,
        ease: 'outCubic',
      })
    } else {
      if (animationRef.current) {
        animationRef.current.pause()
        animationRef.current = null
      }
      if (borderRef.current) {
        borderRef.current.style.opacity = '0'
      }
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.pause()
      }
    }
  }, [isHovered])

  const handleMouseEnter = () => {
    setIsHovered(true)
    onHoverSound?.()
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(item)}
      className="card-hover card-noise card-entrance relative overflow-hidden rounded-lg cursor-pointer flex flex-col aspect-square"
      style={{
        background: '#0a0a0a',
        border: `1px solid ${isHovered ? '#2a2a2a' : '#1a1a1a'}`,
        '--entrance-delay': `${entranceDelay}ms`,
      } as React.CSSProperties}
    >
      {/* Colored border glow - fades in on hover */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-[100]"
        style={{ overflow: 'visible' }}
      >
        <rect
          ref={borderRef}
          x="0.5"
          y="0.5"
          width="calc(100% - 1px)"
          height="calc(100% - 1px)"
          rx="7"
          ry="7"
          fill="none"
          stroke={colors.dot}
          strokeWidth="1"
          style={{
            opacity: 0,
            filter: `drop-shadow(0 0 4px ${colors.dot})`,
          }}
        />
      </svg>

      {/* Background image - spans entire card (hidden for Writing and Connect types) */}
      {item.coverImage && !isWritingType && !isConnectType && (
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

      {/* Connect type icon */}
      {isConnectType && connectIcon && (
        <div
          className="absolute inset-0 z-[1] flex items-center justify-center transition-all duration-300"
          style={{
            color: isHovered ? connectColor : '#444',
            opacity: isHovered ? 0.9 : 0.5,
          }}
        >
          {connectIcon}
        </div>
      )}

      {/* Blurred text preview for Writing cards */}
      {isWritingType && bodyText && (
        <div
          className="absolute inset-0 z-[1] overflow-hidden flex items-center justify-center transition-all duration-300"
          style={{
            padding: '24px',
            filter: isHovered ? 'blur(0px)' : 'blur(2px)',
            opacity: isHovered ? 0.8 : 0.35,
          }}
        >
          <div
            className="w-full max-w-[180px] aspect-square flex items-center justify-center"
          >
            <p className="text-foreground text-[13px] leading-[1.6] text-justify font-sans whitespace-pre-line line-clamp-5">
              {bodyText.slice(0, 150)}
            </p>
          </div>
        </div>
      )}

      {/* Dark overlay for better text readability */}
      <div
        className="absolute inset-0 z-[2] transition-all duration-300 ease-out"
        style={{
          background: isHovered
            ? 'linear-gradient(to bottom, rgba(10,10,10,0.5) 0%, rgba(10,10,10,0.1) 40%, rgba(10,10,10,0.5) 100%)'
            : 'linear-gradient(to bottom, rgba(10,10,10,0.7) 0%, rgba(10,10,10,0.4) 40%, rgba(10,10,10,0.7) 100%)',
        }}
      />

      {/* Hover gradient */}
      <div
        className="absolute inset-0 z-[3] transition-all duration-400 pointer-events-none"
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
