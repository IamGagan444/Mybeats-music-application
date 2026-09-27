import { NextRequest, NextResponse } from "next/server";
import {
  buildAuthorizeUrl,
  deriveCodeChallenge,
  generateCodeVerifier,
  generateState,
} from "@/lib/audius-auth";
import { OAUTH_STATE_COOKIE, PKCE_VERIFIER_COOKIE } from "@/lib/session";

export function resolveRedirectUri(request: NextRequest): string {
  // Must exactly match a redirect URI registered on the Audius app.
  // `||` rather than `??`: an empty env var means "unset", not "use empty".
  return (
    process.env.AUDIUS_OAUTH_REDIRECT_URI ||
    new URL("/api/audius/auth/callback", request.nextUrl.origin).toString()
  );
}

export async function GET(request: NextRequest) {
  const codeVerifier = generateCodeVerifier();
  const state = generateState();
  const codeChallenge = await deriveCodeChallenge(codeVerifier);

  const authorizeUrl = buildAuthorizeUrl({
    redirectUri: resolveRedirectUri(request),
    state,
    codeChallenge,
    // "write" also covers reads, and is needed to favorite/unfavorite.
    scope: "write",
  });

  const response = NextResponse.redirect(authorizeUrl);
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 10,
  };
  response.cookies.set(PKCE_VERIFIER_COOKIE, codeVerifier, options);
  response.cookies.set(OAUTH_STATE_COOKIE, state, options);
  return response;
}
