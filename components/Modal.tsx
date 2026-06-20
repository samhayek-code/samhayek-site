'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import MuxPlayer from '@mux/mux-player-react'
import { ArchiveItem, typeColors } from '@/lib/types'
import { urlFor } from '@/lib/sanity'
import WalletButton from './WalletButton'
import CaseStudyContent from './CaseStudyContent'
import ContactForm from './ContactForm'

// Crypto wallet addresses for Support card
const WALLET_ADDRESSES = {
  SOL: 'HCvLdXCkmN4CFMwjPYAuvdLduNJYP53ziiQuCYiKdzkJ',
  ETH: '0x35ccffF3e9bA23EA6FD6030aE24C4fc7032E23d1',
  BTC: 'bc1qwsr58r24ckt2dc0p2aa2qc8gp6punt7t4tdsea',
}

// PortableText components for rendering images and links inline
const portableTextComponents = {
  types: {
    image: ({ value }: { value: { asset?: { _ref?: string; _id?: string; url?: string }; alt?: string; caption?: string } }) => {
      // Handle both referenced and expanded asset structures
      if (!value?.asset) return null
      const hasValidAsset = value.asset._ref || value.asset._id || value.asset.url
      if (!hasValidAsset) return null

      return (
        <figure className="my-8">
          <div className="relative w-full overflow-hidden rounded-card img-outline">
            <Image
              src={urlFor(value).width(1200).quality(90).url()}
              alt={value.alt || ''}
              width={1200}
              height={675}
              className="w-full h-auto"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
          {value.caption && (
            <figcaption className="mt-3 text-center text-sm text-muted">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
  },
  marks: {
    link: ({ children, value }: { children: React.ReactNode; value?: { href?: string } }) => {
      const href = value?.href || ''
      const isExternal = href.startsWith('http')
      return (
        <a
          href={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="text-foreground underline underline-offset-2 hover:opacity-70 transition-opacity"
        >
          {children}
        </a>
      )
    },
  },
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
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono font-medium text-sm text-white/60">
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
function getEmbedUrl(url: string): { src: string; type: 'spotify' | 'youtube' | 'audius' | 'other' } {
  if (!url) return { src: '', type: 'other' }

  // Already an embed URL
  if (url.includes('/embed/')) {
    const type = url.includes('youtube') ? 'youtube' : url.includes('spotify') ? 'spotify' : url.includes('audius.co') ? 'audius' : 'other'
    return { src: url, type }
  }

  // Audius
  if (url.includes('audius.co')) {
    return { src: url, type: 'audius' }
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
  const closingForCheckoutRef = useRef(false)
  const [lightboxState, setLightboxState] = useState<{ images: { src: string; alt: string }[]; currentIndex: number } | null>(null)
  const [activeQR, setActiveQR] = useState<{ currency: string; address: string } | null>(null)
  // Collection state: -1 = intro, 0 to n-1 = pieces, n = merch (if exists)
  const [collectionIndex, setCollectionIndex] = useState(-1)
  // Collection crossfade — tracks the "displayed" index with a brief opacity dip
  const [displayedIndex, setDisplayedIndex] = useState(-1)
  const [collectionFade, setCollectionFade] = useState(true)
  // Whop checkout state
  const [showWhopCheckout, setShowWhopCheckout] = useState(false)
  const [copied, setCopied] = useState(false)

  // Entrance/exit animation state
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  // Trigger entrance animation on mount — small delay ensures initial state is painted
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 20)
    return () => clearTimeout(timer)
  }, [])

  // Animated close — fade out, then unmount after transition completes
  const handleClose = useCallback(() => {
    if (isClosing) return
    setIsClosing(true)
    setIsVisible(false)
    setTimeout(() => {
      onClose()
    }, 360)
  }, [isClosing, onClose])

  // Collection crossfade — when collectionIndex changes, dip opacity then swap content
  useEffect(() => {
    if (collectionIndex === displayedIndex) return
    setCollectionFade(false) // fade out
    const timer = setTimeout(() => {
      setDisplayedIndex(collectionIndex) // swap content while faded
      setCollectionFade(true) // fade in
    }, 180)
    return () => clearTimeout(timer)
  }, [collectionIndex, displayedIndex])

  // Check if this is a special modal type
  const isOasis = item.slug?.current === 'oasis'
  const isSC2 = item.slug?.current === 'sc2-audio-hooks'
  const isHalo = item.slug?.current === 'halo-audio-hooks'
  const isTiberianSun = item.slug?.current === 'tiberian-sun-audio-hooks'
  const isContactForm = item.slug?.current === 'send-message'
  const isBookingForm = item.slug?.current === 'book-a-call'
  const isCaseStudy = (item.caseStudySections?.length ?? 0) > 0
  // Live production site link. Prefers the Sanity `liveUrl` field; falls back to
  // a per-slug map so the button works without a CMS write.
  const liveUrl =
    item.liveUrl ||
    ({ "grow-theory": "https://growtheory.io" } as Record<string, string>)[item.slug?.current ?? ""]
  const isSupport = item.slug?.current === 'support'
  const isResume = item.slug?.current === 'resume'
  const isArt = item.type === 'Art'
  const isDesign = item.type === 'Design'
  const isWriting = item.type === 'Writing'
  const isTestimonial = item.label === 'Testimonial'
  const isCollection = item.collectionPieces && item.collectionPieces.length > 0
  const hasMerch = item.merchGallery && item.merchGallery.length > 0
  const isReferences = item.slug?.current === 'references'
  const isGalleryType = (isArt || isDesign) && !isCollection && !isTestimonial && !isReferences && !isCaseStudy  // Types that use full-width gallery display (but not collections, testimonials, case studies, or references)
  const isEmbedModal = isContactForm || isBookingForm
  const hideCtaButton = isEmbedModal || isGalleryType || isSupport || isCollection || isWriting || isOasis || isSC2 || isHalo || isTiberianSun || isResume || isCaseStudy

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
      if (e.key === 'Escape') handleClose()
      if (isCollection && !lightboxState) {
        if (e.key === 'ArrowRight') goNextCollection()
        if (e.key === 'ArrowLeft') goPrevCollection()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleClose, isCollection, lightboxState, goNextCollection, goPrevCollection])

  // Prevent body scroll — compensate for scrollbar width to avoid layout shift
  useEffect(() => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${scrollbarWidth}px`
    return () => {
      if (!closingForCheckoutRef.current) {
        document.body.style.overflow = 'auto'
      }
      document.body.style.paddingRight = ''
    }
  }, [])

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

  // Build Whop checkout iframe URL
  const getWhopCheckoutUrl = useCallback((planId: string) => {
    const url = new URL(`/embedded/checkout/${planId}/`, 'https://whop.com')
    url.searchParams.set('h', window.location.origin)
    url.searchParams.set('theme', 'dark')
    url.searchParams.set('skip_redirect', 'true')
    url.searchParams.set('d', 'checkout') // Hint to Whop this is a checkout flow
    // Add cache-busting parameter to force fresh settings
    url.searchParams.set('_t', Date.now().toString())
    return url.toString()
  }, [])

  const handleAction = () => {
    // Handle non-Lemon Squeezy CTAs (Lemon Squeezy uses anchor with class)
    if (item.externalUrl) {
      window.open(item.externalUrl, '_blank')
    } else if (item.embedUrl) {
      window.open(item.embedUrl, '_blank')
    }
  }

  const handleCopyInstall = async (command: string) => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleLemonSqueezyClick = () => {
    // Keep body scroll locked for Lemon Squeezy overlay
    // The ref prevents the cleanup from restoring overflow
    closingForCheckoutRef.current = true
    // Skip animated close — Lemon Squeezy overlay needs instant transition
    onClose()
  }
  
  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 lg:p-12 cursor-pointer modal-backdrop"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.34s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-[800px] w-full cursor-default rounded-modal overflow-hidden"
        style={{
          background: 'var(--modal-bg)',
          boxShadow: 'var(--shadow-pop)',
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.98)',
          opacity: isVisible ? 1 : 0,
          transition: isVisible
            ? 'transform 0.46s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.38s ease-out'
            : 'transform 0.29s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.23s ease-in',
        }}
      >
        {/* Inner scroll container — the outer box's overflow-hidden + rounded-modal
            clips this scrollbar flush to the corners, so it no longer runs past them. */}
        <div className={`overflow-y-auto overflow-x-hidden ${showWhopCheckout ? 'max-h-[95vh]' : 'max-h-[85vh]'}`}>
        {/* Hero image - hide for embed modals, gallery types (Art, Design), Writing, testimonials, case studies, and checkout */}
        {!isEmbedModal && !isGalleryType && !isWriting && !isTestimonial && !isCaseStudy && !showWhopCheckout && !isReferences && item.coverImage && (
          <div className="w-full aspect-video flex items-center justify-center relative overflow-hidden img-outline" style={{ background: 'var(--modal-surface)' }}>
            {item.coverImage ? (
              <Image
                src={urlFor(item.coverImage).width(1600).height(900).url()}
                alt={item.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-20 h-20 bg-white/[0.03] border border-white/[0.06]" />
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="p-5 lg:p-8 overflow-x-hidden">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="font-display text-[24px] lg:text-[28px] font-medium tracking-[-0.02em] text-foreground mb-2">
                {item.title}
              </h2>
              {item.year && (
                <span className="font-mono font-medium text-[14px] text-subtle">
                  {item.year}
                </span>
              )}
            </div>
            
            {/* Label pill */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 shrink-0 rounded-tag shadow-card"
              style={{
                background: 'var(--card-pill-bg)',
                border: '1px solid var(--card-pill-border)',
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: colors.dot }}
              />
              <span className="font-mono font-medium text-[11px] text-muted uppercase tracking-wide whitespace-nowrap">
                {item.label}
              </span>
            </div>
          </div>
          
          {/* Case study: MUX video at top, then meta + overview, then Figma embed, then remaining sections */}
          {isCaseStudy && (() => {
            const overviewSection = item.caseStudySections!.filter(s => s.sectionTitle === 'Overview')
            const remainingSections = item.caseStudySections!.filter(s => s.sectionTitle !== 'Overview')

            return (
              <>
                {/* Prominent filled button: jump straight to the full interactive case study */}
                {item.externalUrl && (
                  <a
                    href={item.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mb-8 flex items-center justify-center gap-3 px-6 py-4 font-mono text-[13px] sm:text-[14px] font-bold uppercase tracking-wider text-white rounded-btn press transition-opacity hover:opacity-90"
                    style={{ background: colors.dot }}
                  >
                    View the full interactive case study
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </a>
                )}

                {/* Prominent filled button: visit the live production site */}
                {liveUrl && (
                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mb-8 flex items-center justify-center gap-3 px-6 py-4 font-mono text-[13px] sm:text-[14px] font-bold uppercase tracking-wider text-white rounded-btn press transition-opacity hover:opacity-90"
                    style={{ background: colors.dot }}
                  >
                    Visit the live site
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </a>
                )}

                {/* Video at top */}
                {item.muxVideo?.asset?.playbackId && (
                  <div className="mb-8 rounded-card overflow-hidden">
                    <MuxPlayer
                      playbackId={item.muxVideo.asset.playbackId}
                      streamType="on-demand"
                      accentColor="#CC7B42"
                      style={{
                        width: '100%',
                        maxHeight: '70vh',
                        borderRadius: 'var(--radius-card)',
                        aspectRatio: '16/9'
                      }}
                    />
                  </div>
                )}

                {/* Meta + overview */}
                <CaseStudyContent
                  meta={item.caseStudyMeta}
                  sections={overviewSection}
                  portableTextComponents={portableTextComponents}
                  onImageClick={(images, index) => {
                    setLightboxState({ images, currentIndex: index })
                  }}
                />

                {/* Figma embed after overview */}
                {item.figmaUrl && (
                  <div className="mb-8">
                    <iframe
                      src={`https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(item.figmaUrl)}`}
                      width="100%"
                      height="500"
                      allowFullScreen
                      className="border border-border rounded-card"
                      style={{ background: 'var(--background)' }}
                    />
                  </div>
                )}

                {/* Remaining sections */}
                <CaseStudyContent
                  sections={remainingSections}
                  portableTextComponents={portableTextComponents}
                  onImageClick={(images, index) => {
                    setLightboxState({ images, currentIndex: index })
                  }}
                />
              </>
            )
          })()}

          {/* Description - hide for collections, checkout, OASIS, and case studies */}
          {!isCollection && !showWhopCheckout && !isOasis && !isSC2 && !isHalo && !isTiberianSun && !isCaseStudy && (
            <p className="font-sans text-[17px] leading-relaxed mb-6" style={{ color: 'var(--modal-text-secondary)' }}>
              {item.description}
            </p>
          )}

          {/* Oasis - Downloads Organizer */}
          {isOasis && (
            <div className="space-y-6 mb-8">
              {/* Subtitle */}
              <p className="font-sans text-[15px]" style={{ color: 'var(--modal-text-tertiary)' }}>
                Download folders can get chaotic, this helps.
              </p>

              {/* Main description */}
              <p className="font-sans text-[17px] leading-relaxed" style={{ color: 'var(--modal-text-secondary)' }}>
                Oasis is a small script that runs automatically every night at midnight.
              </p>
              <p className="font-sans text-[17px] leading-relaxed" style={{ color: 'var(--modal-text-secondary)' }}>
                It takes any new files in your Downloads folder and sorts them into folders by date and type — images in one place, documents in another.
              </p>
              <p className="font-sans text-[17px] leading-relaxed" style={{ color: 'var(--modal-text-secondary)' }}>
                At the end of each week, those daily folders get grouped together. At the end of each month, the weeks get archived. You never have to think about it.
              </p>
              <p className="font-sans text-[15px] leading-relaxed" style={{ color: 'var(--modal-text-tertiary)' }}>
                macOS only.
              </p>

              {/* Install command */}
              <div className="space-y-3">
                <span className="font-mono font-medium text-[11px] text-muted uppercase tracking-wide">
                  Install
                </span>
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-input"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <code className="font-mono text-[13px] text-foreground truncate flex-1 select-all" title="curl -fsSL https://raw.githubusercontent.com/samhayek-code/OASIS/main/install.sh | bash">
                    curl -fsSL https://raw.githubusercontent.com/samhayek-code/OASIS/main/install.sh | bash
                  </code>
                  <button
                    onClick={() => handleCopyInstall('curl -fsSL https://raw.githubusercontent.com/samhayek-code/OASIS/main/install.sh | bash')}
                    className="shrink-0 px-3 py-1.5 font-mono text-[12px] font-medium rounded-chip press transition-all"
                    style={{
                      background: copied ? 'var(--foreground)' : 'var(--cta-bg)',
                      border: '1px solid',
                      borderColor: copied ? 'var(--foreground)' : 'var(--border)',
                      color: copied ? 'var(--background)' : 'var(--cta-text)',
                    }}
                    onMouseEnter={(e) => {
                      if (!copied) {
                        e.currentTarget.style.background = 'var(--cta-hover-bg)'
                        e.currentTarget.style.borderColor = 'var(--cta-hover-border)'
                        e.currentTarget.style.color = 'var(--cta-hover-text)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!copied) {
                        e.currentTarget.style.background = 'var(--cta-bg)'
                        e.currentTarget.style.borderColor = 'var(--border)'
                        e.currentTarget.style.color = 'var(--cta-text)'
                      }
                    }}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Simple steps */}
              <div className="space-y-3">
                <span className="font-mono font-medium text-[11px] text-muted uppercase tracking-wide">
                  How it works
                </span>
                <ol className="space-y-2 font-sans text-[15px]" style={{ color: 'var(--modal-text-tertiary)' }}>
                  <li className="flex gap-3">
                    <span className="font-mono text-[13px] text-muted shrink-0">1.</span>
                    <span>Open Terminal (search &ldquo;Terminal&rdquo; in Spotlight)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono text-[13px] text-muted shrink-0">2.</span>
                    <span>Paste the command above and press Enter</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono text-[13px] text-muted shrink-0">3.</span>
                    <span>Done. OASIS runs automatically every night.</span>
                  </li>
                </ol>
              </div>

              {/* What you get */}
              <div
                className="p-4 font-mono text-[12px] leading-relaxed rounded-input"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--modal-text-tertiary)',
                }}
              >
                <div className="text-muted mb-2">~/Downloads/</div>
                <div className="pl-4 space-y-0.5">
                  <div>January 2026/</div>
                  <div className="pl-4 space-y-0.5">
                    <div className="text-muted">Week 1 (Jan 1-5)/</div>
                    <div className="pl-4 space-y-0.5">
                      <div className="text-muted">Jan 1/</div>
                      <div className="pl-4 text-subtle">Images/ Documents/ Videos/ Audio/ Other/</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SC2 Audio-Hooks */}
          {isSC2 && (
            <div className="space-y-6 mb-8">
              {/* Subtitle */}
              <p className="font-sans text-[15px]" style={{ color: 'var(--modal-text-tertiary)' }}>
                StarCraft 2 sound effects for Claude Code.
              </p>

              {/* Main description */}
              <p className="font-sans text-[17px] leading-relaxed" style={{ color: 'var(--modal-text-secondary)' }}>
                Hooks into four Claude Code events and plays random SC2 voice lines — unit ready confirmations when a session starts, completion announcements when a task finishes, alert lines when permission is needed, and resource warnings on errors.
              </p>
              <p className="font-sans text-[17px] leading-relaxed" style={{ color: 'var(--modal-text-secondary)' }}>
                Choose your faction — Terran, Protoss, or Zerg — and switch anytime. 75 sounds across all three, with a random pick each time so it never gets repetitive.
              </p>
              <p className="font-sans text-[17px] leading-relaxed" style={{ color: 'var(--modal-text-secondary)' }}>
                Error sounds are smart-filtered so routine command failures stay silent. Only genuinely interesting errors trigger a sound, with a 15-second cooldown to prevent rapid-fire.
              </p>
              <p className="font-sans text-[15px] leading-relaxed" style={{ color: 'var(--modal-text-tertiary)' }}>
                macOS only.
              </p>

              {/* Install command */}
              <div className="space-y-3">
                <span className="font-mono font-medium text-[11px] text-muted uppercase tracking-wide">
                  Install
                </span>
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-input"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <code className="font-mono text-[13px] text-foreground truncate flex-1 select-all" title="bash <(curl -fsSL https://raw.githubusercontent.com/samhayek-code/sc2-claude-hooks/main/install.sh)">
                    bash &lt;(curl -fsSL https://raw.githubusercontent.com/samhayek-code/sc2-claude-hooks/main/install.sh)
                  </code>
                  <button
                    onClick={() => handleCopyInstall('bash <(curl -fsSL https://raw.githubusercontent.com/samhayek-code/sc2-claude-hooks/main/install.sh)')}
                    className="shrink-0 px-3 py-1.5 font-mono text-[12px] font-medium rounded-chip press transition-all"
                    style={{
                      background: copied ? 'var(--foreground)' : 'var(--cta-bg)',
                      border: '1px solid',
                      borderColor: copied ? 'var(--foreground)' : 'var(--border)',
                      color: copied ? 'var(--background)' : 'var(--cta-text)',
                    }}
                    onMouseEnter={(e) => {
                      if (!copied) {
                        e.currentTarget.style.background = 'var(--cta-hover-bg)'
                        e.currentTarget.style.borderColor = 'var(--cta-hover-border)'
                        e.currentTarget.style.color = 'var(--cta-hover-text)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!copied) {
                        e.currentTarget.style.background = 'var(--cta-bg)'
                        e.currentTarget.style.borderColor = 'var(--border)'
                        e.currentTarget.style.color = 'var(--cta-text)'
                      }
                    }}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* How it works */}
              <div className="space-y-3">
                <span className="font-mono font-medium text-[11px] text-muted uppercase tracking-wide">
                  How it works
                </span>
                <ol className="space-y-2 font-sans text-[15px]" style={{ color: 'var(--modal-text-tertiary)' }}>
                  <li className="flex gap-3">
                    <span className="font-mono text-[13px] text-muted shrink-0">1.</span>
                    <span>Run the command above in Terminal</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono text-[13px] text-muted shrink-0">2.</span>
                    <span>Pick your faction (Terran, Protoss, or Zerg)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono text-[13px] text-muted shrink-0">3.</span>
                    <span>Start a new Claude Code session and you&rsquo;ll hear it</span>
                  </li>
                </ol>
              </div>

              {/* Events preview */}
              <div
                className="p-4 font-mono text-[12px] leading-relaxed rounded-input"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--modal-text-tertiary)',
                }}
              >
                <div className="text-muted mb-2">Events</div>
                <div className="pl-4 space-y-0.5">
                  <div><span className="text-muted">Session starts →</span> {'"Battlecruiser operational"'}</div>
                  <div><span className="text-muted">Task completes →</span> {'"Evolution complete"'}</div>
                  <div><span className="text-muted">Needs permission →</span> {'"Nuclear launch detected"'}</div>
                  <div><span className="text-muted">Error occurs →</span> {'"Not enough minerals"'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Halo Audio-Hooks */}
          {isHalo && (
            <div className="space-y-6 mb-8">
              {/* Subtitle */}
              <p className="font-sans text-[15px]" style={{ color: 'var(--modal-text-tertiary)' }}>
                Halo voice lines for Claude Code.
              </p>

              {/* Main description */}
              <p className="font-sans text-[17px] leading-relaxed" style={{ color: 'var(--modal-text-secondary)' }}>
                Hooks into four Claude Code events and plays a random Halo line — a greeting when a session starts, a confirmation when a task finishes, a prompt when permission is needed, and a reaction when a command errors out.
              </p>
              <p className="font-sans text-[17px] leading-relaxed" style={{ color: 'var(--modal-text-secondary)' }}>
                Three voices — Cortana, 343 Guilty Spark, and Sergeant Johnson — switchable anytime. ~175 lines across the three, picked at random so it never gets repetitive.
              </p>
              <p className="font-sans text-[17px] leading-relaxed" style={{ color: 'var(--modal-text-secondary)' }}>
                The clips are pulled straight from the games, so they arrived with baggage — an in-game radio ping and a spoken soundboard watermark before every line. A small Python pipeline (numpy + ffmpeg) clusters the recurring ping variants by cross-correlation, trims each clip to where the voice actually begins, adds a fast fade-in, and de-dupes — without ever clipping the first word.
              </p>
              <p className="font-sans text-[15px] leading-relaxed" style={{ color: 'var(--modal-text-tertiary)' }}>
                macOS only.
              </p>

              {/* Install command */}
              <div className="space-y-3">
                <span className="font-mono font-medium text-[11px] text-muted uppercase tracking-wide">
                  Install
                </span>
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-input"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <code className="font-mono text-[13px] text-foreground truncate flex-1 select-all" title="bash <(curl -fsSL https://raw.githubusercontent.com/samhayek-code/halo-audio-hooks/main/install.sh)">
                    bash &lt;(curl -fsSL https://raw.githubusercontent.com/samhayek-code/halo-audio-hooks/main/install.sh)
                  </code>
                  <button
                    onClick={() => handleCopyInstall('bash <(curl -fsSL https://raw.githubusercontent.com/samhayek-code/halo-audio-hooks/main/install.sh)')}
                    className="shrink-0 px-3 py-1.5 font-mono text-[12px] font-medium rounded-chip press transition-all"
                    style={{
                      background: copied ? 'var(--foreground)' : 'var(--cta-bg)',
                      border: '1px solid',
                      borderColor: copied ? 'var(--foreground)' : 'var(--border)',
                      color: copied ? 'var(--background)' : 'var(--cta-text)',
                    }}
                    onMouseEnter={(e) => {
                      if (!copied) {
                        e.currentTarget.style.background = 'var(--cta-hover-bg)'
                        e.currentTarget.style.borderColor = 'var(--cta-hover-border)'
                        e.currentTarget.style.color = 'var(--cta-hover-text)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!copied) {
                        e.currentTarget.style.background = 'var(--cta-bg)'
                        e.currentTarget.style.borderColor = 'var(--border)'
                        e.currentTarget.style.color = 'var(--cta-text)'
                      }
                    }}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* How it works */}
              <div className="space-y-3">
                <span className="font-mono font-medium text-[11px] text-muted uppercase tracking-wide">
                  How it works
                </span>
                <ol className="space-y-2 font-sans text-[15px]" style={{ color: 'var(--modal-text-tertiary)' }}>
                  <li className="flex gap-3">
                    <span className="font-mono text-[13px] text-muted shrink-0">1.</span>
                    <span>Run the command above in Terminal</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono text-[13px] text-muted shrink-0">2.</span>
                    <span>Pick your voice (Cortana, Guilty Spark, or Johnson)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono text-[13px] text-muted shrink-0">3.</span>
                    <span>Start a new Claude Code session and you&rsquo;ll hear it</span>
                  </li>
                </ol>
              </div>

              {/* Events preview */}
              <div
                className="p-4 font-mono text-[12px] leading-relaxed rounded-input"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--modal-text-tertiary)',
                }}
              >
                <div className="text-muted mb-2">Events</div>
                <div className="pl-4 space-y-0.5">
                  <div><span className="text-muted">Session starts →</span> {'"Wake me when you need me"'}</div>
                  <div><span className="text-muted">Task completes →</span> {'"I love me some me"'}</div>
                  <div><span className="text-muted">Needs permission →</span> {'"I need you to make a decision"'}</div>
                  <div><span className="text-muted">Error occurs →</span> {'"We\'re all gonna die!"'}</div>
                </div>
              </div>

              {/* Light link to SC2 */}
              <p className="font-sans text-[15px] leading-relaxed" style={{ color: 'var(--modal-text-tertiary)' }}>
                Prefer sci-fi RTS? There&rsquo;s a{' '}
                <a href="/tools/sc2-audio-hooks" className="underline underline-offset-2 hover:opacity-70 transition-opacity" style={{ color: 'var(--modal-text-secondary)' }}>StarCraft 2 set</a>{' '}too.
              </p>
            </div>
          )}

          {/* Tiberian Sun Audio-Hooks */}
          {isTiberianSun && (
            <div className="space-y-6 mb-8">
              {/* Subtitle */}
              <p className="font-sans text-[15px]" style={{ color: 'var(--modal-text-tertiary)' }}>
                Tiberian Sun EVA, CABAL, and unit voices for Claude Code.
              </p>

              {/* Main description */}
              <p className="font-sans text-[17px] leading-relaxed" style={{ color: 'var(--modal-text-secondary)' }}>
                Hooks into four Claude Code events and plays a random Tiberian Sun line — a boot-up when a session starts, a confirmation when a task finishes, a prompt when permission&rsquo;s needed, and a reaction when a command errors out.
              </p>
              <p className="font-sans text-[17px] leading-relaxed" style={{ color: 'var(--modal-text-secondary)' }}>
                Each faction blends its announcer with its unit voices, the way the game layers them — GDI&rsquo;s EVA and her infantry, Nod&rsquo;s CABAL and his cyborgs. 80 lines across the two packs, fired at random, switchable anytime.
              </p>
              <p className="font-sans text-[17px] leading-relaxed" style={{ color: 'var(--modal-text-secondary)' }}>
                The interesting part: these aren&rsquo;t soundboard rips, they&rsquo;re the original game audio. Pulling it on macOS meant cracking Westwood&rsquo;s MIX archive format by hand, reversing the filename hash to recover names, decoding the Westwood ADPCM with ffmpeg, then transcribing every voice line with whisper so the right ones land in the right event.
              </p>
              <p className="font-sans text-[15px] leading-relaxed" style={{ color: 'var(--modal-text-tertiary)' }}>
                macOS only.
              </p>

              {/* Install command */}
              <div className="space-y-3">
                <span className="font-mono font-medium text-[11px] text-muted uppercase tracking-wide">
                  Install
                </span>
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-input"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <code className="font-mono text-[13px] text-foreground truncate flex-1 select-all" title="bash <(curl -fsSL https://raw.githubusercontent.com/samhayek-code/tiberian-sun-audio-hooks/main/install.sh)">
                    bash &lt;(curl -fsSL https://raw.githubusercontent.com/samhayek-code/tiberian-sun-audio-hooks/main/install.sh)
                  </code>
                  <button
                    onClick={() => handleCopyInstall('bash <(curl -fsSL https://raw.githubusercontent.com/samhayek-code/tiberian-sun-audio-hooks/main/install.sh)')}
                    className="shrink-0 px-3 py-1.5 font-mono text-[12px] font-medium rounded-chip press transition-all"
                    style={{
                      background: copied ? 'var(--foreground)' : 'var(--cta-bg)',
                      border: '1px solid',
                      borderColor: copied ? 'var(--foreground)' : 'var(--border)',
                      color: copied ? 'var(--background)' : 'var(--cta-text)',
                    }}
                    onMouseEnter={(e) => {
                      if (!copied) {
                        e.currentTarget.style.background = 'var(--cta-hover-bg)'
                        e.currentTarget.style.borderColor = 'var(--cta-hover-border)'
                        e.currentTarget.style.color = 'var(--cta-hover-text)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!copied) {
                        e.currentTarget.style.background = 'var(--cta-bg)'
                        e.currentTarget.style.borderColor = 'var(--border)'
                        e.currentTarget.style.color = 'var(--cta-text)'
                      }
                    }}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* How it works */}
              <div className="space-y-3">
                <span className="font-mono font-medium text-[11px] text-muted uppercase tracking-wide">
                  How it works
                </span>
                <ol className="space-y-2 font-sans text-[15px]" style={{ color: 'var(--modal-text-tertiary)' }}>
                  <li className="flex gap-3">
                    <span className="font-mono text-[13px] text-muted shrink-0">1.</span>
                    <span>Run the command above in Terminal</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono text-[13px] text-muted shrink-0">2.</span>
                    <span>Pick your faction (GDI or NOD)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono text-[13px] text-muted shrink-0">3.</span>
                    <span>Start a new Claude Code session and you&rsquo;ll hear it</span>
                  </li>
                </ol>
              </div>

              {/* Events preview */}
              <div
                className="p-4 font-mono text-[12px] leading-relaxed rounded-input"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--modal-text-tertiary)',
                }}
              >
                <div className="text-muted mb-2">Events</div>
                <div className="pl-4 space-y-0.5">
                  <div><span className="text-muted">Session starts →</span> {'"Establishing Battlefield Control. Stand by."'}</div>
                  <div><span className="text-muted">Task completes →</span> {'"Construction complete"'}</div>
                  <div><span className="text-muted">Needs permission →</span> {'"Awaiting orders"'} <span className="text-muted">(unit)</span></div>
                  <div><span className="text-muted">Error occurs →</span> {'"Prepare for sterilization"'} <span className="text-muted">(CABAL)</span></div>
                </div>
              </div>

              {/* Light link to the other sets */}
              <p className="font-sans text-[15px] leading-relaxed" style={{ color: 'var(--modal-text-tertiary)' }}>
                Two more in the set — the{' '}
                <a href="/code/halo-audio-hooks" className="underline underline-offset-2 hover:opacity-70 transition-opacity" style={{ color: 'var(--modal-text-secondary)' }}>Halo</a>{' '}and{' '}
                <a href="/code/sc2-audio-hooks" className="underline underline-offset-2 hover:opacity-70 transition-opacity" style={{ color: 'var(--modal-text-secondary)' }}>StarCraft 2</a>{' '}voices.
              </p>
            </div>
          )}

          {/* Resume */}
          {isResume && (
            <div className="space-y-8 mb-8">
              {/* Tagline */}
              <p className="font-sans text-[15px] italic" style={{ color: 'var(--modal-text-tertiary)' }}>
                I translate founder vision into scalable design systems — and increasingly ship my own code.
              </p>

              {/* Contact Info */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-[14px]" style={{ color: 'var(--modal-text-secondary)' }}>
                <span className="font-mono">(760) 884-6224</span>
                <span style={{ color: 'var(--border)' }}>·</span>
                <a href="mailto:yo@samhayek.com" className="hover:text-foreground transition-colors">yo@samhayek.com</a>
                <span style={{ color: 'var(--border)' }}>·</span>
                <a href="https://samhayek.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">samhayek.com</a>
                <span style={{ color: 'var(--border)' }}>·</span>
                <a href="https://github.com/samhayek-code" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">github.com/samhayek-code</a>
              </div>

              {/* Experience Section */}
              <div className="space-y-6">
                <h3 className="font-mono font-medium text-[11px] text-muted uppercase tracking-wide border-b border-border pb-2">
                  Experience
                </h3>

                {/* Job: Fathom */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                    <h4 className="font-sans text-[16px] font-medium text-foreground">Brand & Marketing Lead · Fathom Plumbing Solutions</h4>
                    <span className="font-mono text-[12px] text-muted shrink-0">Jan 2026 – Present</span>
                  </div>
                  <p className="font-sans text-[14px] leading-relaxed" style={{ color: 'var(--modal-text-tertiary)' }}>
                    Leading end-to-end brand transformation for a commercial plumbing company, from strategy through execution across all touchpoints.
                  </p>
                  <ul className="space-y-1.5 text-[14px]" style={{ color: 'var(--modal-text-secondary)' }}>
                    <li className="flex gap-2"><span className="text-muted">·</span><span>Developing comprehensive brand identity system with governance guidelines for consistency at scale</span></li>
                    <li className="flex gap-2"><span className="text-muted">·</span><span>Designing conversion-focused website with lead capture architecture, booking flows, and analytics integration</span></li>
                    <li className="flex gap-2"><span className="text-muted">·</span><span>Creating complete collateral package: business cards, vehicle wraps, signage, apparel, and sales materials</span></li>
                    <li className="flex gap-2"><span className="text-muted">·</span><span>Building social media launch kit with video content, branded graphics, and platform strategy</span></li>
                  </ul>
                </div>

                {/* Job: Freelance */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                    <h4 className="font-sans text-[16px] font-medium text-foreground">Designer · Freelance</h4>
                    <span className="font-mono text-[12px] text-muted shrink-0">Nov 2023 – Dec 2025</span>
                  </div>
                  <p className="font-sans text-[14px] leading-relaxed" style={{ color: 'var(--modal-text-tertiary)' }}>
                    Delivered brand identities, websites, and product design for early-stage companies across Web3, health, and consumer sectors.
                  </p>
                  <ul className="space-y-1.5 text-[14px]" style={{ color: 'var(--modal-text-secondary)' }}>
                    <li className="flex gap-2"><span className="text-muted">·</span><span><strong className="text-foreground">Parallel</strong> — Full brand identity and product design for AI video editing tool</span></li>
                    <li className="flex gap-2"><span className="text-muted">·</span><span><strong className="text-foreground">GasHawk</strong> — Website design (gashawk.io) for Ethereum gas optimization platform</span></li>
                    <li className="flex gap-2"><span className="text-muted">·</span><span><strong className="text-foreground">ChargedParticles</strong> — Designed websites and product interfaces for Web3 Packs and Phoenix Guild</span></li>
                    <li className="flex gap-2"><span className="text-muted">·</span><span><strong className="text-foreground">Fanfly</strong> — Complete UX/UI design and branding for Web3 music livestreaming mobile app</span></li>
                    <li className="flex gap-2"><span className="text-muted">·</span><span><strong className="text-foreground">Project Legacy</strong> — Brand identity, landing page, custom icon system, and sales materials</span></li>
                  </ul>
                </div>

                {/* Job: Headphone Homies */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                    <h4 className="font-sans text-[16px] font-medium text-foreground">Founder · Headphone Homies</h4>
                    <span className="font-mono text-[12px] text-muted shrink-0">Mar 2022 – Sep 2023</span>
                  </div>
                  <p className="font-sans text-[14px] leading-relaxed" style={{ color: 'var(--modal-text-tertiary)' }}>
                    Built the brand and led creative direction for a Web3 music collective from concept through launch.
                  </p>
                  <ul className="space-y-1.5 text-[14px]" style={{ color: 'var(--modal-text-secondary)' }}>
                    <li className="flex gap-2"><span className="text-muted">·</span><span>Created complete brand system and designed mint site using React and Polygon blockchain</span></li>
                    <li className="flex gap-2"><span className="text-muted">·</span><span>Grew community to 20K followers on X and 3K members on Discord</span></li>
                    <li className="flex gap-2"><span className="text-muted">·</span><span>Secured partnerships with Polygon, Decent, Magic Eden, and Unchained Music</span></li>
                    <li className="flex gap-2"><span className="text-muted">·</span><span>Hosted weekly X Spaces with up to 300 live listeners; generated $3K in NFT sales</span></li>
                  </ul>
                </div>

                {/* Job: Web3 Music Platforms */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                    <h4 className="font-sans text-[16px] font-medium text-foreground">Designer & Community Lead · Web3 Music Platforms</h4>
                    <span className="font-mono text-[12px] text-muted shrink-0">2021 – 2022</span>
                  </div>
                  <p className="font-sans text-[14px] leading-relaxed" style={{ color: 'var(--modal-text-tertiary)' }}>
                    Marketing design and community management for leading Web3 music startups during rapid growth phase.
                  </p>
                  <ul className="space-y-1.5 text-[14px]" style={{ color: 'var(--modal-text-secondary)' }}>
                    <li className="flex gap-2"><span className="text-muted">·</span><span><strong className="text-foreground">Audius</strong> (2021) — Created social content and managed community as platform grew from 3M to 6M monthly users and announced TikTok partnership</span></li>
                    <li className="flex gap-2"><span className="text-muted">·</span><span><strong className="text-foreground">Sound.xyz</strong> (2022) — Supported community growth for a16z-backed music NFT platform during closed beta</span></li>
                    <li className="flex gap-2"><span className="text-muted">·</span><span><strong className="text-foreground">WvrpSound</strong> (2022) — Marketing design and community management for Authentic Artists subsidiary</span></li>
                  </ul>
                </div>

                {/* Job: Pro2tect */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                    <h4 className="font-sans text-[16px] font-medium text-foreground">Designer · Pro2tect</h4>
                    <span className="font-mono text-[12px] text-muted shrink-0">2021</span>
                  </div>
                  <p className="font-sans text-[14px] leading-relaxed" style={{ color: 'var(--modal-text-tertiary)' }}>
                    Brand identity and creative direction for an ocean conservation nonprofit. Delivered full brand system including logo, website, merchandise designs, and social content.
                  </p>
                </div>

                {/* Job: Enhnvce Labs */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                    <h4 className="font-sans text-[16px] font-medium text-foreground">Designer · Enhnvce Labs</h4>
                    <span className="font-mono text-[12px] text-muted shrink-0">2020</span>
                  </div>
                  <p className="font-sans text-[14px] leading-relaxed" style={{ color: 'var(--modal-text-tertiary)' }}>
                    Brand identity and packaging design for a supplement startup, from concept through production. Designed branding and product labels for full lineup: protein, nootropics, sleep, immune, and coffee.
                  </p>
                </div>

                {/* Job: Growtheory */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                    <h4 className="font-sans text-[16px] font-medium text-foreground">Founder · Growtheory</h4>
                    <span className="font-mono text-[12px] text-muted shrink-0">2015 – 2017</span>
                  </div>
                  <p className="font-sans text-[14px] leading-relaxed" style={{ color: 'var(--modal-text-tertiary)' }}>
                    Founded a community focused on consciousness and creativity. Built brand identity, content strategy, website, and apparel line. Grew Instagram community to 3,500 organic followers.
                  </p>
                </div>
              </div>

              {/* Projects Section */}
              <div className="space-y-6">
                <h3 className="font-mono font-medium text-[11px] text-muted uppercase tracking-wide border-b border-border pb-2">
                  Projects
                </h3>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="font-sans text-[15px] font-medium text-foreground">OASIS</h4>
                    <p className="font-sans text-[14px]" style={{ color: 'var(--modal-text-secondary)' }}>
                      macOS utility that automatically organizes Downloads into a clean daily/weekly/monthly hierarchy with file categorization.
                    </p>
                    <a href="https://github.com/samhayek-code/OASIS" target="_blank" rel="noopener noreferrer" className="font-mono text-[12px] text-muted hover:text-foreground transition-colors">
                      github.com/samhayek-code/OASIS
                    </a>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-sans text-[15px] font-medium text-foreground">Baseline Grid Generator</h4>
                    <p className="font-sans text-[14px]" style={{ color: 'var(--modal-text-secondary)' }}>
                      Design tool for generating customizable grid overlays with multiple canvas presets, line styles, and PNG/SVG export.
                    </p>
                    <a href="https://baselinegrids.netlify.app" target="_blank" rel="noopener noreferrer" className="font-mono text-[12px] text-muted hover:text-foreground transition-colors">
                      baselinegrids.netlify.app
                    </a>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-sans text-[15px] font-medium text-foreground">samhayek.com</h4>
                    <p className="font-sans text-[14px]" style={{ color: 'var(--modal-text-secondary)' }}>
                      Personal portfolio built with Next.js and Sanity CMS.
                    </p>
                    <a href="https://github.com/samhayek-code/samhayek-site" target="_blank" rel="noopener noreferrer" className="font-mono text-[12px] text-muted hover:text-foreground transition-colors">
                      github.com/samhayek-code/samhayek-site
                    </a>
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              <div className="space-y-4">
                <h3 className="font-mono font-medium text-[11px] text-muted uppercase tracking-wide border-b border-border pb-2">
                  Skills
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[14px]">
                  <div>
                    <span className="font-medium text-foreground">Design</span>
                    <span className="text-muted"> — </span>
                    <span style={{ color: 'var(--modal-text-secondary)' }}>Brand Identity, Design Systems, Art Direction, UX/UI, Prototyping, Visual Design</span>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Tools</span>
                    <span className="text-muted"> — </span>
                    <span style={{ color: 'var(--modal-text-secondary)' }}>Figma, Flora, Procreate, Pencil, Framer, Adobe, Paper, Jitter, Spline</span>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Code</span>
                    <span className="text-muted"> — </span>
                    <span style={{ color: 'var(--modal-text-secondary)' }}>HTML, CSS, JavaScript, React, Next.js</span>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Growth</span>
                    <span className="text-muted"> — </span>
                    <span style={{ color: 'var(--modal-text-secondary)' }}>Community Management, Content Strategy, Copywriting, Social Media</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gallery display - full-width images with lightbox (Art, Design) */}
          {isGalleryType && (() => {
            // Build array of all images for lightbox navigation
            const allImages: { src: string; alt: string; thumbnail: string }[] = []
            // Skip cover image for pro2tect — card uses an edited version, first gallery slide is the real one
            if (item.coverImage && item.slug?.current !== 'pro2tect') {
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
                    className="relative w-full cursor-zoom-in group rounded-card overflow-hidden img-outline"
                    onClick={() => openLightbox(i)}
                  >
                    <Image
                      src={image.thumbnail}
                      alt={image.alt}
                      width={1600}
                      height={1600}
                      className="w-full h-auto"
                      style={{ maxHeight: '70vh', objectFit: 'contain' }}
                    />
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors flex items-center justify-center">
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
              {/* Crossfade wrapper — opacity dips when displayedIndex changes */}
              <div
                style={{
                  opacity: collectionFade ? 1 : 0,
                  transition: 'opacity 0.18s ease-out',
                }}
              >
                {/* Intro screen */}
                {displayedIndex === -1 && (
                  <div className="text-center py-4">
                    <p className="font-sans text-[17px] leading-relaxed max-w-lg mx-auto" style={{ color: 'var(--modal-text-secondary)' }}>
                      {item.description}
                    </p>
                  </div>
                )}

                {/* Individual pieces */}
                {displayedIndex >= 0 && displayedIndex < totalPieces && (() => {
                  const piece = collectionPieces[displayedIndex]
                  return (
                    <div className="space-y-6">
                      {/* Piece image */}
                      {piece.image && (
                        <div className="relative w-full rounded-card overflow-hidden img-outline">
                          <Image
                            src={urlFor(piece.image).width(1600).quality(90).url()}
                            alt={piece.title}
                            width={1600}
                            height={1600}
                            className="w-full h-auto"
                            style={{ maxHeight: '50vh', objectFit: 'contain' }}
                          />
                        </div>
                      )}

                      {/* Navigation between image and text */}
                      <div className="flex items-center justify-between py-4 border-y border-border">
                        <button
                          onClick={goPrevCollection}
                          disabled={collectionIndex === 0}
                          className="flex items-center gap-2 px-3 py-1.5 font-sans text-sm text-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 18l-6-6 6-6" />
                          </svg>
                          Prev
                        </button>

                        <div className="font-mono font-medium text-xs text-subtle">
                          {collectionIndex + 1} / {totalPieces}
                        </div>

                        <button
                          onClick={goNextCollection}
                          disabled={collectionIndex === totalPieces - 1 && !hasMerch}
                          className="flex items-center gap-2 px-3 py-1.5 font-sans text-sm text-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          {collectionIndex === totalPieces - 1 && hasMerch ? 'Collection' : 'Next'}
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </button>
                      </div>

                      {/* Piece title */}
                      <h3 className="font-display text-[22px] font-medium tracking-[-0.02em] text-foreground text-center">
                        {piece.title}
                      </h3>

                      {/* Poem text */}
                      {piece.poemText && (
                        <div className="max-w-md mx-auto">
                          <p className="font-sans text-[17px] leading-[1.8] whitespace-pre-line text-center" style={{ color: 'var(--modal-text-tertiary)' }}>
                            {piece.poemText}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })()}

                {/* Merch grid */}
                {displayedIndex === totalPieces && hasMerch && (
                  <div className="space-y-6">
                    <h3 className="font-display text-[22px] font-medium tracking-[-0.02em] text-foreground text-center">
                      The Collection
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {item.merchGallery!.map((image, i) => (
                        <div key={i} className="aspect-square relative overflow-hidden rounded-card img-outline" style={{ background: 'var(--modal-surface)' }}>
                          <Image
                            src={urlFor(image).width(600).height(600).url()}
                            alt={`Merch ${i + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    {/* Back button for merch */}
                    <div className="flex justify-center pt-4">
                      <button
                        onClick={goPrevCollection}
                        className="flex items-center gap-2 px-4 py-2 font-sans text-sm text-muted hover:text-foreground transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                        Back to poems
                      </button>
                    </div>
                  </div>
                )}
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
                    className="p-4 rounded-card shadow-pop"
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
                      className=""
                    />
                    <div className="text-center mt-2 font-mono font-medium text-xs text-muted">
                      {activeQR.currency}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Body (rich text) - hide for Support card and Resume */}
          {item.body && item.body.length > 0 && !isSupport && !isResume && !isHalo && !isTiberianSun && (
            <div className="prose prose-base max-w-full w-full mb-8 overflow-hidden break-words [&>p]:mb-4 [&>p]:leading-relaxed [&>p]:text-[17px] [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:opacity-70 [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_h4]:text-foreground [&_strong]:text-foreground [&_code]:text-foreground [&_blockquote]:text-muted [&_blockquote]:border-border" style={{ color: 'var(--modal-text-body)' }}>
              <PortableText value={item.body} components={portableTextComponents} />
            </div>
          )}

          {/* Contact form — sends via Resend API */}
          {isContactForm && (
            <div className="mb-8">
              <ContactForm />
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

          {/* Media embed (Spotify, YouTube, Audius, etc.) */}
          {item.embedUrl && (() => {
            const embed = getEmbedUrl(item.embedUrl)
            const height = embed.type === 'audius' ? '480' : embed.type === 'youtube' ? '315' : '152'
            return (
              <div className="mb-8">
                <iframe
                  src={embed.src}
                  width="100%"
                  height={height}
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className=""
                  style={{ borderRadius: 'var(--radius-card)' }}
                />
              </div>
            )
          })()}

          {/* MUX Video Player (skip for case studies — rendered in case study block above) */}
          {!isCaseStudy && item.muxVideo?.asset?.playbackId && (
            <div className="mb-8 rounded-card overflow-hidden">
              <MuxPlayer
                playbackId={item.muxVideo.asset.playbackId}
                streamType="on-demand"
                accentColor="#ffffff"
                style={{
                  width: '100%',
                  maxHeight: '70vh',
                  borderRadius: 'var(--radius-card)',
                  aspectRatio: '16/9'
                }}
              />
            </div>
          )}

          {/* Figma embed (skip for case studies — rendered in case study block above) */}
          {!isCaseStudy && item.figmaUrl && (
            <div className="mb-8">
              <iframe
                src={`https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(item.figmaUrl)}`}
                width="100%"
                height="500"
                allowFullScreen
                className="border border-border rounded-card"
                style={{ background: 'var(--background)' }}
              />
            </div>
          )}

          {/* Gallery - for non-gallery types (Art/Design handle gallery separately above) */}
          {!isGalleryType && item.gallery && item.gallery.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-8">
              {item.gallery.map((image, i) => (
                <div key={i} className="aspect-square relative overflow-hidden rounded-card img-outline" style={{ background: 'var(--modal-surface)' }}>
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

          {/* Whop Checkout Embed */}
          {showWhopCheckout && item.whopPlanId && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-[20px] font-medium tracking-[-0.02em] text-foreground">Checkout</h3>
                <button
                  onClick={() => setShowWhopCheckout(false)}
                  className="text-muted hover:text-foreground transition-colors text-[16px]"
                >
                  Back
                </button>
              </div>
              <iframe
                src={getWhopCheckoutUrl(item.whopPlanId)}
                style={{
                  width: '100%',
                  minHeight: '900px',
                  height: 'auto',
                  border: 'none',
                  borderRadius: 'var(--radius-card)',
                }}
                allow="payment; clipboard-write"
                sandbox="allow-forms allow-modals allow-popups allow-same-origin allow-scripts allow-top-navigation"
              />
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between items-center pt-6 border-t border-border">
            {item.price ? (
              <span className="font-mono font-medium text-[20px] text-foreground">
                {item.price}
              </span>
            ) : (
              <span />
            )}

            <div className="flex gap-3 items-center">
              <button
                onClick={handleClose}
                className="px-5 py-3 font-sans text-[16px] font-medium text-muted border border-border rounded-btn press hover:border-border-hover hover:text-foreground transition-colors"
              >
                Close
              </button>
              {/* View Prototype button */}
              {item.prototypeUrl && (
                <a
                  href={item.prototypeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 font-mono text-[12px] font-bold uppercase tracking-wider text-white rounded-btn press hover:opacity-80 transition-opacity"
                  style={{ background: colors.dot }}
                >
                  View Prototype
                </a>
              )}
              {/* Oasis GitHub link */}
              {isOasis && (
                <a
                  href="https://github.com/samhayek-code/OASIS"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 font-mono text-[12px] font-bold uppercase tracking-wider text-white rounded-btn press hover:opacity-80 transition-opacity"
                  style={{ background: colors.dot }}
                >
                  View on GitHub
                </a>
              )}
              {/* SC2 GitHub link */}
              {isSC2 && (
                <a
                  href="https://github.com/samhayek-code/sc2-claude-hooks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 font-mono text-[12px] font-bold uppercase tracking-wider text-white rounded-btn press hover:opacity-80 transition-opacity"
                  style={{ background: colors.dot }}
                >
                  View on GitHub
                </a>
              )}
              {/* Tiberian Sun GitHub link */}
              {isTiberianSun && (
                <a
                  href="https://github.com/samhayek-code/tiberian-sun-audio-hooks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 font-mono text-[12px] font-bold uppercase tracking-wider text-white rounded-btn press hover:opacity-80 transition-opacity"
                  style={{ background: colors.dot }}
                >
                  View on GitHub
                </a>
              )}
              {/* Case study: View Figma button */}
              {isCaseStudy && item.figmaUrl && (
                <a
                  href={item.figmaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 font-mono text-[12px] font-bold uppercase tracking-wider text-white rounded-btn press hover:opacity-80 transition-opacity"
                  style={{ background: colors.dot }}
                >
                  View Figma
                </a>
              )}
              {/* Case study: View the full live case study site */}
              {isCaseStudy && item.externalUrl && (
                <a
                  href={item.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 font-mono text-[12px] font-bold uppercase tracking-wider text-white rounded-btn press hover:opacity-80 transition-opacity"
                  style={{ background: colors.dot }}
                >
                  View Live Case Study
                </a>
              )}
              {/* Case study: visit the live production site */}
              {isCaseStudy && liveUrl && (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 font-mono text-[12px] font-bold uppercase tracking-wider text-white rounded-btn press hover:opacity-80 transition-opacity"
                  style={{ background: colors.dot }}
                >
                  Visit Live Site
                </a>
              )}
              {/* Resume download button */}
              {isResume && (
                <a
                  href="/Sam-Hayek-Resume-2026.pdf"
                  download="Sam-Hayek-Resume-2026.pdf"
                  className="px-6 py-3 font-mono text-[12px] font-bold uppercase tracking-wider text-white rounded-btn press hover:opacity-80 transition-opacity"
                  style={{ background: colors.dot }}
                >
                  Download PDF
                </a>
              )}
              {/* View button for collection intro */}
              {isCollection && collectionIndex === -1 && (
                <button
                  onClick={goNextCollection}
                  className="px-6 py-3 font-mono text-[12px] font-bold uppercase tracking-wider text-white rounded-btn press hover:opacity-80 transition-opacity"
                  style={{ background: colors.dot }}
                >
                  View
                </button>
              )}
              {!hideCtaButton && !showWhopCheckout && (
                item.whopPlanId ? (
                  <button
                    onClick={() => setShowWhopCheckout(true)}
                    className="px-6 py-3 font-mono text-[12px] font-bold uppercase tracking-wider text-white rounded-btn press hover:opacity-80 transition-opacity"
                    style={{ background: colors.dot }}
                  >
                    {item.cta}
                  </button>
                ) : item.lemonSqueezyUrl ? (
                  <a
                    href={item.lemonSqueezyUrl}
                    onClick={handleLemonSqueezyClick}
                    className="lemonsqueezy-button px-6 py-3 font-mono text-[12px] font-bold uppercase tracking-wider text-white hover:opacity-80 transition-opacity"
                    style={{ background: colors.dot }}
                  >
                    {item.cta}
                  </a>
                ) : (
                  <button
                    onClick={handleAction}
                    className="px-6 py-3 font-mono text-[12px] font-bold uppercase tracking-wider text-white rounded-btn press hover:opacity-80 transition-opacity"
                    style={{ background: colors.dot }}
                  >
                    {item.cta}
                  </button>
                )
              )}
            </div>
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
