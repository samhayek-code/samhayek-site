"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { animate, JSAnimation } from "animejs";
import { ArchiveItem, typeColors, extractPlainText } from "@/lib/types";
import { urlFor } from "@/lib/sanity";
import {
  CalendarDots,
  ChatCircleDots,
  HandHeart,
  FileText,
  CaretRight,
} from "@phosphor-icons/react";
import { categoryIcons } from "@/lib/categoryIcons";

// Solid Phosphor icons for Connect type cards (per-slug accent colors retained)
const connectIconColors: Record<string, string> = {
  "book-a-call": "#fbbf24",
  "send-message": "#60a5fa",
  support: "#34d399",
  resume: "#a78bfa",
};

const connectIcons: Record<string, JSX.Element> = {
  "book-a-call": <CalendarDots weight="fill" size={96} />,
  "send-message": <ChatCircleDots weight="fill" size={96} />,
  support: <HandHeart weight="fill" size={96} />,
  resume: <FileText weight="fill" size={96} />,
};

interface CardProps {
  item: ArchiveItem;
  onClick: (item: ArchiveItem) => void;
  onHoverSound?: () => void;
  index?: number;
  cardCode: string;
  params: any;
}

export default function Card({
  item,
  onClick,
  onHoverSound,
  index = 0,
  cardCode,
  params,
}: CardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const glowRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<JSAnimation | null>(null);
  const colors = typeColors[item.type] || typeColors.Everything;
  const CategoryIcon = categoryIcons[item.type] || categoryIcons.Everything;

  const isWritingType = item.type === "Writing";
  const isConnectType = item.type === "Connect";
  const isComingSoon = item.slug?.current === "brand-audit";

  const bodyText = isWritingType
    ? item.body
      ? extractPlainText(item.body)
      : item.description || ""
    : "";

  const connectIcon = isConnectType
    ? connectIcons[item.slug?.current]
    : null;
  const connectColor = isConnectType
    ? connectIconColors[item.slug?.current] || colors.dot
    : colors.dot;
  const hasIconDisplay = isConnectType && connectIcon;

  // Stagger delay for entrance animation
  const entranceDelay = index * params.entrance.staggerMs;

  // Soft colored glow halo — opacity-only fade in/out (anime.js handles this cleanly).
  // Retunes the old hard-rect border-glow into a soft category-colored bloom.
  useEffect(() => {
    if (!glowRef.current) return;

    // Cancel any running animation first
    if (animationRef.current) {
      animationRef.current.pause();
      animationRef.current = null;
    }

    if (isHovered) {
      animationRef.current = animate(glowRef.current, {
        opacity: [0, params.glow.opacity],
        duration: params.glow.duration * 1000,
        ease: "outCubic",
      });
    } else {
      // Smooth fade out (60% of fade-in duration for snappier exit)
      animationRef.current = animate(glowRef.current, {
        opacity: 0,
        duration: params.glow.duration * 600,
        ease: "outCubic",
      });
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.pause();
      }
    };
  }, [isHovered, params.glow.opacity, params.glow.duration]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHoverSound?.();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
  };

  // Compute transform from hover + press state (disabled for coming soon)
  const scale = isComingSoon
    ? 1
    : isPressed && params.press.enabled
      ? params.press.scale
      : isHovered
        ? params.hover.scale
        : 1;
  const liftY = isComingSoon ? 0 : isHovered ? params.hover.liftY : 0;

  // Easing curve used across all card transitions
  const ease = "cubic-bezier(0.16, 1, 0.3, 1)";
  const dur = `${params.hover.duration}s`;

  return (
    <div
      className="relative card-entrance aspect-square"
      style={
        {
          "--entrance-delay": `${entranceDelay}ms`,
          "--entrance-distance": `${params.entrance.distance}px`,
          "--entrance-duration": `${params.entrance.duration}s`,
        } as React.CSSProperties
      }
    >
      {/* Main card — soft rounded shadowed shell; transforms driven by DialKit params */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={() => params.press.enabled && setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onClick={() => !isComingSoon && onClick(item)}
        className={`card-hover card-noise relative overflow-hidden flex flex-col h-full rounded-card ${isComingSoon ? "cursor-default" : "cursor-pointer"}`}
        style={{
          background: isHovered ? "var(--card-bg-hover)" : "var(--card-bg)",
          boxShadow: isHovered ? "var(--shadow-pop)" : "var(--shadow-card)",
          transform: `translateY(${liftY}px) scale(${scale})`,
          transition: `transform ${dur} ${ease}, box-shadow ${dur} ${ease}, background ${dur} ${ease}`,
        }}
      >
        {/* Soft category-colored glow — opacity-only fade via the anime.js loop.
            Both layers are INSET (a colored hairline ring + an inward bloom) so they
            paint inside the card's overflow clip, replacing the old hard 1px rect glow. */}
        <div
          ref={glowRef}
          className="absolute inset-0 rounded-card pointer-events-none z-[100]"
          style={{
            opacity: 0,
            boxShadow: `inset 0 0 0 1px ${colors.dot}, inset 0 0 ${params.glow.blur * 5}px ${colors.dot}33`,
          }}
        />

        {/* ── Background layer (image / icon / text blur) ── */}

        {/* Cover image — opacity & blur driven by params */}
        {item.coverImage && !isWritingType && !hasIconDisplay && (
          <div className="absolute inset-0 z-0 rounded-card img-outline overflow-hidden">
            <Image
              src={urlFor(item.coverImage).width(600).height(600).url()}
              alt={item.title}
              fill
              className="object-cover"
              style={{
                opacity: isHovered
                  ? params.image.hoverOpacity
                  : params.image.restOpacity,
                filter: `blur(${isHovered ? params.image.hoverBlur : params.image.restBlur}px)`,
                transition: `opacity ${dur} ease-out, filter ${dur} ease-out`,
              }}
            />
          </div>
        )}

        {/* Connect type icon */}
        {isConnectType && connectIcon && (
          <div
            className="absolute inset-0 z-[1] flex items-center justify-center"
            style={{
              color: isHovered ? connectColor : "var(--subtle)",
              opacity: isHovered ? 0.9 : 0.5,
              transition: `all ${dur} ease`,
            }}
          >
            {connectIcon}
          </div>
        )}

        {/* Blurred text preview for Writing cards */}
        {isWritingType && bodyText && (
          <div
            className="absolute inset-0 z-[1] overflow-hidden flex items-center justify-center"
            style={{
              padding: "24px",
              filter: `blur(${isHovered ? params.image.hoverBlur : params.image.restBlur}px)`,
              opacity: isHovered ? 0.8 : params.image.restOpacity * 0.875,
              transition: `all ${dur} ease`,
            }}
          >
            <div className="w-full max-w-[180px] aspect-square flex items-center justify-center">
              <p className="text-[var(--card-text)] text-[13px] leading-[1.6] text-justify font-sans whitespace-pre-line line-clamp-5">
                {bodyText.slice(0, 150)}
              </p>
            </div>
          </div>
        )}

        {/* ── Overlay layers ── */}

        {/* Dark overlay — gradient strength driven by params */}
        <div
          className="absolute inset-0 z-[2]"
          style={{
            background: isHovered
              ? `linear-gradient(to bottom, rgba(var(--card-overlay-rgb),${params.overlay.hoverStrength}) 0%, rgba(var(--card-overlay-rgb),${params.overlay.hoverStrength * 0.2}) 40%, rgba(var(--card-overlay-rgb),${params.overlay.hoverStrength}) 100%)`
              : `linear-gradient(to bottom, rgba(var(--card-overlay-rgb),var(--card-overlay-rest,${params.overlay.restStrength})) 0%, rgba(var(--card-overlay-rgb),calc(var(--card-overlay-rest,${params.overlay.restStrength}) * 0.57)) 40%, rgba(var(--card-overlay-rgb),var(--card-overlay-rest,${params.overlay.restStrength})) 100%)`,
            transition: `all ${dur} ease-out`,
          }}
        />

        {/* Color wash gradient — fades out on hover via opacity (not background, which can't transition between gradients) */}
        <div
          className="absolute inset-0 z-[3] pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${colors.bg}, transparent 70%)`,
            opacity: isHovered ? 0 : 1,
            transition: `opacity ${isHovered ? parseFloat(dur) * 0.8 : parseFloat(dur) * 1.4}s ease-out`,
          }}
        />

        {/* Corner brackets retired — the soft shadow + rounded silhouette reads as a card.
            params.details.bracketOpacity / showAtRest kept in the params object so Card's
            prop contract holds; they're simply no longer rendered. */}

        {/* ── Content layer (top + bottom rows) ── */}

        {/* Top row */}
        <div className="relative z-10 p-5">
          {/* Title + label chip — vertically centered together; date sits below */}
          <div className="flex items-center justify-between gap-2">
            <span className={`font-sans text-[16px] font-normal tracking-[0.02em] leading-tight flex-1 min-w-0 ${isComingSoon ? "text-[var(--card-text-muted)]" : "text-[var(--card-text)]"}`}>
              {isComingSoon ? "Coming Soon" : item.title}
            </span>

            {/* Label chip — dark fill + a defined category stroke (modal-button aesthetic).
                Opaque so the label keeps contrast over the revealed image on hover. */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 flex-shrink-0 rounded-tag"
              style={{
                background: `linear-gradient(0deg, ${colors.dot}1F, ${colors.dot}1F), var(--card-chip-bg)`,
                border: `1.5px solid ${colors.dot}59`,
              }}
            >
              <CategoryIcon weight="fill" size={11} color={colors.dot} />
              <span
                className="font-mono font-bold text-[9px] leading-none uppercase tracking-wider"
                style={{ color: colors.dot }}
              >
                {isComingSoon ? "Product" : item.label}
              </span>
            </div>
          </div>

          {item.year && !isComingSoon && (
            <span className="font-mono font-medium text-[11px] text-[var(--card-text-muted)] mt-1.5 block">
              {item.year}
            </span>
          )}
        </div>

        {/* Spacer — pushes bottom row down */}
        <div className="flex-1" />

        {/* Bottom row — price + code wink in one corner, CTA chip in the other */}
        <div className="relative z-10 flex items-end justify-between gap-2 p-5">
          <div className="flex flex-col gap-1 min-w-0">
            {item.price && !isComingSoon && (
              <span className="font-mono font-medium text-[13px] text-[var(--card-text)]">
                {item.price}
              </span>
            )}
            {/* Card code — quiet mono identity wink (dense spec line retired) */}
            <span
              className="t-mono-xs tnum"
              style={{
                opacity: isHovered
                  ? params.details.specLineOpacity
                  : params.details.showAtRest
                  ? 0.2
                  : 0,
                color: isHovered ? "var(--card-text-muted)" : "var(--card-text-faint)",
                transition: `opacity ${dur} ease, color ${dur} ease`,
              }}
            >
              {cardCode}
            </span>
          </div>

          {/* CTA — chip-sized to match the label; caret affordance to the right */}
          <button
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-tag font-mono font-bold text-[9px] leading-none uppercase tracking-wider press flex-shrink-0"
            style={{
              background: isComingSoon
                ? "var(--card-cta-bg)"
                : isHovered
                  ? colors.dot
                  : "var(--card-cta-bg)",
              color: isComingSoon ? "var(--card-text-faint)" : isHovered ? "#ffffff" : "var(--card-cta-text)",
              border: `1.5px solid ${isComingSoon ? "var(--card-cta-border)" : isHovered ? colors.dot : "var(--card-cta-border)"}`,
              transition: `all ${parseFloat(dur) * 0.5}s ease`,
              cursor: isComingSoon ? "default" : "pointer",
            }}
          >
            <span className="relative top-px">
              {isComingSoon ? "Coming Soon" : item.cta}
            </span>
            <CaretRight weight="bold" size={9} />
          </button>
        </div>
      </div>
    </div>
  );
}
