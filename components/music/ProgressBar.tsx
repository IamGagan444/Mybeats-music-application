"use client";

import { Slider } from "@/components/ui/slider";
import { formatDuration } from "@/lib/utils";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

export function ProgressBar({ currentTime, duration, onSeek }: ProgressBarProps) {
  const max = duration > 0 ? duration : 1;

  return (
    <div className="group flex w-full items-center gap-2">
      <span className="w-9 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
        {formatDuration(currentTime)}
      </span>
      <Slider
        value={[Math.min(currentTime, max)]}
        min={0}
        max={max}
        step={1}
        aria-label="Seek"
        onValueChange={(value) => onSeek(Array.isArray(value) ? value[0] : value)}
        className="flex-1 cursor-pointer **:data-[slot=slider-range]:bg-foreground **:data-[slot=slider-thumb]:opacity-0 **:data-[slot=slider-thumb]:transition-opacity group-hover:**:data-[slot=slider-range]:bg-brand group-hover:**:data-[slot=slider-thumb]:opacity-100 focus-within:**:data-[slot=slider-thumb]:opacity-100"
      />
      <span className="w-9 shrink-0 text-[11px] tabular-nums text-muted-foreground">
        {formatDuration(duration)}
      </span>
    </div>
  );
}
