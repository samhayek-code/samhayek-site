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
const shopIconColors: Record<string, string> = {};

const shopIcons: Record<string, JSX.Element> = {};

interface CardProps {
  item: ArchiveItem;
  onClick: (item: ArchiveItem) => void;
  onHoverSound?: () => void;
  index?: number;
  cardCode: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  const borderRef = useRef<SVGRectElement>(null);
  const animationRef = useRef<JSAnimation | null>(null);
  const colors = typeColors[item.type] || typeColors.Everything;

  const isWritingType = item.type === "Writing";
  const isConnectType = item.type === "Connect";
  const isShopType = item.type === "Shop";
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
  const shopIcon = isShopType ? shopIcons[item.slug?.current] : null;
  const shopColor = isShopType
    ? shopIconColors[item.slug?.current] || colors.dot
    : colors.dot;
  const hasIconDisplay =
    (isConnectType && connectIcon) || (isShopType && shopIcon);

  // Stagger delay for entrance animation
  const entranceDelay = index * params.entrance.staggerMs;

  // Border glow animation — smooth enter AND exit
  useEffect(() => {
    if (!borderRef.current) return;

    // Cancel any running animation first
    if (animationRef.current) {
      animationRef.current.pause();
      animationRef.current = null;
    }

    if (isHovered) {
      animationRef.current = animate(borderRef.current, {
        opacity: [0, params.glow.opacity],
        duration: params.glow.duration * 1000,
        ease: "outCubic",
      });
    } else {
      // Smooth fade out (60% of fade-in duration for snappier exit)
      animationRef.current = animate(borderRef.current, {
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
          padding: "5px",
          "--entrance-delay": `${entranceDelay}ms`,
          "--entrance-distance": `${params.entrance.distance}px`,
          "--entrance-duration": `${params.entrance.duration}s`,
        } as React.CSSProperties
      }
    >
      {/* Frame border — card sits centered inside this */}
      <div className="card-frame" />

      {/* Main card — all hover transforms driven by DialKit params */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={() => params.press.enabled && setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onClick={() => !isComingSoon && onClick(item)}
        className={`card-hover card-noise relative overflow-hidden flex flex-col h-full ${isComingSoon ? "cursor-default" : "cursor-pointer"}`}
        style={{
          background: isHovered ? "#1A1A1E" : "#111113",
          border: `1px solid ${isHovered ? "var(--border-hover)" : "var(--border)"}`,
          transform: `translateY(${liftY}px) scale(${scale})`,
          transition: `transform ${dur} ${ease}, border-color ${dur} ${ease}, background ${dur} ${ease}`,
        }}
      >
        {/* Colored border glow — fades in/out smoothly via anime.js */}
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
              filter: `drop-shadow(0 0 ${params.glow.blur}px ${colors.dot})`,
            }}
          />
        </svg>

        {/* ── Background layer (image / icon / text blur) ── */}

        {/* Cover image — opacity & blur driven by params */}
        {item.coverImage && !isWritingType && !hasIconDisplay && (
          <div className="absolute inset-0 z-0">
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

        {/* Shop type icon */}
        {isShopType && shopIcon && (
          <div
            className="absolute inset-0 z-[1] flex items-center justify-center"
            style={{
              color: isHovered ? shopColor : "var(--subtle)",
              opacity: isHovered ? 0.9 : 0.5,
              transition: `all ${dur} ease`,
            }}
          >
            {shopIcon}
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
              <p className="text-[#E8E8E9] text-[13px] leading-[1.6] text-justify font-sans whitespace-pre-line line-clamp-5">
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
              ? `linear-gradient(to bottom, rgba(13,13,15,${params.overlay.hoverStrength}) 0%, rgba(13,13,15,${params.overlay.hoverStrength * 0.2}) 40%, rgba(13,13,15,${params.overlay.hoverStrength}) 100%)`
              : `linear-gradient(to bottom, rgba(13,13,15,${params.overlay.restStrength}) 0%, rgba(13,13,15,${params.overlay.restStrength * 0.57}) 40%, rgba(13,13,15,${params.overlay.restStrength}) 100%)`,
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

        {/* ── Micro-detail overlays — controlled by params ── */}

        {/* Corner brackets — opacity from params, visible at rest if showAtRest */}
        {["tl", "tr", "bl", "br"].map((corner) => (
          <div
            key={corner}
            className={`card-corner-bracket card-corner-bracket--${corner}`}
            style={{
              opacity: isHovered
                ? params.details.bracketOpacity
                : params.details.showAtRest
                ? params.details.bracketOpacity * 0.3
                : 0,
              transition: `opacity ${dur} ease`,
            }}
          />
        ))}

        {/* ── Content layer (top + bottom rows) ── */}

        {/* Top row */}
        <div className="relative z-10 flex justify-between items-start p-5">
          <div className="flex-1 pr-4">
            <span className={`font-sans text-[15px] font-normal tracking-[0.02em] leading-tight block ${isComingSoon ? "text-[#505055]" : "text-[#E8E8E9]"}`}>
              {isComingSoon ? "Coming Soon" : item.title}
            </span>
            {item.year && !isComingSoon && (
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
              {isComingSoon ? "Product" : item.label}
            </span>
          </div>
        </div>

        {/* Spacer — pushes bottom row down */}
        <div className="flex-1" />

        {/* Bottom row */}
        <div className="relative z-10 flex flex-col gap-2 p-5 pt-0">
          <div className="flex justify-between items-end">
            {/* Price on left (if applicable) */}
            {item.price && !isComingSoon ? (
              <span className="font-mono font-medium text-[13px] text-[#E8E8E9]">
                {item.price}
              </span>
            ) : (
              <span />
            )}

            {/* CTA button — faster transition than card body */}
            <button
              className="px-3.5 py-2 text-xs font-medium font-mono uppercase tracking-wide"
              style={{
                background: isComingSoon
                  ? "rgba(13, 13, 15, 0.6)"
                  : isHovered
                    ? colors.dot
                    : "rgba(13, 13, 15, 0.6)",
                color: isComingSoon ? "#3A3A3F" : isHovered ? "#ffffff" : "#8A8A8F",
                border: `1px solid ${isComingSoon ? "rgba(255, 255, 255, 0.05)" : isHovered ? colors.dot : "rgba(255, 255, 255, 0.1)"}`,
                transition: `all ${parseFloat(dur) * 0.5}s ease`,
                cursor: isComingSoon ? "default" : "pointer",
              }}
            >
              {isComingSoon ? "Coming Soon" : item.cta}
            </button>
          </div>

          {/* Card code + type — visibility from params */}
          <div
            className="card-spec-line flex items-center gap-1.5"
            style={{
              opacity: isHovered
                ? params.details.specLineOpacity
                : params.details.showAtRest
                ? 0.2
                : 0,
              color: isHovered ? "#505055" : "#3A3A3F",
              transition: `opacity ${dur} ease, color ${dur} ease`,
            }}
          >
            <span>{cardCode}</span>
            <span>◆</span>
            <span>TYPE:{item.type.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
