"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { animate, JSAnimation } from "animejs";
import { ArchiveItem, typeColors, extractPlainText } from "@/lib/types";
import { urlFor } from "@/lib/sanity";

// Filled SVG icons for Connect type cards
const connectIconColors: Record<string, string> = {
  "book-a-call": "#fbbf24",
  "send-message": "#60a5fa",
  support: "#34d399",
  resume: "#a78bfa",
};

const connectIcons: Record<string, JSX.Element> = {
  "book-a-call": (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24">
      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5v-5z" />
    </svg>
  ),
  "send-message": (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
      <path d="M7 9h10v2H7zm0-3h10v2H7zm0 6h7v2H7z" />
    </svg>
  ),
  support: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
    </svg>
  ),
  resume: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24">
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
      <path d="M8 12h8v2H8zm0 4h8v2H8zm0-8h3v2H8z" />
    </svg>
  ),
};

// Shop type icons
const shopIconColors: Record<string, string> = {
  "brand-audit": "#f87171",
};

const shopIcons: Record<string, JSX.Element> = {
  "brand-audit": (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24">
      <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm6 9.09c0 4-2.55 7.7-6 8.83-3.45-1.13-6-4.82-6-8.83V6.31l6-2.25 6 2.25v4.78z" />
      <path d="M11 7h2v5h-2zm0 6h2v2h-2z" />
    </svg>
  ),
};

interface CardProps {
  item: ArchiveItem;
  onClick: (item: ArchiveItem) => void;
  onHoverSound?: () => void;
  index?: number;
  cardCode: string;
}

export default function Card({
  item,
  onClick,
  onHoverSound,
  index = 0,
  cardCode,
}: CardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const borderRef = useRef<SVGRectElement>(null);
  const animationRef = useRef<JSAnimation | null>(null);
  const colors = typeColors[item.type] || typeColors.Everything;

  const isWritingType = item.type === "Writing";
  const isConnectType = item.type === "Connect";
  const isShopType = item.type === "Shop";

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
  const shopIcon = isShopType ? shopIcons[item.slug?.current] : null;
  const shopColor = isShopType
    ? shopIconColors[item.slug?.current] || colors.dot
    : colors.dot;
  const hasIconDisplay =
    (isConnectType && connectIcon) || (isShopType && shopIcon);

  // Stagger delay for entrance animation (40ms per card, max 400ms)
  const entranceDelay = Math.min(index * 40, 400);

  // Border glow animation on hover
  useEffect(() => {
    if (!borderRef.current) return;

    if (isHovered) {
      animationRef.current = animate(borderRef.current, {
        opacity: [0, 0.6],
        duration: 300,
        ease: "outCubic",
      });
    } else {
      if (animationRef.current) {
        animationRef.current.pause();
        animationRef.current = null;
      }
      if (borderRef.current) {
        borderRef.current.style.opacity = "0";
      }
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.pause();
      }
    };
  }, [isHovered]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHoverSound?.();
  };

  return (
    <div
      className="relative card-entrance aspect-square"
      style={
        {
          padding: "5px",
          "--entrance-delay": `${entranceDelay}ms`,
        } as React.CSSProperties
      }
    >
      {/* Frame border — card sits centered inside this */}
      <div className="card-frame" />

      {/* Main card — inset by 5px from frame */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onClick(item)}
        className="card-hover card-noise relative overflow-hidden cursor-pointer flex flex-col h-full"
        style={{
          background: "#111113",
          border: `1px solid ${isHovered ? "var(--border-hover)" : "var(--border)"}`,
        }}
      >
        {/* Colored border glow — fades in on hover */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-[100]"
          style={{ overflow: "visible" }}
        >
          <rect
            ref={borderRef}
            x="0.5"
            y="0.5"
            width="calc(100% - 1px)"
            height="calc(100% - 1px)"
            rx="1"
            ry="1"
            fill="none"
            stroke={colors.dot}
            strokeWidth="1"
            style={{
              opacity: 0,
              filter: `drop-shadow(0 0 4px ${colors.dot})`,
            }}
          />
        </svg>

        {/* ── Background layer (image / icon / text blur) ── */}

        {/* Cover image — spans entire card */}
        {item.coverImage && !isWritingType && !hasIconDisplay && (
          <div className="absolute inset-0 z-0">
            <Image
              src={urlFor(item.coverImage).width(600).height(600).url()}
              alt={item.title}
              fill
              className="object-cover transition-all duration-300 ease-out"
              style={{
                opacity: isHovered ? 0.85 : 0.4,
                filter: isHovered ? "blur(0px)" : "blur(2px)",
              }}
            />
          </div>
        )}

        {/* Connect type icon */}
        {isConnectType && connectIcon && (
          <div
            className="absolute inset-0 z-[1] flex items-center justify-center transition-all duration-300"
            style={{
              color: isHovered ? connectColor : "var(--subtle)",
              opacity: isHovered ? 0.9 : 0.5,
            }}
          >
            {connectIcon}
          </div>
        )}

        {/* Shop type icon */}
        {isShopType && shopIcon && (
          <div
            className="absolute inset-0 z-[1] flex items-center justify-center transition-all duration-300"
            style={{
              color: isHovered ? shopColor : "var(--subtle)",
              opacity: isHovered ? 0.9 : 0.5,
            }}
          >
            {shopIcon}
          </div>
        )}

        {/* Blurred text preview for Writing cards */}
        {isWritingType && bodyText && (
          <div
            className="absolute inset-0 z-[1] overflow-hidden flex items-center justify-center transition-all duration-300"
            style={{
              padding: "24px",
              filter: isHovered ? "blur(0px)" : "blur(2px)",
              opacity: isHovered ? 0.8 : 0.35,
            }}
          >
            <div className="w-full max-w-[180px] aspect-square flex items-center justify-center">
              <p className="text-[#E8E8E9] text-[13px] leading-[1.6] text-justify font-sans whitespace-pre-line line-clamp-5">
                {bodyText.slice(0, 150)}
              </p>
            </div>
          </div>
        )}

        {/* ── Overlay layers ── */}

        {/* Dark overlay for text readability — always uses dark overlay */}
        <div
          className="absolute inset-0 z-[2] transition-all duration-300 ease-out"
          style={{
            background: isHovered
              ? "linear-gradient(to bottom, rgba(13,13,15,0.5) 0%, rgba(13,13,15,0.1) 40%, rgba(13,13,15,0.5) 100%)"
              : "linear-gradient(to bottom, rgba(13,13,15,0.7) 0%, rgba(13,13,15,0.4) 40%, rgba(13,13,15,0.7) 100%)",
          }}
        />

        {/* Hover gradient */}
        <div
          className="absolute inset-0 z-[3] transition-all duration-400 pointer-events-none"
          style={{
            background: isHovered
              ? `radial-gradient(ellipse at 50% 0%, ${colors.bg}, transparent 70%)`
              : "transparent",
          }}
        />

        {/* ── Micro-detail overlays (brackets, coordinates) — hidden until hover ── */}

        {/* Corner brackets — opacity controlled by CSS hover */}
        <div className="card-corner-bracket card-corner-bracket--tl" />
        <div className="card-corner-bracket card-corner-bracket--tr" />
        <div className="card-corner-bracket card-corner-bracket--bl" />
        <div className="card-corner-bracket card-corner-bracket--br" />

        {/* ── Content layer (top + bottom rows) ── */}

        {/* Top row */}
        <div className="relative z-10 flex justify-between items-start p-5">
          <div className="flex-1 pr-4">
            <span className="font-sans text-[15px] text-[#E8E8E9] font-medium tracking-[-0.01em] leading-tight block">
              {item.title}
            </span>
            {item.year && (
              <span className="font-mono font-medium text-[11px] text-[#505055] mt-1 block">
                {item.year}
              </span>
            )}
          </div>

          {/* Label pill — category-coded */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 flex-shrink-0"
            style={{
              background: colors.bg,
              border: `1px solid ${colors.dot}20`,
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: colors.dot }}
            />
            <span
              className="font-mono font-bold text-[9px] uppercase tracking-wider"
              style={{ color: colors.dot }}
            >
              {item.label}
            </span>
          </div>
        </div>

        {/* Spacer — pushes bottom row down */}
        <div className="flex-1" />

        {/* Bottom row */}
        <div className="relative z-10 flex flex-col gap-2 p-5 pt-0">
          <div className="flex justify-between items-end">
            {/* Price on left (if applicable) */}
            {item.price ? (
              <span className="font-mono font-medium text-[13px] text-[#E8E8E9]">
                {item.price}
              </span>
            ) : (
              <span />
            )}

            {/* CTA button on right */}
            <button
              className="px-3.5 py-2 text-xs font-medium font-mono uppercase tracking-wide transition-all duration-200"
              style={{
                background: isHovered
                  ? colors.dot
                  : "rgba(13, 13, 15, 0.6)",
                color: isHovered ? "#ffffff" : "#8A8A8F",
                border: `1px solid ${isHovered ? colors.dot : "rgba(255, 255, 255, 0.1)"}`,
              }}
            >
              {item.cta}
            </button>
          </div>

          {/* Card code + type — always side by side, fade in on hover */}
          <div className="card-spec-line flex items-center gap-1.5">
            <span>{cardCode}</span>
            <span>◆</span>
            <span>TYPE:{item.type.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
