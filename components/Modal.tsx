'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import { ArchiveItem, typeColors, CollectionPiece } from '@/lib/types'
import { urlFor } from '@/lib/sanity'
import WalletButton from './WalletButton'

// Crypto wallet addresses for Support card
const WALLET_ADDRESSES = {
  SOL: 'HCvLdXCkmN4CFMwjPYAuvdLduNJYP53ziiQuCYiKdzkJ',
  ETH: '0x35ccffF3e9bA23EA6FD6030aE24C4fc7032E23d1',
  BTC: 'bc1qwsr58r24ckt2dc0p2aa2qc8gp6punt7t4tdsea',
}

// Lightbox component for full-screen image viewing with navigation
function Lightbox({
  images,
  currentIndex,
  onClose,
  onNavigate
}: {
  images: { src: string; alt: string }[]
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}) {
  const hasMultiple = images.length > 1
  const current = images[currentIndex]

  const goNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      onNavigate(currentIndex + 1)
    }
  }, [currentIndex, images.length, onNavigate])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1)
    }
  }, [currentIndex, onNavigate])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, goNext, goPrev])

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/95 cursor-zoom-out p-4"
    >
      <img
        src={current.src}
        alt={current.alt}
        className="max-w-full max-h-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Navigation arrows */}
      {hasMultiple && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goPrev() }}
            disabled={currentIndex === 0}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/60 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            aria-label="Previous image"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goNext() }}
            disabled={currentIndex === images.length - 1}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/60 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            aria-label="Next image"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}

      {/* Image counter */}
      {hasMultiple && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-sm text-white/60">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Close button */}
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

// Convert media URLs to embed URLs
function getEmbedUrl(url: string): { src: string; type: 'spotify' | 'youtube' | 'other' } {
  if (!url) return { src: '', type: 'other' }

  // Already an embed URL
  if (url.includes('/embed/')) {
    const type = url.includes('youtube') ? 'youtube' : url.includes('spotify') ? 'spotify' : 'other'
    return { src: url, type }
  }

  // Spotify
  if (url.includes('spotify.com')) {
    return {
      src: url.replace('open.spotify.com/', 'open.spotify.com/embed/'),
      type: 'spotify'
    }
  }

  // YouTube - handles youtube.com/watch, youtu.be, and youtube.com/shorts
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = ''

    if (url.includes('youtube.com/watch')) {
      // youtube.com/watch?v=VIDEO_ID
      const urlParams = new URL(url).searchParams
      videoId = urlParams.get('v') || ''
    } else if (url.includes('youtu.be/')) {
      // youtu.be/VIDEO_ID
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || ''
    } else if (url.includes('youtube.com/shorts/')) {
      // youtube.com/shorts/VIDEO_ID
      videoId = url.split('/shorts/')[1]?.split('?')[0] || ''
    }

    if (videoId) {
      return {
        src: `https://www.youtube.com/embed/${videoId}`,
        type: 'youtube'
      }
    }
  }

  return { src: url, type: 'other' }
}

interface ModalProps {
  item: ArchiveItem
  onClose: () => void
}

export default function Modal({ item, onClose }: ModalProps) {
  const colors = typeColors[item.type] || typeColors.Everything
  const youformRef = useRef<HTMLDivElement>(null)
  const closingForCheckoutRef = useRef(false)
  const [lightboxState, setLightboxState] = useState<{ images: { src: string; alt: string }[]; currentIndex: number } | null>(null)
  const [activeQR, setActiveQR] = useState<{ currency: string; address: string } | null>(null)
  // Collection state: -1 = intro, 0 to n-1 = pieces, n = merch (if exists)
  const [collectionIndex, setCollectionIndex] = useState(-1)

  // Check if this is a special modal type
  const isContactForm = item.slug?.current === 'send-message'
  const isBookingForm = item.slug?.current === 'book-a-call'
  const isCaseStudy = item.slug?.current === 'samhayek-com'
  const isSupport = item.slug?.current === 'support'
  const isArt = item.type === 'Art'
  const isDesign = item.type === 'Design'
  const isWriting = item.type === 'Writing'
  const isCollection = item.collectionPieces && item.collectionPieces.length > 0
  const hasMerch = item.merchGallery && item.merchGallery.length > 0
  const isGalleryType = (isArt || isDesign) && !isCollection  // Types that use full-width gallery display (but not collections)
  const isEmbedModal = isContactForm || isBookingForm
  const hideCtaButton = isEmbedModal || isCaseStudy || isGalleryType || isSupport || isCollection

  // Collection navigation
  const collectionPieces = item.collectionPieces || []
  const totalPieces = collectionPieces.length
  // Max index: -1 (intro), 0 to totalPieces-1 (pieces), totalPieces (merch if exists)
  const maxIndex = hasMerch ? totalPieces : totalPieces - 1
  const minIndex = -1

  const goNextCollection = useCallback(() => {
    setCollectionIndex(prev => Math.min(prev + 1, maxIndex))
  }, [maxIndex])

  const goPrevCollection = useCallback(() => {
    setCollectionIndex(prev => Math.max(prev - 1, minIndex))
  }, [minIndex])

  // Close on escape + collection navigation with arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (isCollection && !lightboxState) {
        if (e.key === 'ArrowRight') goNextCollection()
        if (e.key === 'ArrowLeft') goPrevCollection()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, isCollection, lightboxState, goNextCollection, goPrevCollection])

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

    const initYouForm = () => {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        if ((window as any).YouForm) {
          (window as any).YouForm.init()
        }
      }, 100)
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://app.youform.com/embed.js"]')
    if (!existingScript) {
      const script = document.createElement('script')
      script.src = 'https://app.youform.com/embed.js'
      script.async = true
      script.onload = initYouForm
      document.body.appendChild(script)
    } else {
      // Re-initialize if script already loaded
      initYouForm()
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
        {/* Hero image - hide for embed modals, gallery types (Art, Design), and Writing */}
        {!isEmbedModal && !isGalleryType && !isWriting && item.coverImage && (
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
          
          {/* Description - hide for collections (shown in intro screen) */}
          {!isCollection && (
            <p className="font-sans text-[15px] text-[#888] leading-relaxed mb-6">
              {item.description}
            </p>
          )}

          {/* Gallery display - full-width images with lightbox (Art, Design) */}
          {isGalleryType && (() => {
            // Build array of all images for lightbox navigation
            const allImages: { src: string; alt: string; thumbnail: string }[] = []
            if (item.coverImage) {
              allImages.push({
                src: urlFor(item.coverImage).width(2400).quality(90).url(),
                alt: item.title,
                thumbnail: urlFor(item.coverImage).width(1600).quality(85).url()
              })
            }
            if (item.gallery) {
              item.gallery.forEach((image, i) => {
                allImages.push({
                  src: urlFor(image).width(2400).quality(90).url(),
                  alt: `${item.title} ${i + 2}`,
                  thumbnail: urlFor(image).width(1600).quality(85).url()
                })
              })
            }

            const openLightbox = (index: number) => {
              setLightboxState({
                images: allImages.map(img => ({ src: img.src, alt: img.alt })),
                currentIndex: index
              })
            }

            return (
              <div className="space-y-4 mb-8">
                {allImages.map((image, i) => (
                  <div
                    key={i}
                    className="relative w-full cursor-zoom-in group"
                    onClick={() => openLightbox(i)}
                  >
                    <Image
                      src={image.thumbnail}
                      alt={image.alt}
                      width={1600}
                      height={1600}
                      className="w-full h-auto rounded-lg"
                      style={{ maxHeight: '70vh', objectFit: 'contain' }}
                    />
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors rounded-lg flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white/60 text-sm font-mono">
                        {allImages.length > 1 ? `${i + 1} / ${allImages.length} — Click to expand` : 'Click to expand'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}

          {/* Collection display - intro, pieces carousel, merch grid */}
          {isCollection && (
            <div className="mb-8">
              {/* Intro screen */}
              {collectionIndex === -1 && (
                <div className="text-center py-12">
                  <p className="font-sans text-[15px] text-[#888] leading-relaxed max-w-lg mx-auto mb-8">
                    {item.description}
                  </p>
                  <button
                    onClick={goNextCollection}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-sans text-sm font-medium bg-white/5 border border-white/10 text-foreground hover:bg-white/10 transition-colors"
                  >
                    Begin
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Individual pieces */}
              {collectionIndex >= 0 && collectionIndex < totalPieces && (() => {
                const piece = collectionPieces[collectionIndex]
                return (
                  <div className="space-y-6">
                    {/* Piece image */}
                    {piece.image && (
                      <div className="relative w-full">
                        <Image
                          src={urlFor(piece.image).width(1600).quality(90).url()}
                          alt={piece.title}
                          width={1600}
                          height={1600}
                          className="w-full h-auto rounded-lg"
                          style={{ maxHeight: '50vh', objectFit: 'contain' }}
                        />
                      </div>
                    )}

                    {/* Piece title */}
                    <h3 className="font-sans text-xl font-medium text-foreground text-center">
                      {piece.title}
                    </h3>

                    {/* Poem text */}
                    {piece.poemText && (
                      <div className="max-w-md mx-auto">
                        <p className="font-sans text-[15px] text-[#999] leading-[1.8] whitespace-pre-line text-center">
                          {piece.poemText}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* Merch grid */}
              {collectionIndex === totalPieces && hasMerch && (
                <div className="space-y-6">
                  <h3 className="font-sans text-xl font-medium text-foreground text-center">
                    The Collection
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {item.merchGallery!.map((image, i) => (
                      <div key={i} className="aspect-square relative rounded-lg overflow-hidden bg-[#151515]">
                        <Image
                          src={urlFor(image).width(600).height(600).url()}
                          alt={`Merch ${i + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#1a1a1a]">
                <button
                  onClick={goPrevCollection}
                  disabled={collectionIndex === minIndex}
                  className="flex items-center gap-2 px-4 py-2 rounded-md font-sans text-sm text-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                  {collectionIndex === 0 ? 'Intro' : collectionIndex === totalPieces ? 'Back' : 'Previous'}
                </button>

                {/* Progress indicator */}
                <div className="font-mono text-xs text-subtle">
                  {collectionIndex === -1 && 'Intro'}
                  {collectionIndex >= 0 && collectionIndex < totalPieces && `${collectionIndex + 1} / ${totalPieces}`}
                  {collectionIndex === totalPieces && 'Collection'}
                </div>

                <button
                  onClick={goNextCollection}
                  disabled={collectionIndex === maxIndex}
                  className="flex items-center gap-2 px-4 py-2 rounded-md font-sans text-sm text-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  {collectionIndex === -1 ? 'Begin' : collectionIndex === totalPieces - 1 && hasMerch ? 'Collection' : 'Next'}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Wallet buttons for Support card */}
          {isSupport && (
            <div className="relative space-y-3 mb-8">
              <WalletButton
                currency="SOL"
                address={WALLET_ADDRESSES.SOL}
                onShowQR={(currency, address) => setActiveQR(activeQR?.currency === currency ? null : { currency, address })}
              />
              <WalletButton
                currency="ETH"
                address={WALLET_ADDRESSES.ETH}
                onShowQR={(currency, address) => setActiveQR(activeQR?.currency === currency ? null : { currency, address })}
              />
              <WalletButton
                currency="BTC"
                address={WALLET_ADDRESSES.BTC}
                onShowQR={(currency, address) => setActiveQR(activeQR?.currency === currency ? null : { currency, address })}
              />

              {/* QR Code popup - fixed position centered on ETH row */}
              {activeQR && (
                <div
                  className="absolute inset-0 flex items-center justify-center z-50"
                  onClick={() => setActiveQR(null)}
                >
                  <div
                    className="p-4 rounded-xl shadow-2xl"
                    style={{
                      background: '#0f0f0f',
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(activeQR.address)}&bgcolor=0f0f0f&color=ffffff`}
                      alt={`${activeQR.currency} QR code`}
                      width={160}
                      height={160}
                      className="rounded-lg"
                    />
                    <div className="text-center mt-2 font-mono text-xs text-muted">
                      {activeQR.currency}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Body (rich text) - hide for Support card */}
          {item.body && item.body.length > 0 && !isSupport && (
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

          {/* Media embed (Spotify, YouTube, etc.) */}
          {item.embedUrl && (() => {
            const embed = getEmbedUrl(item.embedUrl)
            const height = embed.type === 'youtube' ? '315' : '152'
            return (
              <div className="mb-8">
                <iframe
                  src={embed.src}
                  width="100%"
                  height={height}
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="rounded-lg"
                  style={{ borderRadius: '12px' }}
                />
              </div>
            )
          })()}

          {/* Video (Cloudinary) */}
          {item.videoUrl && (
            <div className="mb-8">
              <video
                src={item.videoUrl}
                controls
                playsInline
                preload="metadata"
                className="w-full rounded-lg"
                style={{ maxHeight: '70vh' }}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {/* Gallery - for non-gallery types (Art/Design handle gallery separately above) */}
          {!isGalleryType && item.gallery && item.gallery.length > 0 && (
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
      {lightboxState && (
        <Lightbox
          images={lightboxState.images}
          currentIndex={lightboxState.currentIndex}
          onClose={() => setLightboxState(null)}
          onNavigate={(index) => setLightboxState(prev => prev ? { ...prev, currentIndex: index } : null)}
        />
      )}
    </div>
  )
}
