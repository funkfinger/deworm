"use server";

import { spotifyFetch, refreshAccessToken } from "./spotify";
import { getAccessToken, getRefreshToken, saveTokens } from "./session";

// Spotify Playlist ID for earworm replacements
export const REPLACEMENT_PLAYLIST_ID = "0E9WYGYWZBqfmp6eJ0Nl1t";

/**
 * Fetches the current user's profile from the Spotify API.
 */
export async function getCurrentUserProfile() {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new Error("No access token available");
    }

    return await spotifyFetch("/me", accessToken);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      // Token expired, try refreshing it
      const refreshed = await refreshSpotifyToken();
      if (refreshed) {
        return getCurrentUserProfile();
      }
    }
    throw error;
  }
}

/**
 * Refreshes the Spotify access token.
 */
export async function refreshSpotifyToken(): Promise<boolean> {
  try {
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      return false;
    }

    const tokenData = await refreshAccessToken(refreshToken);
    await saveTokens(tokenData);
    return true;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    return false;
  }
}

/**
 * Searches for tracks on Spotify.
 */
export async function searchSpotifyTracks(query: string, limit: number = 10) {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new Error("No access token available");
    }

    const endpoint = `/search?q=${encodeURIComponent(
      query
    )}&type=track&limit=${limit}`;
    return await spotifyFetch(endpoint, accessToken);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      // Token expired, try refreshing it
      const refreshed = await refreshSpotifyToken();
      if (refreshed) {
        return searchSpotifyTracks(query, limit);
      }
    }
    throw error;
  }
}

/**
 * Gets tracks from the earworm replacement playlist.
 */
export async function getReplacementPlaylistTracks(
  limit: number = 20,
  offset: number = 0
) {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new Error("No access token available");
    }

    const endpoint = `/playlists/${REPLACEMENT_PLAYLIST_ID}/tracks?limit=${limit}&offset=${offset}`;
    return await spotifyFetch(endpoint, accessToken);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      // Token expired, try refreshing it
      const refreshed = await refreshSpotifyToken();
      if (refreshed) {
        return getReplacementPlaylistTracks(limit, offset);
      }
    }
    throw error;
  }
}

/**
 * Adds a track to the earworm replacement playlist.
 */
export async function addTrackToReplacementPlaylist(trackUri: string) {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new Error("No access token available");
    }

    const endpoint = `/playlists/${REPLACEMENT_PLAYLIST_ID}/tracks`;

    return await spotifyFetch(endpoint, accessToken, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris: [trackUri],
        position: 0, // Add to the top of the playlist
      }),
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      // Token expired, try refreshing it
      const refreshed = await refreshSpotifyToken();
      if (refreshed) {
        return addTrackToReplacementPlaylist(trackUri);
      }
    }
    throw error;
  }
}

/**
 * Checks if a track exists in the replacement playlist.
 */
export async function checkTrackInReplacementPlaylist(trackId: string) {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new Error("No access token available");
    }

    // We'll need to potentially check multiple pages of the playlist
    let offset = 0;
    const limit = 100; // Max limit for Spotify API
    let tracks: any[] = [];
    let hasMore = true;

    while (hasMore) {
      const endpoint = `/playlists/${REPLACEMENT_PLAYLIST_ID}/tracks?fields=items(track(id)),next&limit=${limit}&offset=${offset}`;
      const response = await spotifyFetch(endpoint, accessToken);

      tracks = [...tracks, ...response.items];

      if (response.next) {
        offset += limit;
      } else {
        hasMore = false;
      }
    }

    // Check if the track ID exists in the playlist
    return tracks.some((item) => item.track.id === trackId);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      // Token expired, try refreshing it
      const refreshed = await refreshSpotifyToken();
      if (refreshed) {
        return checkTrackInReplacementPlaylist(trackId);
      }
    }
    throw error;
  }
}
