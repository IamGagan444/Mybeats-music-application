"use client";

import { Music2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TrackArtworkProps {
  src?: string;
  className?: string;
  iconClassName?: string;
}

// Small client boundary needed only to catch broken/unreachable artwork
// URLs (Audius artwork is served from arbitrary, per-track node hosts that
// occasionally 404 or block hotlinking) and fall back to a placeholder icon.
export function TrackArtwork({ src, className, iconClassName }: TrackArtworkProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex size-full items-center justify-center bg-muted text-muted-foreground",
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
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn("size-full object-cover", className)}
    />
  );
}
