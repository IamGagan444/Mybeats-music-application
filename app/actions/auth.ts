"use server";

import { signIn, signOut } from "@/auth";
import { clearSessionCookies } from "@/lib/session";

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/" });
}

/** Ends whichever session exists — Audius cookies, Auth.js, or both. */
export async function signOutEverywhere() {
  await clearSessionCookies();
  await signOut({ redirectTo: "/" });
}
