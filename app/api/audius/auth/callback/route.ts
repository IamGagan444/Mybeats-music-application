import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/audius-auth";
import { OAUTH_STATE_COOKIE, PKCE_VERIFIER_COOKIE } from "@/lib/session";
import { resolveRedirectUri } from "@/app/api/audius/auth/login/route";

function failure(request: NextRequest, reason: string) {
  const url = new URL("/", request.nextUrl.origin);
  url.searchParams.set("auth_error", reason);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const error = params.get("error");
  if (error) {
    return failure(request, error === "access_denied" ? "cancelled" : "failed");
  }

  const code = params.get("code");
  const state = params.get("state");
  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;
  const codeVerifier = request.cookies.get(PKCE_VERIFIER_COOKIE)?.value;

  if (!code || !state || !codeVerifier) {
    return failure(request, "expired");
  }
  // CSRF: the state we issued must come back unchanged.
  if (!expectedState || state !== expectedState) {
    return failure(request, "state_mismatch");
  }

  let tokens;
  try {
    tokens = await exchangeCodeForTokens({
      code,
      codeVerifier,
      redirectUri: resolveRedirectUri(request),
    });
  } catch (err) {
    console.error("Audius token exchange failed:", err);
    return failure(request, "failed");
  }

  const response = NextResponse.redirect(new URL("/", request.nextUrl.origin));
  const secure = process.env.NODE_ENV === "production";
  const base = { httpOnly: true, secure, sameSite: "lax" as const, path: "/" };

  response.cookies.set("mb_at", tokens.access_token, {
    ...base,
    maxAge: tokens.expires_in ?? 60 * 60,
  });
  if (tokens.refresh_token) {
    response.cookies.set("mb_rt", tokens.refresh_token, {
      ...base,
      maxAge: tokens.refresh_expires_in ?? 60 * 60 * 24 * 30,
    });
  }
  response.cookies.delete(PKCE_VERIFIER_COOKIE);
  response.cookies.delete(OAUTH_STATE_COOKIE);
  return response;
}
