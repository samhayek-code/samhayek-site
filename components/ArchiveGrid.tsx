"use client";

import { useMemo } from "react";
import Card from "./Card";
import { ArchiveItem, typeInitials } from "@/lib/types";

interface ArchiveGridProps {
  items: ArchiveItem[];
  onCardClick: (item: ArchiveItem) => void;
  onHoverSound: () => void;
  activeFilter: string;
}

/**
 * Generates per-category card codes like D-001, W-003, M-002.
 * Each type gets its own counter that resets per render.
 */
function generateCardCodes(items: ArchiveItem[]) {
  const counters: Record<string, number> = {};

  return items.map((item) => {
    const initial = typeInitials[item.type] || "?";
    counters[item.type] = (counters[item.type] || 0) + 1;
    const code = `${initial}-${String(counters[item.type]).padStart(3, "0")}`;
    return { item, cardCode: code };
  });
}

export default function ArchiveGrid({
  items,
  onCardClick,
  onHoverSound,
  activeFilter,
}: ArchiveGridProps) {
  const itemsWithCodes = useMemo(() => generateCardCodes(items), [items]);

  // Card animation params — calibrated via DialKit, now baked in
  const cardParams = {
    hover: { liftY: -8, scale: 1, duration: 0.56 },
    glow: { opacity: 0.7, blur: 3, duration: 0.36 },
    image: { restOpacity: 0.25, hoverOpacity: 0.9, restBlur: 2.76, hoverBlur: 0 },
    overlay: { restStrength: 0.7, hoverStrength: 0.5 },
    details: { bracketOpacity: 0.6, specLineOpacity: 1, showAtRest: false },
    press: { scale: 0.98, enabled: true },
    entrance: { distance: 40, duration: 1.94, staggerMs: 150 },
  };

  return (
    <div className="px-4 lg:px-12 pb-20 pt-6">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {itemsWithCodes.map(({ item, cardCode }, index) => (
          <Card
            key={`${activeFilter}-${item._id}`}
            item={item}
            onClick={onCardClick}
            onHoverSound={onHoverSound}
            index={index}
            cardCode={cardCode}
            params={cardParams}
          />
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-32">
          <span className="font-sans text-sm text-subtle">
            Nothing here yet.
          </span>
        </div>
      )}
    </div>
  );
}
