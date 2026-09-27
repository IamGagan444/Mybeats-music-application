import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

// --- Auth.js core tables (shape required by @auth/drizzle-adapter) ---

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  // Optional Audius link. Enrichment only — never the source of truth for
  // MyBeats-owned data.
  audiusUserId: text("audiusUserId"),
  audiusHandle: text("audiusHandle"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => [
    primaryKey({ columns: [authenticator.userId, authenticator.credentialID] }),
  ]
);

// --- MyBeats data ---

/**
 * MyBeats owns favorites. Only the Audius track id plus a display snapshot is
 * stored — never the catalog itself.
 */
export const favorites = pgTable(
  "favorite",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    trackId: text("trackId").notNull(),
    title: text("title").notNull(),
    artist: text("artist").notNull(),
    artwork: text("artwork"),
    duration: integer("duration").notNull().default(0),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("favorite_user_track_idx").on(table.userId, table.trackId),
    index("favorite_user_created_idx").on(table.userId, table.createdAt),
  ]
);

// --- Preferences ---

/** Extensible language catalog: add a row, no code change. */
export const languages = pgTable("language", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  nativeName: text("nativeName").notNull(),
  sortOrder: integer("sortOrder").notNull().default(100),
  isActive: boolean("isActive").notNull().default(true),
});

/**
 * Scalar preferences. `country` is deliberately separate from language —
 * where someone lives does not determine what they listen to.
 */
export const userPreferences = pgTable("user_preference", {
  userId: text("userId")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  country: text("country"),
  onboardedAt: timestamp("onboardedAt", { mode: "date" }),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
});

export const userLanguages = pgTable(
  "user_language",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    languageCode: text("languageCode")
      .notNull()
      .references(() => languages.code, { onDelete: "cascade" }),
    rank: integer("rank").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.userId, table.languageCode] })]
);

/** Values constrained to the canonical Audius genre list in lib/genres.ts. */
export const userGenres = pgTable(
  "user_genre",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    genre: text("genre").notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.genre] })]
);

/** Values constrained to the canonical Audius Mood enum in lib/taxonomy.ts. */
export const userMoods = pgTable(
  "user_mood",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    mood: text("mood").notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.mood] })]
);
