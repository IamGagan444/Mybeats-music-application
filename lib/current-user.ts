import "server-only";
import { cache } from "react";
import { auth, hasGoogleAuth } from "@/auth";
import { getSessionUser } from "@/lib/session";

export interface CurrentUser {
  /** Which sign-in produced this session. */
  source: "audius" | "google";
  /** MyBeats-side id: the Audius user id, or the database user id. */
  id: string;
  name: string;
  avatar?: string;
  /** Present for Audius sessions, or Google accounts that linked Audius. */
  audiusUserId: string | null;
}

/**
 * The signed-in user from either provider. An Audius session wins when both
 * exist, because it unlocks the Audius-backed library.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const audiusUser = await getSessionUser();
  if (audiusUser) {
    return {
      source: "audius",
      id: audiusUser.id,
      name: audiusUser.name,
      avatar: audiusUser.avatar,
      audiusUserId: audiusUser.id,
    };
  }

  if (!hasGoogleAuth) return null;

  const session = await auth();
  if (!session?.user) return null;

  return {
    source: "google",
    id: session.user.id,
    name: session.user.name ?? "Listener",
    avatar: session.user.image ?? undefined,
    audiusUserId: session.user.audiusUserId ?? null,
  };
});
