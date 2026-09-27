"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EMPTY_SEARCH, type MusicTrack, type SearchResults } from "@/types/music";

export const queryKeys = {
  search: (q: string, full: boolean) => ["search", q, full] as const,
  favorites: ["favorites"] as const,
  trending: (genre?: string) => ["trending", genre ?? "all"] as const,
};

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message ?? "Request failed");
  return json.data as T;
}

export function useSearch(query: string, { full = false } = {}) {
  return useQuery({
    queryKey: queryKeys.search(query, full),
    queryFn: ({ signal }) =>
      getJson<SearchResults>(
        `/api/audius/search?q=${encodeURIComponent(query)}&limit=${full ? 20 : 8}&full=${full}`,
        signal
      ),
    enabled: query.length > 0,
    placeholderData: (prev) => prev ?? EMPTY_SEARCH,
  });
}

export function useFavoriteIds(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.favorites,
    queryFn: ({ signal }) => getJson<string[]>("/api/audius/me/favorites", signal),
    enabled,
    staleTime: 5 * 60_000,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      track,
      isFavorited,
    }: {
      track: MusicTrack;
      isFavorited: boolean;
    }) => {
      const res = await fetch(`/api/audius/favorites/${track.id}`, {
        method: isFavorited ? "DELETE" : "POST",
        headers: isFavorited ? undefined : { "Content-Type": "application/json" },
        body: isFavorited
          ? undefined
          : JSON.stringify({
              title: track.title,
              artist: track.artist,
              artwork: track.artwork,
              duration: track.duration,
            }),
      });
      if (!res.ok) throw new Error("Could not update favorite");
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites }),
  });
}
