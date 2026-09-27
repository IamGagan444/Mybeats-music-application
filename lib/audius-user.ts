import "server-only";
import { AUDIUS_API_BASE, toMusicTrack, type AudiusTrackRaw } from "@/lib/audius";
import type { MusicTrack } from "@/types/music";

const AUDIUS_APP_NAME = "MyBeats";

export class AudiusAuthError extends Error {
  constructor(public status: number) {
    super(`Audius API error: ${status}`);
  }
}

async function audiusAuthFetch<T>(
  path: string,
  accessToken: string,
  params: Record<string, string> = {}
): Promise<T> {
  const url = new URL(`${AUDIUS_API_BASE}${path}`);
  url.searchParams.set("app_name", AUDIUS_APP_NAME);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) throw new AudiusAuthError(res.status);
  return res.json();
}

interface TrackListParams {
  userId: string;
  accessToken: string;
  limit?: number;
  offset?: number;
}

function listParams({ limit = 30, offset = 0 }: TrackListParams) {
  return { limit: String(limit), offset: String(offset) };
}

/** Tracks the user has favorited. */
export async function getFavoriteTracks(
  opts: TrackListParams
): Promise<MusicTrack[]> {
  const { data } = await audiusAuthFetch<{ data: AudiusTrackRaw[] }>(
    `/users/${opts.userId}/favorites/tracks`,
    opts.accessToken,
    listParams(opts)
  );
  return (data ?? []).map(toMusicTrack);
}

/** Saved library — favorites, reposts, purchases or all. */
export async function getLibraryTracks(
  opts: TrackListParams & { type?: "favorites" | "reposts" | "purchases" | "all" }
): Promise<MusicTrack[]> {
  const { data } = await audiusAuthFetch<{ data: AudiusTrackRaw[] }>(
    `/users/${opts.userId}/library/tracks`,
    opts.accessToken,
    { ...listParams(opts), type: opts.type ?? "all" }
  );
  return (data ?? []).map(toMusicTrack);
}

/** Listening history, most recent first. */
export async function getHistoryTracks(
  opts: TrackListParams
): Promise<MusicTrack[]> {
  const { data } = await audiusAuthFetch<{
    data: ({ track?: AudiusTrackRaw } & AudiusTrackRaw)[];
  }>(`/users/${opts.userId}/history/tracks`, opts.accessToken, listParams(opts));

  // History entries wrap the track in an activity envelope on some nodes.
  return (data ?? [])
    .map((entry) => entry.track ?? entry)
    .filter((track): track is AudiusTrackRaw => Boolean(track?.track_id))
    .map(toMusicTrack);
}

export async function setTrackFavorite(opts: {
  trackId: string;
  userId: string;
  accessToken: string;
  favorite: boolean;
}): Promise<void> {
  const url = new URL(`${AUDIUS_API_BASE}/tracks/${opts.trackId}/favorites`);
  url.searchParams.set("user_id", opts.userId);
  url.searchParams.set("app_name", AUDIUS_APP_NAME);

  const res = await fetch(url.toString(), {
    method: opts.favorite ? "POST" : "DELETE",
    headers: {
      Authorization: `Bearer ${opts.accessToken}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new AudiusAuthError(res.status);
}
