import "server-only";
import { getTrendingTracks } from "@/lib/genres";
import { searchAudius } from "@/lib/search";
import { matchesLanguage } from "@/lib/recommendations/language";
import {
  emptySignals,
  rankTracks,
  type Signals,
} from "@/lib/recommendations/scoring";
import type { UserPreferences } from "@/lib/preferences";
import type { MusicTrack } from "@/types/music";

export interface HomeSection {
  key: string;
  title: string;
  tracks: MusicTrack[];
}

export interface HomeFeed {
  forYou: MusicTrack[];
  trending: MusicTrack[];
  popularThisWeek: MusicTrack[];
  languageSections: HomeSection[];
  genreSections: HomeSection[];
  moodSections: HomeSection[];
  personalized: boolean;
}

// Caps keep a cold render to a bounded number of upstream calls. Every call
// below is user-agnostic, so the cache is shared across all users.
const MAX_LANGUAGE_SECTIONS = 3;
const MAX_GENRE_SECTIONS = 3;
const MAX_MOOD_SECTIONS = 2;
const SECTION_SIZE = 12;

async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

/**
 * Audius has no language filter, so candidates are sourced with documented
 * search and then verified by the classifier. Tracks without evidence are
 * dropped rather than shown under a language they may not belong to.
 */
async function languageSection(
  code: string,
  name: string
): Promise<HomeSection | null> {
  const results = await safe(searchAudius(name, { limit: 25, full: true }), null);
  if (!results) return null;

  const tracks = results.tracks
    .filter((track) => matchesLanguage(track, code))
    .slice(0, SECTION_SIZE);

  return tracks.length >= 4 ? { key: code, title: name, tracks } : null;
}

function moodSections(pool: MusicTrack[], moods: string[]): HomeSection[] {
  return moods
    .slice(0, MAX_MOOD_SECTIONS)
    .map((mood) => ({
      key: mood,
      title: mood,
      tracks: pool.filter((t) => t.mood === mood).slice(0, SECTION_SIZE),
    }))
    .filter((section) => section.tracks.length >= 4);
}

export async function buildHomeFeed(options: {
  preferences?: UserPreferences | null;
  languageNames?: Map<string, string>;
  signals?: Signals;
}): Promise<HomeFeed> {
  const { preferences, languageNames, signals = emptySignals() } = options;

  const languages = preferences?.languages ?? [];
  const genres = preferences?.genres ?? [];
  const moods = preferences?.moods ?? [];

  const [trending, popularThisWeek] = await Promise.all([
    safe(getTrendingTracks(undefined, 24), []),
    safe(getTrendingTracks(undefined, 18, "week"), []),
  ]);

  const genreSections = (
    await Promise.all(
      genres.slice(0, MAX_GENRE_SECTIONS).map(async (genre) => ({
        key: genre,
        title: genre,
        tracks: await safe(getTrendingTracks(genre, SECTION_SIZE), []),
      }))
    )
  ).filter((section) => section.tracks.length > 0);

  const langSections = (
    await Promise.all(
      languages
        .slice(0, MAX_LANGUAGE_SECTIONS)
        .map((code) => languageSection(code, languageNames?.get(code) ?? code))
    )
  ).filter((section): section is HomeSection => section !== null);

  // Everything already fetched feeds the ranker — no extra calls for "For You".
  const pool = [
    ...trending,
    ...popularThisWeek,
    ...genreSections.flatMap((s) => s.tracks),
    ...langSections.flatMap((s) => s.tracks),
  ];

  const personalized = languages.length > 0 || genres.length > 0 || moods.length > 0;

  return {
    forYou: personalized ? rankTracks(pool, signals, SECTION_SIZE) : [],
    trending,
    popularThisWeek,
    languageSections: langSections,
    genreSections,
    moodSections: moodSections(pool, moods),
    personalized,
  };
}
