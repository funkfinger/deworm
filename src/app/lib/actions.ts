"use server";

import { spotifyFetch, refreshAccessToken } from "./spotify";
import { getAccessToken, getRefreshToken, saveTokens } from "./session";

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
