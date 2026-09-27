import "server-only";
import { cache } from "react";
import { auth, hasGoogleAuth } from "@/auth";
import { getSessionUser } from "@/lib/session";

/**
 * A MyBeats account. Owns preferences, favorites, history and playlists.
 * Only a Google sign-in produces one, because only that creates a DB row.
 */
export interface MyBeatsUser {
  id: string;
  name: string;
  email?: string | null;
  avatar?: string;
  audiusUserId: string | null;
}

/** Display-level identity for the header. May exist without a MyBeats account. */
export interface CurrentUser {
  source: "google" | "audius";
  name: string;
  avatar?: string;
  /** Null for an Audius-only session: no MyBeats account, no personalization. */
  myBeatsUserId: string | null;
  audiusUserId: string | null;
}

export const getMyBeatsUser = cache(async (): Promise<MyBeatsUser | null> => {
  if (!hasGoogleAuth) return null;

  const session = await auth();
  if (!session?.user?.id) return null;

  return {
    id: session.user.id,
    name: session.user.name ?? "Listener",
    email: session.user.email,
    avatar: session.user.image ?? undefined,
    audiusUserId: session.user.audiusUserId ?? null,
  };
});

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const myBeatsUser = await getMyBeatsUser();
  if (myBeatsUser) {
    return {
      source: "google",
      name: myBeatsUser.name,
      avatar: myBeatsUser.avatar,
      myBeatsUserId: myBeatsUser.id,
      audiusUserId: myBeatsUser.audiusUserId,
    };
  }

  const audiusUser = await getSessionUser();
  if (!audiusUser) return null;

  return {
    source: "audius",
    name: audiusUser.name,
    avatar: audiusUser.avatar,
    myBeatsUserId: null,
    audiusUserId: audiusUser.id,
  };
});
