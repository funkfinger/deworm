import { getAuthenticatedSpotifyClient } from "@/app/lib/spotify-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Await params to avoid Next.js warning
    const { id: trackId } = await Promise.resolve(params);

    if (!trackId) {
      return NextResponse.json(
        { error: "Track ID is required" },
        { status: 400 }
      );
    }

    const spotifyClient = await getAuthenticatedSpotifyClient();

    if (!spotifyClient) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const track = await spotifyClient.getTrack(trackId);
    return NextResponse.json(track);
  } catch (error) {
    console.error("Error fetching track:", error);
    return NextResponse.json(
      { error: "Failed to fetch track" },
      { status: 500 }
    );
  }
}
