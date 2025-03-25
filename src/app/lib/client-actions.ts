"use client";

import { getAccessToken, isTokenExpired } from "./client-session";

// Spotify Playlist ID for earworm replacements
export const REPLACEMENT_PLAYLIST_ID = "0E9WYGYWZBqfmp6eJ0Nl1t";

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

/**
 * Gets tracks from the earworm replacement playlist from the client-side.
 */
export async function getReplacementPlaylistTracks(
  limit: number = 20,
  offset: number = 0
) {
  try {
    const accessToken = getAccessToken();

    if (!accessToken) {
      throw new Error("No access token available");
    }

    if (isTokenExpired()) {
      // We can't refresh the token from client-side, so redirect to auth
      window.location.href = "/api/auth/login";
      return;
    }

    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${REPLACEMENT_PLAYLIST_ID}/tracks?limit=${limit}&offset=${offset}`,
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
    console.error("Error getting playlist tracks:", error);
    throw error;
  }
}

/**
 * Gets information about the replacement playlist itself.
 */
export async function getReplacementPlaylistInfo() {
  try {
    const accessToken = getAccessToken();

    if (!accessToken) {
      throw new Error("No access token available");
    }

    if (isTokenExpired()) {
      window.location.href = "/api/auth/login";
      return;
    }

    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${REPLACEMENT_PLAYLIST_ID}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
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
    console.error("Error getting playlist info:", error);
    throw error;
  }
}
