'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import dynamic from 'next/dynamic'
import { ArchiveItem, typeColors } from '@/lib/types'
import { categoryIcons } from '@/lib/categoryIcons'
import { urlFor } from '@/lib/sanity'
import WalletButton from './WalletButton'
import CaseStudyContent from './CaseStudyContent'
import ContactForm from './ContactForm'

// Lazy-load the heavy Mux player — only fetched for items that actually have video
const MuxPlayer = dynamic(() => import('@mux/mux-player-react'), { ssr: false })

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
      const raw = (value?.href || '').trim()
      // Allow only safe schemes — blocks javascript:/data: hrefs from the CMS
      const href = /^(https?:|mailto:|tel:|\/|#)/i.test(raw) ? raw : ''
      const isExternal = href.startsWith('http')
      return (
        <a
          href={href || undefined}
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
  const lightboxRef = useRef<HTMLDivElement>(null)

  // Focus the lightbox once on open — NOT via an inline callback ref, which would
  // re-fire every render and yank focus off the prev/next buttons during navigation.
  useEffect(() => {
    lightboxRef.current?.focus()
  }, [])

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
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      tabIndex={-1}
      ref={lightboxRef}
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/95 cursor-zoom-out p-4 focus:outline-none"
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
            className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 p-3 text-white/60 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            aria-label="Previous image"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goNext() }}
            disabled={currentIndex === images.length - 1}
            className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 p-3 text-white/60 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
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
      // youtube.com/watch?v=VIDEO_ID — base + try/catch so a schemeless/malformed
      // URL can never throw out of render (no error boundary to catch it).
      try {
        videoId = new URL(url, 'https://www.youtube.com').searchParams.get('v') || ''
      } catch {
        videoId = ''
      }
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
  const CategoryIcon = categoryIcons[item.type] || categoryIcons.Everything
  const closingForCheckoutRef = useRef(false)
  const modalRef = useRef<HTMLDivElement>(null)
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

  // Focus management: focus the dialog on open, trap Tab inside, restore on close
  useEffect(() => {
    const prevFocused = document.activeElement as HTMLElement | null
    modalRef.current?.focus()
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const box = modalRef.current
      if (!box) return
      const focusables = box.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])'
      )
      if (!focusables.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleTab)
    return () => {
      document.removeEventListener('keydown', handleTab)
      prevFocused?.focus?.()
    }
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
  const isAudioHooks = item.slug?.current === 'audio-hooks'
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
  const hideCtaButton = isEmbedModal || isGalleryType || isSupport || isCollection || isWriting || isOasis || isAudioHooks || isResume || isCaseStudy

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
      // When the lightbox is open it owns Escape (closes itself only)
      if (e.key === 'Escape' && !lightboxState) handleClose()
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
    Cal("init", "design", { origin: "https://app.cal.com" })
    Cal.config = Cal.config || {}
    Cal.config.forwardQueryParams = true
    Cal.ns["design"]("inline", {
      elementOrSelector: "#my-cal-inline-design",
      config: { layout: "month_view", useSlotsViewOnSmallScreen: "true" },
      calLink: "samhayek/design",
    })
    Cal.ns["design"]("ui", { hideEventTypeDetails: false, layout: "month_view" })
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
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="max-w-[800px] w-full cursor-default rounded-modal overflow-hidden focus:outline-none"
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
                sizes="(min-width: 832px) 800px, 100vw"
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
              <CategoryIcon weight="fill" size={13} color={colors.dot} className="shrink-0" />
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
                      title={`${item.title} — Figma`}
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
          {!isCollection && !showWhopCheckout && !isOasis && !isAudioHooks && !isCaseStudy && (
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

          {/* Audio-Hooks */}
          {isAudioHooks && (
            <div className="space-y-6 mb-8">
              {/* Subtitle */}
              <p className="font-sans text-[15px]" style={{ color: 'var(--modal-text-tertiary)' }}>
                Your terminal, voiced by the games you grew up on.
              </p>

              {/* Short description */}
              <p className="font-sans text-[17px] leading-relaxed" style={{ color: 'var(--modal-text-secondary)' }}>
                Claude Code greets every session, announces your wins, calls for orders when it needs you, and sounds off when something breaks — so the work never feels quiet. Eight voices to choose from, switch whenever. <span style={{ color: 'var(--modal-text-tertiary)' }}>macOS only.</span>
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
                  <code className="font-mono text-[13px] text-foreground truncate flex-1 select-all" title="bash <(curl -fsSL https://raw.githubusercontent.com/samhayek-code/claude-audio-hooks/main/install.sh)">
                    bash &lt;(curl -fsSL https://raw.githubusercontent.com/samhayek-code/claude-audio-hooks/main/install.sh)
                  </code>
                  <button
                    onClick={() => handleCopyInstall('bash <(curl -fsSL https://raw.githubusercontent.com/samhayek-code/claude-audio-hooks/main/install.sh)')}
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
                    <span>Pick a starting voice — all eight install</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono text-[13px] text-muted shrink-0">3.</span>
                    <span>Start a new Claude Code session and you&rsquo;ll hear it</span>
                  </li>
                </ol>
              </div>

              {/* The packs */}
              <p className="font-sans text-[17px] leading-relaxed" style={{ color: 'var(--modal-text-secondary)' }}>
                Three franchises — StarCraft 2 (Terran, Protoss, Zerg), Halo (Cortana, 343 Guilty Spark, Sgt. Johnson), and Tiberian Sun (GDI&rsquo;s EVA, Nod&rsquo;s CABAL). Around 330 lines, picked at random; error sounds are smart-filtered so routine failures stay quiet.
              </p>

              {/* Packs table */}
              <div className="rounded-input overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-[12px]">
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <th className="text-left font-mono font-medium uppercase tracking-wide px-3 py-2" style={{ color: 'var(--muted)' }}>Pack</th>
                        <th className="text-left font-mono font-medium uppercase tracking-wide px-3 py-2" style={{ color: 'var(--muted)' }}>Franchise</th>
                        <th className="text-left font-mono font-medium uppercase tracking-wide px-3 py-2" style={{ color: 'var(--muted)' }}>Voices</th>
                        <th className="text-right font-mono font-medium uppercase tracking-wide px-3 py-2" style={{ color: 'var(--muted)' }}>Clips</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['terran', 'StarCraft 2', 'Terran advisor + units', '28'],
                        ['protoss', 'StarCraft 2', 'Protoss advisor + units', '23'],
                        ['zerg', 'StarCraft 2', 'Zerg advisor + creature sounds', '24'],
                        ['cortana', 'Halo', 'Cortana (Halo 2/3)', '80'],
                        ['guilty-spark', 'Halo', '343 Guilty Spark (Halo 3)', '48'],
                        ['sergeant-johnson', 'Halo', 'Sgt. Johnson', '47'],
                        ['gdi', 'Tiberian Sun', 'EVA announcer + GDI units', '40'],
                        ['nod', 'Tiberian Sun', 'CABAL + Nod units', '40'],
                      ].map(([pack, franchise, voices, clips], i) => (
                        <tr key={pack} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)' }}>
                          <td className="font-mono px-3 py-2 whitespace-nowrap" style={{ color: 'var(--modal-text-secondary)' }}>{pack}</td>
                          <td className="font-sans px-3 py-2 whitespace-nowrap" style={{ color: 'var(--modal-text-tertiary)' }}>{franchise}</td>
                          <td className="font-sans px-3 py-2" style={{ color: 'var(--modal-text-tertiary)' }}>{voices}</td>
                          <td className="font-mono tabular-nums text-right px-3 py-2" style={{ color: 'var(--modal-text-secondary)' }}>{clips}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <p className="font-sans text-[17px] leading-relaxed" style={{ color: 'var(--modal-text-secondary)' }}>
                The clips ship clean. Soundboard rips came with an in-game ping and a spoken watermark before each line — a numpy + ffmpeg pipeline finds the ping by cross-correlation and trims to the voice onset, never clipping the first word. The Tiberian Sun set is the original game audio, pulled on macOS by cracking Westwood&rsquo;s MIX format by hand.
              </p>

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
                  <div><span className="text-muted">Task completes →</span> {'"Construction complete"'}</div>
                  <div><span className="text-muted">Needs permission →</span> {'"Awaiting orders"'}</div>
                  <div><span className="text-muted">Error occurs →</span> {'"Not enough minerals"'}</div>
                </div>
              </div>

              {/* Switch voices hint */}
              <p className="font-sans text-[15px] leading-relaxed" style={{ color: 'var(--modal-text-tertiary)' }}>
                Switch anytime — run <code className="font-mono text-[13px]" style={{ color: 'var(--modal-text-secondary)' }}>set-faction.sh cortana</code> (or any of the eight packs), or just ask Claude to switch it for you.
              </p>

              {/* Customize note */}
              <p className="font-sans text-[15px] leading-relaxed" style={{ color: 'var(--modal-text-tertiary)' }}>
                Make it your own — drop any <code className="font-mono text-[13px]" style={{ color: 'var(--modal-text-secondary)' }}>.mp3</code> or <code className="font-mono text-[13px]" style={{ color: 'var(--modal-text-secondary)' }}>.m4a</code> into <code className="font-mono text-[13px]" style={{ color: 'var(--modal-text-secondary)' }}>~/.claude/sounds/&lt;pack&gt;/&lt;event&gt;/</code>, or add a whole new pack as its own folder. The picker finds them automatically.
              </p>
            </div>
          )}

          {/* Resume */}
          {isResume && (
            <div className="space-y-8 mb-8">
              {/* Tagline */}
              <p className="font-sans text-[15px] italic" style={{ color: 'var(--modal-text-tertiary)' }}>
                I help founders make their vision real; and I do it fast. 0 → 1, then 1 → 100 with design engineering, brand systems, and creative direction.
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

                {/* Job: Freelance */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                    <h4 className="font-sans text-[16px] font-medium text-foreground">Designer · Freelance</h4>
                    <span className="font-mono text-[12px] text-muted shrink-0">Feb 2024 – Present</span>
                  </div>
                  <p className="font-sans text-[14px] leading-relaxed" style={{ color: 'var(--modal-text-tertiary)' }}>
                    Brand identities, websites, and product design for early-stage companies across Web3, health, and consumer sectors.
                  </p>
                  <ul className="space-y-1.5 text-[14px]" style={{ color: 'var(--modal-text-secondary)' }}>
                    <li className="flex gap-2"><span className="text-muted">·</span><span><strong className="text-foreground">Arcarae</strong> — Brand expansion and visual design for an AI self-reflection app</span></li>
                    <li className="flex gap-2"><span className="text-muted">·</span><span><strong className="text-foreground">Parallel</strong> — Full brand identity and product design for an AI video editing tool</span></li>
                    <li className="flex gap-2"><span className="text-muted">·</span><span><strong className="text-foreground">GasHawk</strong> — Website design (gashawk.io) for an Ethereum gas optimization platform</span></li>
                    <li className="flex gap-2"><span className="text-muted">·</span><span><strong className="text-foreground">ChargedParticles</strong> — Websites and product interfaces for Web3 Packs and Phoenix Guild</span></li>
                    <li className="flex gap-2"><span className="text-muted">·</span><span><strong className="text-foreground">Fanfly</strong> — Complete UX/UI design and branding for a Web3 music livestreaming mobile app</span></li>
                    <li className="flex gap-2"><span className="text-muted">·</span><span><strong className="text-foreground">Project Legacy</strong> — Brand identity, landing page, custom icon system, and sales materials</span></li>
                    <li className="flex gap-2"><span className="text-muted">·</span><span><strong className="text-foreground">Additional clients</strong> — Winery brand/label, ops consulting site, plumbing company print assets, web3 gaming social posts</span></li>
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
                  <ul className="space-y-1.5 text-[14px]" style={{ color: 'var(--modal-text-secondary)' }}>
                    <li className="flex gap-2"><span className="text-muted">·</span><span><strong className="text-foreground">Audius</strong> (2021) — Created social content and managed community as the platform grew from 3M to 6M monthly users and announced a TikTok partnership</span></li>
                    <li className="flex gap-2"><span className="text-muted">·</span><span><strong className="text-foreground">Sound.xyz</strong> (2022) — Supported community growth for the a16z-backed music NFT platform during closed beta</span></li>
                  </ul>
                </div>

                {/* Job: Pro2tect */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                    <h4 className="font-sans text-[16px] font-medium text-foreground">Designer · Pro2tect</h4>
                    <span className="font-mono text-[12px] text-muted shrink-0">2021</span>
                  </div>
                  <p className="font-sans text-[14px] leading-relaxed" style={{ color: 'var(--modal-text-tertiary)' }}>
                    Delivered full brand system including logo, website, merchandise designs, and social content.
                  </p>
                </div>

                {/* Job: Enhnvce Labs */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                    <h4 className="font-sans text-[16px] font-medium text-foreground">Designer · Enhnvce Labs</h4>
                    <span className="font-mono text-[12px] text-muted shrink-0">2020</span>
                  </div>
                  <p className="font-sans text-[14px] leading-relaxed" style={{ color: 'var(--modal-text-tertiary)' }}>
                    Designed branding and product labels for full lineup: protein, nootropics, sleep, immune, and coffee.
                  </p>
                </div>

                {/* Job: Growtheory */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                    <h4 className="font-sans text-[16px] font-medium text-foreground">Founder · Growtheory</h4>
                    <span className="font-mono text-[12px] text-muted shrink-0">2015 – 2017</span>
                  </div>
                  <p className="font-sans text-[14px] leading-relaxed" style={{ color: 'var(--modal-text-tertiary)' }}>
                    Built brand identity, content strategy, website, and apparel line.
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
                    <h4 className="font-sans text-[15px] font-medium text-foreground">samhayek.com</h4>
                    <p className="font-sans text-[14px]" style={{ color: 'var(--modal-text-secondary)' }}>
                      Personal portfolio built with Next.js and Sanity CMS.
                    </p>
                    <a href="https://samhayek.com" target="_blank" rel="noopener noreferrer" className="font-mono text-[12px] text-muted hover:text-foreground transition-colors">
                      samhayek.com
                    </a>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-sans text-[15px] font-medium text-foreground">Audio-Hooks</h4>
                    <p className="font-sans text-[14px]" style={{ color: 'var(--modal-text-secondary)' }}>
                      Your terminal, voiced by the games you grew up on.
                    </p>
                    <a href="https://www.samhayek.com/code/audio-hooks" target="_blank" rel="noopener noreferrer" className="font-mono text-[12px] text-muted hover:text-foreground transition-colors">
                      samhayek.com/code/audio-hooks
                    </a>
                  </div>

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
                    <a href="https://baseline-beta.vercel.app" target="_blank" rel="noopener noreferrer" className="font-mono text-[12px] text-muted hover:text-foreground transition-colors">
                      baseline-beta.vercel.app
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
                    <span style={{ color: 'var(--modal-text-secondary)' }}>Design Engineering, Brand Identity + Systems, Creative Direction, Visual Design, Product Design</span>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Tools</span>
                    <span className="text-muted"> — </span>
                    <span style={{ color: 'var(--modal-text-secondary)' }}>Figma, Cursor, Procreate, Flora, Framer, Adobe, Claude Code, DaVinci Resolve, Pencil, Jitter, Paper</span>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Code</span>
                    <span className="text-muted"> — </span>
                    <span style={{ color: 'var(--modal-text-secondary)' }}>HTML, CSS, JavaScript, React, Next.js, Three.js, WGSL, Motion</span>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Growth</span>
                    <span className="text-muted"> — </span>
                    <span style={{ color: 'var(--modal-text-secondary)' }}>Content Strategy, Social Media Marketing, Community Management</span>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Other</span>
                    <span className="text-muted"> — </span>
                    <span style={{ color: 'var(--modal-text-secondary)' }}>Audio Engineering, Micro-interactions, Video Editing, Copywriting</span>
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
                            alt={`${item.title} — item ${i + 1}`}
                            fill
                            sizes="(min-width: 832px) 256px, 45vw"
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
          {item.body && item.body.length > 0 && !isSupport && !isResume && !isAudioHooks && (
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
                id="my-cal-inline-design"
                style={{ width: '100%', minHeight: 'min(600px, 80vh)' }}
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
                  title={`${item.title} — media`}
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
                title={`${item.title} — Figma`}
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
                    sizes="(min-width: 832px) 256px, 30vw"
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
                title="Checkout"
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

            <div className="flex flex-wrap justify-end gap-3 items-center">
              <button
                onClick={handleClose}
                className="px-6 py-3 font-sans text-[14px] leading-4 font-medium text-muted border border-border rounded-btn press hover:border-border-hover hover:text-foreground transition-colors"
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
              {/* Audio-Hooks GitHub link */}
              {isAudioHooks && (
                <a
                  href="https://github.com/samhayek-code/claude-audio-hooks"
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
