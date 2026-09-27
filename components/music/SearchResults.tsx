"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { TrackList } from "@/components/music/TrackList";
import type { MusicTrack } from "@/types/music";

interface SearchResultsProps {
  initialQuery?: string;
  autoFocus?: boolean;
}

const DEBOUNCE_MS = 400;

export function SearchResults({ initialQuery = "", autoFocus }: SearchResultsProps) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [resolvedQuery, setResolvedQuery] = useState(initialQuery);
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isLoading = debouncedQuery !== "" && debouncedQuery !== resolvedQuery;

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery) return;

    const controller = new AbortController();

    fetch(`/api/audius/search?q=${encodeURIComponent(debouncedQuery)}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((json: { success: boolean; data?: MusicTrack[]; message?: string }) => {
        if (!json.success) {
          setError(json.message ?? "Search failed.");
          setTracks([]);
        } else {
          setTracks(json.data ?? []);
          setError(null);
        }
        setResolvedQuery(debouncedQuery);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError("Search failed. Please try again.");
        setTracks([]);
        setResolvedQuery(debouncedQuery);
      });

    return () => controller.abort();
  }, [debouncedQuery]);

  return (
    <div className="flex flex-col gap-6">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you want to listen to?"
          aria-label="Search tracks"
          className="h-11 rounded-full border-transparent bg-muted pl-11 text-sm focus-visible:border-ring"
        />
      </div>

      {debouncedQuery ? (
        <TrackList
          tracks={tracks}
          isLoading={isLoading}
          error={error}
          skeletonCount={6}
          emptyMessage={`No results for "${debouncedQuery}"`}
        />
      ) : null}
    </div>
  );
}
