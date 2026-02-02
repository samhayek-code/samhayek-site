"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { animate, JSAnimation } from "animejs";
import { ArchiveItem, typeColors, extractPlainText } from "@/lib/types";
import { urlFor } from "@/lib/sanity";
import {
  RiCalendarScheduleFill,
  RiChat1Fill,
  RiHeartFill,
  RiFileTextFill,
  RiShieldCheckFill,
} from "@remixicon/react";

// Filled icons for Connect type cards
const connectIconColors: Record<string, string> = {
  "book-a-call": "#fbbf24",
  "send-message": "#60a5fa",
  support: "#34d399",
  resume: "#a78bfa",
};

const connectIcons: Record<string, JSX.Element> = {
  "book-a-call": <RiCalendarScheduleFill size={96} />,
  "send-message": <RiChat1Fill size={96} />,
  support: <RiHeartFill size={96} />,
  resume: <RiFileTextFill size={96} />,
};

// Shop type icons
const shopIconColors: Record<string, string> = {
  "brand-audit": "#f87171",
};

const shopIcons: Record<string, JSX.Element> = {
  "brand-audit": <RiShieldCheckFill size={96} />,
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
            <span className="font-sans text-[15px] text-[#E8E8E9] font-normal tracking-[0.02em] leading-tight block">
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
