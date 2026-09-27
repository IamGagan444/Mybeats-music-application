import { NextResponse } from "next/server";
import { getMyBeatsUser } from "@/lib/current-user";
import { addFavorite, removeFavorite } from "@/lib/favorites";

const needsAccount = NextResponse.json(
  { success: false, message: "Sign in with Google to save tracks.", code: "SIGN_IN_REQUIRED" },
  { status: 401 }
);

function str(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/audius/favorites/[trackId]">
) {
  const user = await getMyBeatsUser();
  if (!user) return needsAccount;

  const { trackId } = await ctx.params;
  const body = await request.json().catch(() => ({}));

  try {
    await addFavorite(user.id, {
      id: trackId,
      title: str(body.title, "Unknown track"),
      artist: str(body.artist, "Unknown artist"),
      artwork: typeof body.artwork === "string" ? body.artwork : undefined,
      duration: typeof body.duration === "number" ? body.duration : 0,
    });
    return NextResponse.json({ success: true, data: { favorite: true } });
  } catch (error) {
    console.error("Add favorite failed:", error);
    return NextResponse.json(
      { success: false, message: "Couldn't save this track." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/audius/favorites/[trackId]">
) {
  const user = await getMyBeatsUser();
  if (!user) return needsAccount;

  const { trackId } = await ctx.params;

  try {
    await removeFavorite(user.id, trackId);
    return NextResponse.json({ success: true, data: { favorite: false } });
  } catch (error) {
    console.error("Remove favorite failed:", error);
    return NextResponse.json(
      { success: false, message: "Couldn't update this track." },
      { status: 500 }
    );
  }
}
