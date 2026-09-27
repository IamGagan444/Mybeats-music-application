"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToggleFavorite } from "@/hooks/queries";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store";
import { favoritesActions } from "@/store/favoritesSlice";
import { selectIsFavorited } from "@/store/selectors";
import type { MusicTrack } from "@/types/music";

export function FavoriteButton({
  track,
  className,
}: {
  track: MusicTrack;
  className?: string;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isSignedIn = useAppSelector((s) => s.favorites.isSignedIn);
  const isFavorited = useAppSelector(selectIsFavorited(track.id));
  const isPending = useAppSelector((s) => s.favorites.pending.includes(track.id));
  const { mutate } = useToggleFavorite();

  const onClick = () => {
    if (!isSignedIn) {
      router.push("/login?next=favorite");
      return;
    }
    if (isPending) return;
    dispatch(favoritesActions.toggled(track.id));
    dispatch(favoritesActions.pendingStarted(track.id));

    mutate(
      { track, isFavorited },
      {
        onError: () => dispatch(favoritesActions.toggled(track.id)),
        onSettled: () => dispatch(favoritesActions.pendingFinished(track.id)),
      }
    );
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={
        !isSignedIn
          ? `Sign in to save ${track.title}`
          : isFavorited
            ? `Remove ${track.title} from favorites`
            : `Favorite ${track.title}`
      }
      aria-pressed={isFavorited}
      onClick={onClick}
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
