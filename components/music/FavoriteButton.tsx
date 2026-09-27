"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFavoritesStore } from "@/stores/favorites";
import type { MusicTrack } from "@/types/music";

export function FavoriteButton({
  track,
  className,
}: {
  track: MusicTrack;
  className?: string;
}) {
  const isSignedIn = useFavoritesStore((s) => s.isSignedIn);
  const isFavorited = useFavoritesStore((s) => s.ids.has(track.id));

  // Nothing to toggle against until there's a session.
  if (!isSignedIn) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={
        isFavorited
          ? `Remove ${track.title} from favorites`
          : `Favorite ${track.title}`
      }
      aria-pressed={isFavorited}
      onClick={() =>
        useFavoritesStore.getState().toggle({
          id: track.id,
          title: track.title,
          artist: track.artist,
          artwork: track.artwork,
          duration: track.duration,
        })
      }
      className={cn(
        "rounded-full transition-colors",
        isFavorited
          ? "text-brand hover:text-brand"
          : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      <Heart className={cn("size-4", isFavorited && "fill-current")} />
    </Button>
  );
}
