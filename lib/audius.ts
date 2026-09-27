// Deliberately bypasses @audius/sdk's TracksApi client. That client depends on
// `cross-fetch`, whose CJS entry resolves fine outside Next.js but gets
// mis-resolved by Turbopack when bundled into a server Route Handler,
// causing every SDK call (getTrendingTracks/searchTracks) to hang for
// minutes or indefinitely. Calling the public REST API directly with native
// `fetch` sidesteps that bundling issue entirely. Revisit @audius/sdk only
// where it's unavoidable (OAuth/PKCE login).
import type { MusicCollection, MusicTrack, MusicUser } from "@/types/music";

export const AUDIUS_HOST = "https://discoveryprovider.audius.co";
export const AUDIUS_API_BASE = `${AUDIUS_HOST}/v1`;
const AUDIUS_APP_NAME = "MyBeats";

export async function audiusFetch<T>(
  path: string,
  params: Record<string, string> = {},
  // Public catalog data is identical for every visitor, so it's cached at the
  // fetch layer. Pages that read cookies render dynamically, which would
  // otherwise mean an upstream Audius call on every single request.
  options: { revalidate?: number } = {}
): Promise<T> {
  const url = new URL(path, AUDIUS_HOST);
  url.searchParams.set("app_name", AUDIUS_APP_NAME);
  url.searchParams.set("api_key", process.env.NEXT_PUBLIC_AUDIUS_API_KEY!);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), {
    next: { revalidate: options.revalidate ?? 300 },
  });
  if (!res.ok) {
    throw new Error(`Audius API error: ${res.status}`);
  }

  return res.json();
}

// Always available regardless of endpoint (trending embeds a signed
// `stream.url` but search/track-details don't); this redirect endpoint is
// the one documented, consistent way to stream any track by id.
export function getStreamUrl(trackId: string): string {
  const url = new URL(`/v1/tracks/${trackId}/stream`, AUDIUS_HOST);
  url.searchParams.set("app_name", AUDIUS_APP_NAME);
  url.searchParams.set("api_key", process.env.NEXT_PUBLIC_AUDIUS_API_KEY!);
  return url.toString();
}

export interface AudiusTrackRaw {
  track_id: number;
  title: string;
  duration: number;
  genre?: string | null;
  mood?: string | null;
  tags?: string | null;
  release_date?: string | null;
  play_count?: number;
  favorite_count?: number;
  artwork?: {
    "480x480"?: string;
    "150x150"?: string;
    "1000x1000"?: string;
  } | null;
  user?: {
    name?: string;
    handle?: string;
    is_verified?: boolean;
  } | null;
}

export function toMusicTrack(raw: AudiusTrackRaw): MusicTrack {
  const id = String(raw.track_id);
  return {
    id,
    title: raw.title,
    artist: raw.user?.name ?? "Unknown Artist",
    artistHandle: raw.user?.handle,
    artwork: raw.artwork?.["480x480"] ?? raw.artwork?.["150x150"] ?? undefined,
    artworkSmall: raw.artwork?.["150x150"] ?? raw.artwork?.["480x480"] ?? undefined,
    duration: raw.duration,
    genre: raw.genre ?? undefined,
    mood: raw.mood ?? undefined,
    tags: raw.tags ? raw.tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
    releaseDate: raw.release_date ?? undefined,
    streamUrl: getStreamUrl(id),
    provider: "audius",
    playCount: raw.play_count,
    favoriteCount: raw.favorite_count,
    isVerified: raw.user?.is_verified,
  };
}

interface AudiusImage {
  "150x150"?: string;
  "480x480"?: string;
  "1000x1000"?: string;
}

export interface AudiusUserRaw {
  id: string;
  handle: string;
  name?: string;
  is_verified?: boolean;
  follower_count?: number;
  track_count?: number;
  profile_picture?: AudiusImage | null;
}

export interface AudiusCollectionRaw {
  id: string;
  playlist_name?: string;
  is_album?: boolean;
  track_count?: number;
  artwork?: AudiusImage | null;
  user?: { name?: string; handle?: string } | null;
}

export function toMusicUser(raw: AudiusUserRaw): MusicUser {
  return {
    id: raw.id,
    handle: raw.handle,
    name: raw.name ?? raw.handle,
    avatar: raw.profile_picture?.["150x150"] ?? raw.profile_picture?.["480x480"],
    isVerified: raw.is_verified,
    followerCount: raw.follower_count,
    trackCount: raw.track_count,
  };
}

export function toMusicCollection(raw: AudiusCollectionRaw): MusicCollection {
  return {
    id: raw.id,
    name: raw.playlist_name ?? "Untitled",
    artwork: raw.artwork?.["150x150"] ?? raw.artwork?.["480x480"],
    owner: raw.user?.name ?? "Unknown",
    trackCount: raw.track_count ?? 0,
    isAlbum: Boolean(raw.is_album),
  };
}
