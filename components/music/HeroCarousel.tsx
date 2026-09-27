"use client";

import { useEffect, useRef, useState } from "react";
import { TrackArtwork } from "@/components/music/TrackArtwork";
import { TrackPlayButton } from "@/components/music/TrackPlayButton";
import { cn } from "@/lib/utils";
import type { MusicTrack } from "@/types/music";

const AUTOPLAY_MS = 4500;
const SWIPE_THRESHOLD = 40;

function isKeyboardFocus(target: EventTarget) {
  try {
    return (target as Element).matches(":focus-visible");
  } catch {
    return false;
  }
}

/**
 * Coverflow hero. Layout is a plain flex row; depth comes from transforms and
 * opacity only, so switching the focused card never triggers layout — the
 * browser can keep the whole transition on the compositor.
 *
 * Advances on its own, and pauses only while a drag is in progress, while
 * keyboard focus is inside it, or while the tab is hidden. Reduced-motion
 * users get no autoplay at all.
 */
export function HeroCarousel({ tracks }: { tracks: MusicTrack[] }) {
  const items = tracks.slice(0, 7);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<number | null>(null);
  const swiped = useRef(false);

  const count = items.length;
  const half = Math.floor(count / 2);
  // Offsets run from -half to maxOffset. A card that walks off the left end
  // reappears at maxOffset, so that ring stays invisible and untransitioned —
  // the jump must never be seen.
  const maxOffset = count - 1 - half;
  const maxVisible = Math.max(0, Math.min(2, maxOffset - 1));
  const step = (delta: number) =>
    setActive((index) => (index + delta + count) % count);

  // A background tab shouldn't burn timers, and a keyboard user shouldn't have
  // the card they are tabbing through slide away underneath them. Hovering is
  // deliberately *not* a pause — the pointer rests over the hero constantly.
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // A pointer released outside the hero never reaches its own handler, so the
  // drag would otherwise stay "open" and autoplay would never resume.
  useEffect(() => {
    if (!dragging) return;

    const end = () => {
      dragStart.current = null;
      setDragging(false);
    };
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [dragging]);

  // Keyed on `active` so a manual pick restarts the dwell instead of landing
  // mid-interval and flicking away immediately.
  useEffect(() => {
    if (paused || dragging || count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setTimeout(
      () => setActive((index) => (index + 1) % count),
      AUTOPLAY_MS
    );
    return () => window.clearTimeout(id);
  }, [active, paused, dragging, count]);

  if (count === 0) return null;

  const featured = items[active];

  return (
    <section
      aria-label="Featured tracks"
      aria-roledescription="carousel"
      className="animate-enter relative flex h-70 touch-pan-y items-center justify-center overflow-x-clip select-none sm:h-80"
      onFocusCapture={(event) => {
        // Only keyboard focus pauses. A mouse click also focuses the card, and
        // that must not stop the carousel for good.
        if (isKeyboardFocus(event.target)) setPaused(true);
      }}
      onBlurCapture={() => setPaused(false)}
      onPointerDown={(event) => {
        dragStart.current = event.clientX;
        swiped.current = false;
        setDragging(true);
      }}
      onPointerUp={(event) => {
        const start = dragStart.current;
        dragStart.current = null;
        setDragging(false);
        if (start === null) return;

        const delta = event.clientX - start;
        if (Math.abs(delta) < SWIPE_THRESHOLD) return;
        swiped.current = true;
        step(delta < 0 ? 1 : -1);
      }}
      onPointerCancel={() => {
        dragStart.current = null;
        setDragging(false);
      }}
      onClickCapture={(event) => {
        // A swipe ends over a card; don't let it read as a tap on that card.
        if (!swiped.current) return;
        swiped.current = false;
        event.stopPropagation();
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") step(1);
        else if (event.key === "ArrowLeft") step(-1);
        else return;
        event.preventDefault();
      }}
    >
      {items.map((track, index) => {
        // Wrap to the shortest way round, so the stack always has cards on
        // both sides instead of emptying out at either end.
        const offset = ((index - active + count + half) % count) - half;
        const distance = Math.abs(offset);
        const isFeatured = offset === 0;
        const isVisible = distance <= maxVisible;

        return (
          <button
            key={track.id}
            type="button"
            aria-label={isFeatured ? undefined : `Show ${track.title}`}
            aria-hidden={!isVisible}
            tabIndex={isFeatured || !isVisible ? -1 : 0}
            onClick={() => setActive(index)}
            style={{
              transform: `translateX(${offset * 54}%) scale(${1 - distance * 0.11})`,
              zIndex: 10 - distance,
              opacity: isVisible ? 1 - distance * 0.14 : 0,
              filter: isFeatured ? undefined : "brightness(0.82)",
            }}
            className={cn(
              "absolute h-55 w-48 overflow-hidden rounded-2xl bg-surface-raised shadow-2xl sm:h-65 sm:w-56",
              // Animating the card that just wrapped would drag it straight
              // through the middle of the stack.
              offset === maxOffset && count > 2
                ? "transition-none"
                : "transition-[transform,opacity,filter] duration-500 ease-out",
              isFeatured
                ? "cursor-default ring-1 ring-white/10"
                : "cursor-pointer",
              !isVisible && "pointer-events-none"
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

      <div className="absolute -bottom-1 z-20 flex gap-1.5">
        {items.map((track, index) => (
          <button
            key={track.id}
            type="button"
            aria-label={`Show ${track.title}`}
            aria-current={index === active}
            onClick={() => setActive(index)}
            className={cn(
              "h-1.5 cursor-pointer rounded-full transition-all duration-300",
              index === active ? "w-5 bg-white" : "w-1.5 bg-white/35"
            )}
          />
        ))}
      </div>
    </section>
  );
}
