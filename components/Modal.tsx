'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import { ArchiveItem, typeColors } from '@/lib/types'
import { urlFor } from '@/lib/sanity'

// Lightbox component for full-screen image viewing
function Lightbox({
  src,
  alt,
  onClose
}: {
  src: string
  alt: string
  onClose: () => void
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/95 cursor-zoom-out p-4"
    >
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"
        aria-label="Close lightbox"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

// Convert Spotify URL to embed URL
function getSpotifyEmbedUrl(url: string): string {
  if (!url) return ''
  // Already an embed URL
  if (url.includes('/embed/')) return url
  // Convert open.spotify.com/track/xxx to open.spotify.com/embed/track/xxx
  return url.replace('open.spotify.com/', 'open.spotify.com/embed/')
}

interface ModalProps {
  item: ArchiveItem
  onClose: () => void
}

export default function Modal({ item, onClose }: ModalProps) {
  const colors = typeColors[item.type] || typeColors.Everything
  const youformRef = useRef<HTMLDivElement>(null)
  const closingForCheckoutRef = useRef(false)
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null)

  // Check if this is a special modal type
  const isContactForm = item.slug?.current === 'send-message'
  const isBookingForm = item.slug?.current === 'book-a-call'
  const isCaseStudy = item.slug?.current === 'samhayek-com'
  const isArt = item.type === 'Art'
  const isEmbedModal = isContactForm || isBookingForm
  const hideCtaButton = isEmbedModal || isCaseStudy || isArt

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      // Don't restore overflow if closing for Lemon Squeezy checkout
      if (!closingForCheckoutRef.current) {
        document.body.style.overflow = 'auto'
      }
    }
  }, [])

  // Load YouForm script for contact form
  useEffect(() => {
    if (!isContactForm) return

    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://app.youform.com/embed.js"]')
    if (!existingScript) {
      const script = document.createElement('script')
      script.src = 'https://app.youform.com/embed.js'
      script.async = true
      document.body.appendChild(script)
    } else {
      // Re-initialize if script already loaded
      if ((window as any).YouForm) {
        (window as any).YouForm.init()
      }
    }
  }, [isContactForm])

  // Load Cal.com script for booking form
  useEffect(() => {
    if (!isBookingForm) return

    // Initialize Cal loader (from Cal.com embed docs)
    (function (C: any, A: string, L: string) {
      let p = function (a: any, ar: any) { a.q.push(ar) }
      let d = C.document
      C.Cal = C.Cal || function () {
        let cal = C.Cal
        let ar = arguments
        if (!cal.loaded) {
          cal.ns = {}
          cal.q = cal.q || []
          d.head.appendChild(d.createElement("script")).src = A
          cal.loaded = true
        }
        if (ar[0] === L) {
          const api: any = function () { p(api, arguments) }
          const namespace = ar[1]
          api.q = api.q || []
          if (typeof namespace === "string") {
            cal.ns[namespace] = cal.ns[namespace] || api
            p(cal.ns[namespace], ar)
            p(cal, ["initNamespace", namespace])
          } else p(cal, ar)
          return
        }
        p(cal, ar)
      }
    })(window, "https://app.cal.com/embed/embed.js", "init")

    const Cal = (window as any).Cal
    Cal("init", "30min", { origin: "https://app.cal.com" })
    Cal.ns["30min"]("inline", {
      elementOrSelector: "#my-cal-inline-30min",
      config: { layout: "week_view" },
      calLink: "samhayek/30min",
    })
    Cal.ns["30min"]("ui", { hideEventTypeDetails: true, layout: "week_view" })
  }, [isBookingForm])
  
  // Load Lemon Squeezy script for checkout overlay
  useEffect(() => {
    if (!item.lemonSqueezyUrl) return

    const existingScript = document.querySelector('script[src="https://app.lemonsqueezy.com/js/lemon.js"]')
    if (!existingScript) {
      const script = document.createElement('script')
      script.src = 'https://app.lemonsqueezy.com/js/lemon.js'
      script.defer = true
      script.onload = () => {
        // Initialize Lemon Squeezy after script loads
        (window as any).createLemonSqueezy?.()
      }
      document.head.appendChild(script)
    } else {
      // Script already exists, refresh listeners
      (window as any).createLemonSqueezy?.()
    }
  }, [item.lemonSqueezyUrl])

  const handleAction = () => {
    // Handle non-Lemon Squeezy CTAs (Lemon Squeezy uses anchor with class)
    if (item.externalUrl) {
      window.open(item.externalUrl, '_blank')
    } else if (item.embedUrl) {
      window.open(item.embedUrl, '_blank')
    }
  }

  const handleLemonSqueezyClick = () => {
    // Keep body scroll locked for Lemon Squeezy overlay
    // The ref prevents the cleanup from restoring overflow
    closingForCheckoutRef.current = true
    onClose()
  }
  
  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[2000] flex items-center justify-center p-12 cursor-pointer modal-backdrop"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0f0f0f] rounded-xl border border-[#222] max-w-[800px] w-full max-h-[85vh] overflow-auto cursor-default"
      >
        {/* Hero image - hide for embed modals and Art type */}
        {!isEmbedModal && !isArt && item.coverImage && (
          <div className="w-full aspect-video bg-[#151515] rounded-t-xl flex items-center justify-center relative">
            {item.coverImage ? (
              <Image
                src={urlFor(item.coverImage).width(1600).height(900).url()}
                alt={item.title}
                fill
                className="object-cover rounded-t-xl"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-white/[0.03] border border-white/[0.06]" />
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="p-8 overflow-x-hidden">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="font-sans text-2xl font-medium text-foreground mb-2">
                {item.title}
              </h2>
              {item.year && (
                <span className="font-mono text-xs text-subtle">
                  {item.year}
                </span>
              )}
            </div>
            
            {/* Label pill */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded shrink-0"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: colors.dot }}
              />
              <span className="font-mono text-[11px] text-muted uppercase tracking-wide whitespace-nowrap">
                {item.label}
              </span>
            </div>
          </div>
          
          {/* Description */}
          <p className="font-sans text-[15px] text-[#888] leading-relaxed mb-6">
            {item.description}
          </p>

          {/* Art display - full-width images with lightbox */}
          {isArt && (
            <div className="space-y-4 mb-8">
              {/* Cover image as main artwork */}
              {item.coverImage && (
                <div
                  className="relative w-full cursor-zoom-in group"
                  onClick={() => {
                    const src = urlFor(item.coverImage!).width(2400).quality(90).url()
                    setLightboxImage({ src, alt: item.title })
                  }}
                >
                  <Image
                    src={urlFor(item.coverImage).width(1600).quality(85).url()}
                    alt={item.title}
                    width={1600}
                    height={1600}
                    className="w-full h-auto rounded-lg"
                    style={{ maxHeight: '70vh', objectFit: 'contain' }}
                  />
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors rounded-lg flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white/60 text-sm font-mono">
                      Click to expand
                    </span>
                  </div>
                </div>
              )}
              {/* Additional gallery images */}
              {item.gallery && item.gallery.length > 0 && item.gallery.map((image, i) => (
                <div
                  key={i}
                  className="relative w-full cursor-zoom-in group"
                  onClick={() => {
                    const src = urlFor(image).width(2400).quality(90).url()
                    setLightboxImage({ src, alt: `${item.title} ${i + 2}` })
                  }}
                >
                  <Image
                    src={urlFor(image).width(1600).quality(85).url()}
                    alt={`${item.title} ${i + 2}`}
                    width={1600}
                    height={1600}
                    className="w-full h-auto rounded-lg"
                    style={{ maxHeight: '70vh', objectFit: 'contain' }}
                  />
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors rounded-lg flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white/60 text-sm font-mono">
                      Click to expand
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Body (rich text) */}
          {item.body && item.body.length > 0 && (
            <div className="prose prose-invert prose-sm max-w-full w-full mb-8 text-[#aaa] overflow-hidden break-words [&>p]:mb-4 [&>p]:leading-relaxed">
              <PortableText value={item.body} />
            </div>
          )}

          {/* YouForm embed for contact form */}
          {isContactForm && (
            <div className="mb-8">
              <div
                ref={youformRef}
                data-youform-embed
                data-form="muqaomml"
                data-width="100%"
                data-height="700"
              />
            </div>
          )}

          {/* Cal.com embed for booking form */}
          {isBookingForm && (
            <div className="mb-8">
              <div
                id="my-cal-inline-30min"
                style={{ width: '100%', height: '600px', overflow: 'scroll' }}
              />
            </div>
          )}

          {/* Spotify/Apple Music embed */}
          {item.embedUrl && (
            <div className="mb-8">
              <iframe
                src={getSpotifyEmbedUrl(item.embedUrl)}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-lg"
                style={{ borderRadius: '12px' }}
              />
            </div>
          )}
          
          {/* Gallery - for non-Art items (Art handles gallery separately above) */}
          {!isArt && item.gallery && item.gallery.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-8">
              {item.gallery.map((image, i) => (
                <div key={i} className="aspect-square relative rounded-md overflow-hidden bg-[#151515] border border-[#1a1a1a]">
                  <Image
                    src={urlFor(image).width(400).height(400).url()}
                    alt={`${item.title} gallery ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between items-center pt-6 border-t border-[#1a1a1a]">
            {item.price ? (
              <span className="font-mono text-lg text-foreground">
                {item.price}
              </span>
            ) : (
              <span />
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-5 py-3 rounded-md font-sans text-sm font-medium text-muted border border-[#333] hover:border-[#444] transition-colors"
              >
                Close
              </button>
              {!hideCtaButton && (
                item.lemonSqueezyUrl ? (
                  <a
                    href={item.lemonSqueezyUrl}
                    onClick={handleLemonSqueezyClick}
                    className="lemonsqueezy-button px-6 py-3 rounded-md font-sans text-sm font-medium bg-foreground text-background hover:bg-white transition-colors"
                  >
                    {item.cta}
                  </a>
                ) : (
                  <button
                    onClick={handleAction}
                    className="px-6 py-3 rounded-md font-sans text-sm font-medium bg-foreground text-background hover:bg-white transition-colors"
                  >
                    {item.cta}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <Lightbox
          src={lightboxImage.src}
          alt={lightboxImage.alt}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </div>
  )
}
