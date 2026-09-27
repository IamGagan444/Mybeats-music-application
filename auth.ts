import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { getDb, hasDatabase } from "@/db";
import {
  accounts,
  authenticators,
  sessions,
  users,
  verificationTokens,
} from "@/db/schema";

/**
 * Google sign-in needs both a database (to persist the account) and OAuth
 * credentials. Until both are configured the provider stays off and the app
 * runs Audius-only, rather than failing at import time.
 */
export const hasGoogleAuth =
  hasDatabase &&
  Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: hasGoogleAuth
    ? DrizzleAdapter(getDb(), {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
        authenticatorsTable: authenticators,
      })
    : undefined,
  providers: hasGoogleAuth ? [Google] : [],
  session: { strategy: hasGoogleAuth ? "database" : "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    session({ session, user }) {
      // Surface the linked Audius identity (if any) so the favorites layer
      // can pick the right backend without another query.
      if (user) {
        session.user.id = user.id;
        session.user.audiusUserId = user.audiusUserId ?? null;
        session.user.audiusHandle = user.audiusHandle ?? null;
      }
      return session;
    },
  },
});
