import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import {
  fetchAuthUser,
  refreshTokens,
  type AudiusAuthUser,
  type AudiusTokens,
} from "@/lib/audius-auth";

const ACCESS_TOKEN_COOKIE = "mb_at";
const REFRESH_TOKEN_COOKIE = "mb_rt";
export const PKCE_VERIFIER_COOKIE = "mb_pkce";
export const OAUTH_STATE_COOKIE = "mb_state";

const REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function setSessionCookies(tokens: AudiusTokens) {
  const store = await cookies();
  store.set(
    ACCESS_TOKEN_COOKIE,
    tokens.access_token,
    cookieOptions(tokens.expires_in ?? 60 * 60)
  );
  if (tokens.refresh_token) {
    store.set(
      REFRESH_TOKEN_COOKIE,
      tokens.refresh_token,
      cookieOptions(tokens.refresh_expires_in ?? REFRESH_MAX_AGE)
    );
  }
}

export async function clearSessionCookies() {
  const store = await cookies();
  for (const name of [
    ACCESS_TOKEN_COOKIE,
    REFRESH_TOKEN_COOKIE,
    PKCE_VERIFIER_COOKIE,
    OAUTH_STATE_COOKIE,
  ]) {
    store.delete(name);
  }
}

/**
 * Returns a usable access token, transparently refreshing an expired one.
 *
 * A refresh during a Server Component render can't persist the new cookie
 * (Next only allows cookie writes in Route Handlers / Server Actions), so the
 * refreshed token is used for that request and re-issued on the next write
 * context. Route Handlers get the persisted version.
 */
export const getAccessToken = cache(async (): Promise<string | null> => {
  const store = await cookies();
  const accessToken = store.get(ACCESS_TOKEN_COOKIE)?.value;
  if (accessToken) return accessToken;

  const refreshToken = store.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!refreshToken) return null;

  const tokens = await refreshTokens(refreshToken);
  if (!tokens) return null;

  try {
    await setSessionCookies(tokens);
  } catch {
    // Read-only cookie context (Server Component) — token still usable now.
  }
  return tokens.access_token;
});

/** The signed-in Audius user, or null. Deduped per request. */
export const getSessionUser = cache(async (): Promise<AudiusAuthUser | null> => {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;
  return fetchAuthUser(accessToken);
});
