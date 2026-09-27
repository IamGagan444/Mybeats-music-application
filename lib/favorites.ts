import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { favorites } from "@/db/schema";
import { getAccessToken } from "@/lib/session";
import { getFavoriteTracks, setTrackFavorite } from "@/lib/audius-user";
import type { CurrentUser } from "@/lib/current-user";
import type { MusicTrack } from "@/types/music";

/**
 * Favorites have two backends. Audius sessions read and write the user's real
 * Audius favorites; Google accounts (no Audius identity) use our own table.
 */
async function usesAudius(user: CurrentUser): Promise<string | null> {
  if (user.source !== "audius") return null;
  return getAccessToken();
}

export async function listFavorites(user: CurrentUser): Promise<MusicTrack[]> {
  const accessToken = await usesAudius(user);

  if (accessToken && user.audiusUserId) {
    return getFavoriteTracks({
      userId: user.audiusUserId,
      accessToken,
      limit: 100,
    });
  }

  const rows = await db
    .select()
    .from(favorites)
    .where(eq(favorites.userId, user.id))
    .orderBy(desc(favorites.createdAt))
    .limit(100);

  return rows.map((row) => ({
    id: row.trackId,
    title: row.title,
    artist: row.artist,
    artwork: row.artwork ?? undefined,
    duration: row.duration,
    streamUrl: "",
    provider: "audius" as const,
  }));
}

export async function listFavoriteIds(user: CurrentUser): Promise<string[]> {
  const accessToken = await usesAudius(user);

  if (accessToken && user.audiusUserId) {
    const tracks = await getFavoriteTracks({
      userId: user.audiusUserId,
      accessToken,
      limit: 200,
    });
    return tracks.map((track) => track.id);
  }

  const rows = await db
    .select({ trackId: favorites.trackId })
    .from(favorites)
    .where(eq(favorites.userId, user.id))
    .limit(500);

  return rows.map((row) => row.trackId);
}

export async function addFavorite(
  user: CurrentUser,
  track: Pick<MusicTrack, "id" | "title" | "artist" | "artwork" | "duration">
): Promise<void> {
  const accessToken = await usesAudius(user);

  if (accessToken && user.audiusUserId) {
    await setTrackFavorite({
      trackId: track.id,
      userId: user.audiusUserId,
      accessToken,
      favorite: true,
    });
    return;
  }

  await db
    .insert(favorites)
    .values({
      userId: user.id,
      trackId: track.id,
      title: track.title,
      artist: track.artist,
      artwork: track.artwork ?? null,
      duration: track.duration ?? 0,
    })
    .onConflictDoNothing();
}

export async function removeFavorite(
  user: CurrentUser,
  trackId: string
): Promise<void> {
  const accessToken = await usesAudius(user);

  if (accessToken && user.audiusUserId) {
    await setTrackFavorite({
      trackId,
      userId: user.audiusUserId,
      accessToken,
      favorite: false,
    });
    return;
  }

  await db
    .delete(favorites)
    .where(and(eq(favorites.userId, user.id), eq(favorites.trackId, trackId)));
}
