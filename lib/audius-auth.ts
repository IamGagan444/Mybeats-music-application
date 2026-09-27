import "server-only";
import { AUDIUS_API_BASE } from "@/lib/audius";

// Audius OAuth 2.0 + PKCE. Implemented against the REST endpoints directly
// rather than through @audius/sdk, for the bundling reason documented in
// lib/audius.ts, and so tokens stay server-side in httpOnly cookies instead
// of the SDK's browser-visible localStorage token store.

export const AUDIUS_CLIENT_ID = process.env.NEXT_PUBLIC_AUDIUS_API_KEY!;

export interface AudiusTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_expires_in?: number;
}

export interface AudiusAuthUser {
  id: string;
  handle: string;
  name: string;
  avatar?: string;
  isVerified?: boolean;
}

function base64url(bytes: Uint8Array): string {
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function generateCodeVerifier(): string {
  return base64url(crypto.getRandomValues(new Uint8Array(32)));
}

export function generateState(): string {
  return base64url(crypto.getRandomValues(new Uint8Array(16)));
}

export async function deriveCodeChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier)
  );
  return base64url(new Uint8Array(digest));
}

export function buildAuthorizeUrl(params: {
  redirectUri: string;
  state: string;
  codeChallenge: string;
  scope?: "read" | "write";
}): string {
  const url = new URL(`${AUDIUS_API_BASE}/oauth/authorize`);
  url.searchParams.set("scope", params.scope ?? "write");
  url.searchParams.set("state", params.state);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("response_mode", "query");
  url.searchParams.set("api_key", AUDIUS_CLIENT_ID);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("code_challenge", params.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("display", "fullScreen");
  return url.toString();
}

export async function exchangeCodeForTokens(params: {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}): Promise<AudiusTokens> {
  const res = await fetch(`${AUDIUS_API_BASE}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code: params.code,
      code_verifier: params.codeVerifier,
      client_id: AUDIUS_CLIENT_ID,
      redirect_uri: params.redirectUri,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error_description ?? "Token exchange failed.");
  }
  return res.json();
}

export async function refreshTokens(
  refreshToken: string
): Promise<AudiusTokens | null> {
  const res = await fetch(`${AUDIUS_API_BASE}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: AUDIUS_CLIENT_ID,
    }),
  });
  if (!res.ok) return null;
  const tokens: AudiusTokens = await res.json();
  return tokens.access_token ? tokens : null;
}

/** Fetches the profile of whoever owns the given access token. */
export async function fetchAuthUser(
  accessToken: string
): Promise<AudiusAuthUser | null> {
  const res = await fetch(`${AUDIUS_API_BASE}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) return null;

  const json = await res.json();
  const user = json?.data;
  if (!user?.id) return null;

  return {
    id: user.id,
    handle: user.handle,
    name: user.name ?? user.handle,
    avatar:
      user.profile_picture?.["150x150"] ??
      user.profile_picture?.["480x480"] ??
      undefined,
    isVerified: user.is_verified,
  };
}
