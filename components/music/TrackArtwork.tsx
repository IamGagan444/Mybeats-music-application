"use client";

import { Music2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TrackArtworkProps {
  src?: string;
  className?: string;
  iconClassName?: string;
  /** Above-the-fold art: load eagerly and hint the browser to prioritise it. */
  priority?: boolean;
}

// Small client boundary needed only to catch broken/unreachable artwork
// URLs (Audius artwork is served from arbitrary, per-track node hosts that
// occasionally 404 or block hotlinking) and fall back to a placeholder icon.
export function TrackArtwork({
  src,
  className,
  iconClassName,
  priority,
}: TrackArtworkProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex size-full items-center justify-center bg-surface-raised text-muted-foreground",
          className
        )}
      >
        <Music2 className={cn("size-8", iconClassName)} />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- artwork is served from arbitrary, per-track Audius node hosts that can't be pre-allowlisted for next/image
    <img
      src={src}
      alt=""
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      onError={() => setFailed(true)}
      className={cn("size-full object-cover", className)}
    />
  );
}
