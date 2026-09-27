import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { favorites } from "@/db/schema";
import type { MusicTrack } from "@/types/music";

export type FavoriteInput = Pick<
  MusicTrack,
  "id" | "title" | "artist" | "artwork" | "duration"
>;

export async function listFavorites(userId: string): Promise<MusicTrack[]> {
  const rows = await db
    .select()
    .from(favorites)
    .where(eq(favorites.userId, userId))
    .orderBy(desc(favorites.createdAt))
    .limit(100);

  return rows.map((row) => ({
    id: row.trackId,
    title: row.title,
    artist: row.artist,
    artwork: row.artwork ?? undefined,
    artworkSmall: row.artwork ?? undefined,
    duration: row.duration,
    streamUrl: "",
    provider: "audius" as const,
  }));
}

export async function listFavoriteIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ trackId: favorites.trackId })
    .from(favorites)
    .where(eq(favorites.userId, userId))
    .limit(500);

  return rows.map((row) => row.trackId);
}

export async function addFavorite(userId: string, track: FavoriteInput) {
  await db
    .insert(favorites)
    .values({
      userId,
      trackId: track.id,
      title: track.title,
      artist: track.artist,
      artwork: track.artwork ?? null,
      duration: track.duration ?? 0,
    })
    .onConflictDoNothing();
}

export async function removeFavorite(userId: string, trackId: string) {
  await db
    .delete(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.trackId, trackId)));
}
