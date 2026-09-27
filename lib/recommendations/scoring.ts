import { languageScore } from "@/lib/recommendations/language";
import type { MusicTrack } from "@/types/music";

/**
 * Deterministic scoring. Each signal returns 0–1 and is combined by weight,
 * so an ML ranker can replace `scoreTrack` without touching callers.
 */
export const WEIGHTS = {
  language: 3,
  genre: 2,
  mood: 1.5,
  affinity: 2,
  popularity: 1,
  recency: 0.5,
} as const;

export interface Signals {
  languages: string[];
  genres: string[];
  moods: string[];
  /** Genres/artists drawn from what the user already favourited or played. */
  affinityGenres: Set<string>;
  affinityArtists: Set<string>;
  /** Tracks already known to the user — excluded from recommendations. */
  seenTrackIds: Set<string>;
}

export function emptySignals(): Signals {
  return {
    languages: [],
    genres: [],
    moods: [],
    affinityGenres: new Set(),
    affinityArtists: new Set(),
    seenTrackIds: new Set(),
  };
}

function popularityScore(track: MusicTrack): number {
  const plays = track.playCount ?? 0;
  if (plays <= 0) return 0;
  // Log scale: 100k plays ≈ 1, so a few viral tracks can't dominate.
  return Math.min(Math.log10(plays + 1) / 5, 1);
}

function recencyScore(track: MusicTrack): number {
  if (!track.releaseDate) return 0;
  const released = Date.parse(track.releaseDate);
  if (Number.isNaN(released)) return 0;
  const days = (Date.now() - released) / 86_400_000;
  if (days < 0) return 0;
  // Full credit for a week old, tapering to zero at a year.
  return Math.max(0, 1 - days / 365);
}

function affinityScore(track: MusicTrack, signals: Signals): number {
  let score = 0;
  if (track.genre && signals.affinityGenres.has(track.genre)) score += 0.6;
  if (signals.affinityArtists.has(track.artist)) score += 0.4;
  return Math.min(score, 1);
}

export function scoreTrack(track: MusicTrack, signals: Signals): number {
  const parts = {
    language: languageScore(track, signals.languages),
    genre: track.genre && signals.genres.includes(track.genre) ? 1 : 0,
    mood: track.mood && signals.moods.includes(track.mood) ? 1 : 0,
    affinity: affinityScore(track, signals),
    popularity: popularityScore(track),
    recency: recencyScore(track),
  };

  let total = 0;
  for (const [key, weight] of Object.entries(WEIGHTS)) {
    total += parts[key as keyof typeof parts] * weight;
  }
  return total;
}

export function rankTracks(
  tracks: MusicTrack[],
  signals: Signals,
  limit: number
): MusicTrack[] {
  const seen = new Set<string>();
  return tracks
    .filter((track) => {
      if (seen.has(track.id) || signals.seenTrackIds.has(track.id)) return false;
      seen.add(track.id);
      return true;
    })
    .map((track) => ({ track, score: scoreTrack(track, signals) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.track);
}
