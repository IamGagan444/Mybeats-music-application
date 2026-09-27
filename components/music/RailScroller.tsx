"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Arrow controls for a scroll rail. The rail scrolls natively without them. */
export function RailScroller({ targetId }: { targetId: string }) {
  const scrollBy = (direction: 1 | -1) => {
    const rail = document.getElementById(targetId);
    if (!rail) return;
    rail.scrollBy({ left: direction * rail.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className="hidden items-center gap-1 sm:flex">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Scroll left"
        onClick={() => scrollBy(-1)}
        className="rounded-full text-muted-foreground hover:bg-surface-raised hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Scroll right"
        onClick={() => scrollBy(1)}
        className="rounded-full text-muted-foreground hover:bg-surface-raised hover:text-foreground"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
