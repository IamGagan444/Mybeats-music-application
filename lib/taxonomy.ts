/** Canonical Audius moods (SDK `Mood` enum). Never invent values outside this list. */
export const MOODS = [
  "Peaceful",
  "Romantic",
  "Sentimental",
  "Tender",
  "Easygoing",
  "Yearning",
  "Sophisticated",
  "Sensual",
  "Cool",
  "Gritty",
  "Melancholy",
  "Serious",
  "Brooding",
  "Fiery",
  "Defiant",
  "Aggressive",
  "Rowdy",
  "Excited",
  "Energizing",
  "Empowering",
  "Stirring",
  "Upbeat",
] as const;

export type Mood = (typeof MOODS)[number];

export function isMood(value: string): value is Mood {
  return (MOODS as readonly string[]).includes(value);
}

/** Seeded into the `language` table. Extensible: add a row, no code change. */
export const SEED_LANGUAGES = [
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", sortOrder: 10 },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", sortOrder: 20 },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", sortOrder: 30 },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", sortOrder: 40 },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", sortOrder: 50 },
  { code: "mr", name: "Marathi", nativeName: "मराठी", sortOrder: 60 },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", sortOrder: 70 },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", sortOrder: 80 },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", sortOrder: 90 },
  { code: "en", name: "English", nativeName: "English", sortOrder: 100 },
  { code: "ja", name: "Japanese", nativeName: "日本語", sortOrder: 110 },
  { code: "ko", name: "Korean", nativeName: "한국어", sortOrder: 120 },
  { code: "zh", name: "Chinese", nativeName: "中文", sortOrder: 130 },
  { code: "es", name: "Spanish", nativeName: "Español", sortOrder: 140 },
  { code: "ar", name: "Arabic", nativeName: "العربية", sortOrder: 150 },
];
