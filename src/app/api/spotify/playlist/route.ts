import { getAuthenticatedSpotifyClient } from "@/app/lib/spotify-client";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const playlistId =
    searchParams.get("id") || process.env.SPOTIFY_EARWORM_PLAYLIST_ID;

  if (!playlistId) {
    return NextResponse.json(
      { error: "Playlist ID is required" },
      { status: 400 }
    );
  }

  try {
    const spotifyClient = await getAuthenticatedSpotifyClient();

    if (!spotifyClient) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tracks = await spotifyClient.getPlaylistTracks(playlistId);
    return NextResponse.json({ tracks });
  } catch (error) {
    console.error("Error fetching playlist tracks:", error);
    return NextResponse.json(
      { error: "Failed to fetch playlist tracks" },
      { status: 500 }
    );
  }
}
