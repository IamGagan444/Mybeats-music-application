import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { listFavoriteIds } from "@/lib/favorites";

/** Track ids the signed-in user has favorited, for seeding the client store. */
export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ success: true, data: [], signedIn: false });
  }

  try {
    const ids = await listFavoriteIds(user);
    return NextResponse.json({ success: true, data: ids, signedIn: true });
  } catch (error) {
    console.error("List favorites failed:", error);
    return NextResponse.json(
      { success: false, message: "Couldn't load favorites.", signedIn: true },
      { status: 502 }
    );
  }
}
