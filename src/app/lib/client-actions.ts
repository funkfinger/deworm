"use client";

import { getAccessToken, isTokenExpired } from "./client-session";

/**
 * Searches for tracks on Spotify from the client-side.
 */
export async function searchSpotifyTracks(query: string, limit: number = 10) {
  try {
    const accessToken = getAccessToken();

    if (!accessToken) {
      throw new Error("No access token available");
    }

    if (isTokenExpired()) {
      // We can't refresh the token from client-side, so redirect to auth
      // This is a simplified approach - a better solution would use an API route
      window.location.href = "/api/auth/login";
      return;
    }

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        query
      )}&type=track&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, redirect to auth
        window.location.href = "/api/auth/login";
        return;
      }

      const error = await response.json();
      throw new Error(
        `Spotify API error: ${error.error?.message || "Unknown error"}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error searching tracks:", error);
    throw error;
  }
}
