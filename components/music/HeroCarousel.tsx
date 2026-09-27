"use client";

import { useState } from "react";
import { TrackArtwork } from "@/components/music/TrackArtwork";
import { TrackPlayButton } from "@/components/music/TrackPlayButton";
import { cn } from "@/lib/utils";
import type { MusicTrack } from "@/types/music";

/**
 * Coverflow hero. Layout is a plain flex row; depth comes from transforms and
 * opacity only, so switching the focused card never triggers layout — the
 * browser can keep the whole transition on the compositor.
 */
export function HeroCarousel({ tracks }: { tracks: MusicTrack[] }) {
  const items = tracks.slice(0, 5);
  const [active, setActive] = useState(Math.floor(items.length / 2));

  if (items.length === 0) return null;

  const featured = items[active];

  return (
    <section
      aria-label="Featured tracks"
      className="animate-enter relative flex h-70 items-center justify-center overflow-x-clip sm:h-80"
    >
      {items.map((track, index) => {
        const offset = index - active;
        const distance = Math.abs(offset);
        const isFeatured = offset === 0;

        return (
          <button
            key={track.id}
            type="button"
            aria-label={isFeatured ? undefined : `Show ${track.title}`}
            aria-hidden={distance > 2}
            tabIndex={isFeatured || distance > 2 ? -1 : 0}
            onClick={() => setActive(index)}
            style={{
              transform: `translateX(${offset * 54}%) scale(${1 - distance * 0.11})`,
              zIndex: 10 - distance,
              opacity: distance > 2 ? 0 : 1 - distance * 0.14,
              filter: isFeatured ? undefined : "brightness(0.82)",
            }}
            className={cn(
              "absolute h-55 w-48 overflow-hidden rounded-2xl bg-surface-raised shadow-2xl transition-[transform,opacity,filter] duration-500 ease-out sm:h-65 sm:w-56",
              isFeatured
                ? "cursor-default ring-1 ring-white/10"
                : "cursor-pointer",
              distance > 2 && "pointer-events-none"
            )}
          >
            <TrackArtwork src={track.artwork} priority={distance <= 1} />
            {isFeatured ? (
              <span className="absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-black/85 to-transparent" />
            ) : null}
          </button>
        );
      })}

      {/* Featured caption sits outside the transformed cards so the text stays
          crisp instead of being scaled. */}
      <div className="pointer-events-none absolute z-20 flex h-55 w-48 items-end p-4 sm:h-65 sm:w-56">
        <div className="flex w-full items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-white sm:text-lg">
              {featured.title}
            </p>
            <p className="truncate text-xs text-white/70">{featured.artist}</p>
          </div>
          <span className="pointer-events-auto shrink-0">
            <TrackPlayButton
              track={featured}
              queue={items}
              className="size-11 bg-white/15 text-white backdrop-blur-md hover:bg-white/25"
            />
          </span>
        </div>
      </div>
    </section>
  );
}
