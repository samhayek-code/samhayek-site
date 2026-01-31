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
  // Memoize card code generation so it only recalculates when items change
  const itemsWithCodes = useMemo(() => generateCardCodes(items), [items]);

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
