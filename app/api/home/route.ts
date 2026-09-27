import { NextResponse } from "next/server";
import { getMyBeatsUser } from "@/lib/current-user";
import { getPreferences, listLanguages } from "@/lib/preferences";
import { buildHomeFeed } from "@/lib/recommendations/home";
import { buildSignals } from "@/lib/recommendations/signals";

/**
 * Single aggregation point for the home page. Every Audius call it makes is
 * user-agnostic and cached, so personalization costs no extra upstream
 * requests beyond the shared sections.
 */
export async function GET() {
  const user = await getMyBeatsUser();
  const preferences = user ? await getPreferences(user.id) : null;

  const [languages, signals] = await Promise.all([
    listLanguages().catch(() => []),
    buildSignals(user?.id ?? null, preferences),
  ]);

  try {
    const feed = await buildHomeFeed({
      preferences,
      languageNames: new Map(languages.map((l) => [l.code, l.name])),
      signals,
    });
    return NextResponse.json({ success: true, data: feed });
  } catch (error) {
    console.error("Home feed failed:", error);
    return NextResponse.json(
      { success: false, message: "Couldn't load your home feed." },
      { status: 500 }
    );
  }
}
