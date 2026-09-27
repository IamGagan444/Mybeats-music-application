"use client";

import { useEffect } from "react";
import { useFavoriteIds } from "@/hooks/queries";
import { useAppDispatch } from "@/store";
import { favoritesActions } from "@/store/favoritesSlice";

/** Seeds the favorites slice once so every heart knows its state without its own request. */
export function FavoritesProvider({ isSignedIn }: { isSignedIn: boolean }) {
  const dispatch = useAppDispatch();
  const { data } = useFavoriteIds(isSignedIn);

  useEffect(() => {
    dispatch(favoritesActions.hydrate({ ids: data ?? [], isSignedIn }));
  }, [data, isSignedIn, dispatch]);

  return null;
}
