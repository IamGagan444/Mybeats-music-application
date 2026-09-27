import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  languages,
  userGenres,
  userLanguages,
  userMoods,
  userPreferences,
} from "@/db/schema";
import { GENRES } from "@/lib/genres";
import { MOODS } from "@/lib/taxonomy";

export interface UserPreferences {
  languages: string[];
  genres: string[];
  moods: string[];
  country: string | null;
  onboardedAt: Date | null;
}

export async function listLanguages() {
  return db
    .select()
    .from(languages)
    .where(eq(languages.isActive, true))
    .orderBy(asc(languages.sortOrder));
}

export async function getPreferences(
  userId: string
): Promise<UserPreferences | null> {
  const [prefs] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId));

  if (!prefs) return null;

  const [langs, genres, moods] = await Promise.all([
    db
      .select({ code: userLanguages.languageCode })
      .from(userLanguages)
      .where(eq(userLanguages.userId, userId))
      .orderBy(asc(userLanguages.rank)),
    db.select({ genre: userGenres.genre }).from(userGenres).where(eq(userGenres.userId, userId)),
    db.select({ mood: userMoods.mood }).from(userMoods).where(eq(userMoods.userId, userId)),
  ]);

  return {
    languages: langs.map((l) => l.code),
    genres: genres.map((g) => g.genre),
    moods: moods.map((m) => m.mood),
    country: prefs.country,
    onboardedAt: prefs.onboardedAt,
  };
}

export async function hasOnboarded(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ onboardedAt: userPreferences.onboardedAt })
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId));

  return Boolean(row?.onboardedAt);
}

export interface SavePreferencesInput {
  languages: string[];
  genres?: string[];
  moods?: string[];
  country?: string | null;
}

/** Replaces the user's preference sets. Unknown values are dropped, not trusted. */
export async function savePreferences(
  userId: string,
  input: SavePreferencesInput
) {
  const validLanguages = await db
    .select({ code: languages.code })
    .from(languages);
  const languageCodes = new Set(validLanguages.map((l) => l.code));

  const langs = [...new Set(input.languages)].filter((c) => languageCodes.has(c));
  const genres = [...new Set(input.genres ?? [])].filter((g) =>
    (GENRES as readonly string[]).includes(g)
  );
  const moods = [...new Set(input.moods ?? [])].filter((m) =>
    (MOODS as readonly string[]).includes(m)
  );

  await db.transaction(async (tx) => {
    await tx
      .insert(userPreferences)
      .values({
        userId,
        country: input.country ?? null,
        onboardedAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: {
          country: input.country ?? null,
          onboardedAt: new Date(),
          updatedAt: new Date(),
        },
      });

    await tx.delete(userLanguages).where(eq(userLanguages.userId, userId));
    await tx.delete(userGenres).where(eq(userGenres.userId, userId));
    await tx.delete(userMoods).where(eq(userMoods.userId, userId));

    if (langs.length) {
      await tx.insert(userLanguages).values(
        langs.map((code, i) => ({ userId, languageCode: code, rank: i }))
      );
    }
    if (genres.length) {
      await tx.insert(userGenres).values(genres.map((genre) => ({ userId, genre })));
    }
    if (moods.length) {
      await tx.insert(userMoods).values(moods.map((mood) => ({ userId, mood })));
    }
  });

  return { languages: langs, genres, moods };
}
