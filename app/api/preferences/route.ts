import { NextResponse } from "next/server";
import { getMyBeatsUser } from "@/lib/current-user";
import { getPreferences, savePreferences } from "@/lib/preferences";

const unauthorized = NextResponse.json(
  { success: false, message: "Sign in with Google first.", code: "SIGN_IN_REQUIRED" },
  { status: 401 }
);

export async function GET() {
  const user = await getMyBeatsUser();
  if (!user) return unauthorized;

  const preferences = await getPreferences(user.id);
  return NextResponse.json({ success: true, data: preferences });
}

export async function PUT(request: Request) {
  const user = await getMyBeatsUser();
  if (!user) return unauthorized;

  const body = await request.json().catch(() => null);
  const languages = Array.isArray(body?.languages)
    ? body.languages.filter((v: unknown): v is string => typeof v === "string")
    : [];

  if (languages.length === 0) {
    return NextResponse.json(
      { success: false, message: "Pick at least one language." },
      { status: 400 }
    );
  }

  const asStrings = (value: unknown) =>
    Array.isArray(value)
      ? value.filter((v: unknown): v is string => typeof v === "string")
      : [];

  try {
    const saved = await savePreferences(user.id, {
      languages,
      genres: asStrings(body?.genres),
      moods: asStrings(body?.moods),
      country: typeof body?.country === "string" ? body.country : null,
    });
    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    console.error("Save preferences failed:", error);
    return NextResponse.json(
      { success: false, message: "Couldn't save preferences." },
      { status: 500 }
    );
  }
}
