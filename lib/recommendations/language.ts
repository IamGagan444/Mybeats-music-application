import type { MusicTrack } from "@/types/music";

/**
 * Audius exposes no language field, so MyBeats infers it from documented
 * metadata only: title, tags, artist name, genre. Nothing here is derived
 * from a user's country.
 *
 * Confidence is deliberate — a track is only labelled when there is real
 * evidence, never to fill a section.
 */

const SCRIPTS: { code: string; re: RegExp; confidence: number }[] = [
  { code: "or", re: /[଀-୿]/, confidence: 0.95 },
  { code: "te", re: /[ఀ-౿]/, confidence: 0.95 },
  { code: "ta", re: /[஀-௿]/, confidence: 0.95 },
  { code: "bn", re: /[ঀ-৿]/, confidence: 0.95 },
  { code: "ml", re: /[ഀ-ൿ]/, confidence: 0.95 },
  { code: "kn", re: /[ಀ-೿]/, confidence: 0.95 },
  { code: "pa", re: /[਀-੿]/, confidence: 0.95 },
  { code: "ar", re: /[؀-ۿ]/, confidence: 0.9 },
  { code: "ko", re: /[가-힯ᄀ-ᇿ]/, confidence: 0.95 },
  { code: "ja", re: /[぀-ゟ゠-ヿ]/, confidence: 0.95 },
];

/** Devanagari covers both Hindi and Marathi; keywords break the tie. */
const DEVANAGARI = /[ऀ-ॿ]/;
/** Han characters alone can't separate Chinese from Japanese kanji. */
const HAN = /[一-鿿]/;

const KEYWORDS: Record<string, string[]> = {
  hi: ["hindi", "bollywood", "filmi", "hindustani"],
  or: ["odia", "oriya", "sambalpuri", "odissi"],
  te: ["telugu", "tollywood"],
  ta: ["tamil", "kollywood"],
  bn: ["bengali", "bangla"],
  mr: ["marathi", "lavani"],
  ml: ["malayalam", "mollywood"],
  kn: ["kannada"],
  pa: ["punjabi", "bhangra", "panjabi"],
  ja: ["japanese", "j-pop", "jpop", "jrock", "vocaloid", "anime"],
  ko: ["korean", "k-pop", "kpop", "khiphop"],
  zh: ["chinese", "mandarin", "cantonese", "c-pop", "cpop"],
  es: ["spanish", "latino", "latina", "reggaeton", "espanol", "español"],
  ar: ["arabic", "arab", "khaleeji"],
  en: ["english"],
};

export interface LanguageMatch {
  code: string;
  confidence: number;
}

/** Below this a track is treated as unknown rather than guessed. */
export const MIN_CONFIDENCE = 0.5;

function searchableText(track: MusicTrack) {
  return [track.title, track.artist, ...(track.tags ?? [])].join(" ");
}

export function classifyLanguages(track: MusicTrack): LanguageMatch[] {
  const text = searchableText(track);
  const lower = text.toLowerCase();
  const scores = new Map<string, number>();

  const bump = (code: string, confidence: number) => {
    scores.set(code, Math.max(scores.get(code) ?? 0, confidence));
  };

  for (const { code, re, confidence } of SCRIPTS) {
    if (re.test(text)) bump(code, confidence);
  }

  if (DEVANAGARI.test(text)) {
    const marathi = KEYWORDS.mr.some((k) => lower.includes(k));
    bump(marathi ? "mr" : "hi", marathi ? 0.9 : 0.8);
  }

  // Han without kana is more likely Chinese, but not conclusively.
  if (HAN.test(text) && !/[぀-ゟ゠-ヿ]/.test(text)) {
    bump("zh", 0.7);
  }

  for (const [code, words] of Object.entries(KEYWORDS)) {
    const inTags = track.tags?.some((tag) =>
      words.includes(tag.toLowerCase())
    );
    if (inTags) bump(code, 0.75);
    else if (words.some((w) => lower.includes(w))) bump(code, 0.6);
  }

  return [...scores]
    .map(([code, confidence]) => ({ code, confidence }))
    .sort((a, b) => b.confidence - a.confidence);
}

export function matchesLanguage(track: MusicTrack, code: string): boolean {
  return classifyLanguages(track).some(
    (m) => m.code === code && m.confidence >= MIN_CONFIDENCE
  );
}

/** 0–1 signal for how well a track fits the user's preferred languages. */
export function languageScore(track: MusicTrack, preferred: string[]): number {
  if (preferred.length === 0) return 0;
  const matches = classifyLanguages(track);
  let best = 0;
  for (const match of matches) {
    if (!preferred.includes(match.code)) continue;
    // Earlier preferences weigh slightly more.
    const rank = preferred.indexOf(match.code);
    const weight = 1 - Math.min(rank, 4) * 0.1;
    best = Math.max(best, match.confidence * weight);
  }
  return best;
}
