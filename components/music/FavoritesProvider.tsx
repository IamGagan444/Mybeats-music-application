"use client";

import { useEffect } from "react";
import { useFavoritesStore } from "@/stores/favorites";

/**
 * Seeds the favorites store once per session so every heart button knows its
 * initial state without each card making its own request.
 */
export function FavoritesProvider({ isSignedIn }: { isSignedIn: boolean }) {
  useEffect(() => {
    if (!isSignedIn) {
      useFavoritesStore.getState().hydrate([], false);
      return;
    }

    const controller = new AbortController();
    fetch("/api/audius/me/favorites", { signal: controller.signal })
      .then((res) => res.json())
      .then((json: { success: boolean; data?: string[] }) => {
        useFavoritesStore.getState().hydrate(json.data ?? [], true);
      })
      .catch(() => {
        // Non-fatal: hearts just start empty.
      });

    return () => controller.abort();
  }, [isSignedIn]);

  return null;
}
