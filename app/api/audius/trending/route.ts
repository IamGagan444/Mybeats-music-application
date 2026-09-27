import { NextResponse } from "next/server";
import { audiusFetch, toMusicTrack, type AudiusTrackRaw } from "@/lib/audius";

export async function GET() {
  try {
    const { data } = await audiusFetch<{ data: AudiusTrackRaw[] }>(
      "/v1/tracks/trending",
      { limit: "20" }
    );

    return NextResponse.json({
      success: true,
      data: data.map(toMusicTrack),
    });
  } catch (error) {
    console.error("Audius trending error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch trending tracks",
      },
      { status: 500 }
    );
  }
}
