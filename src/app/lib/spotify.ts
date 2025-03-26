/**
 * Utility functions for interacting with the Spotify API.
 * This includes authentication, token management, and API requests.
 */

// Scopes define what your application can do with the Spotify API
const SPOTIFY_SCOPES = [
  "user-read-private",
  "user-read-email",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "streaming",
  "playlist-read-private",
  "playlist-read-collaborative",
];

// URLs for Spotify Authentication API
const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";

// Environment variables (ensure these are set in .env.local)
const CLIENT_ID = process.env["SPOTIFY_CLIENT_ID"];
const CLIENT_SECRET = process.env["SPOTIFY_CLIENT_SECRET"];
const REDIRECT_URI = process.env["SPOTIFY_REDIRECT_URI"];

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
  throw new Error("Missing required Spotify environment variables");
}

/**
 * Generates a random string for the state parameter in OAuth 2.0 flow.
 * This helps prevent CSRF attacks.
 */
export function generateRandomState(length: number = 16): string {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let state = "";

  for (let i = 0; i < length; i++) {
    state += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return state;
}

/**
 * Creates a URL for Spotify authorization with the appropriate scopes and state.
 */
export function getSpotifyAuthURL(state: string): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID as string,
    response_type: "code",
    redirect_uri: REDIRECT_URI as string,
    state,
    scope: SPOTIFY_SCOPES.join(" "),
    show_dialog: "true", // Always show the Spotify authorization dialog
  });

  return `${SPOTIFY_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchanges an authorization code for an access token and refresh token.
 */
export async function exchangeCodeForToken(
  code: string
): Promise<SpotifyTokenResponse> {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI as string,
    client_id: CLIENT_ID as string,
    client_secret: CLIENT_SECRET as string,
  });

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to exchange code for token: ${
        error.error_description || "Unknown error"
      }`
    );
  }

  return response.json() as Promise<SpotifyTokenResponse>;
}

/**
 * Refreshes an expired access token using a refresh token.
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<SpotifyTokenResponse> {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: CLIENT_ID as string,
    client_secret: CLIENT_SECRET as string,
  });

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to refresh token: ${error.error_description || "Unknown error"}`
    );
  }

  return response.json() as Promise<SpotifyTokenResponse>;
}

/**
 * Makes an authenticated request to the Spotify API.
 */
export async function spotifyFetch<T>(
  endpoint: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${SPOTIFY_API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized: Access token has expired");
    }

    const error = await response.json();
    throw new Error(
      `Spotify API error: ${error.error?.message || "Unknown error"}`
    );
  }

  return response.json() as Promise<T>;
}

/**
 * Gets the user's Spotify profile information.
 */
export async function getSpotifyUserProfile(
  accessToken: string
): Promise<SpotifyUser> {
  return spotifyFetch<SpotifyUser>("/me", accessToken);
}

/**
 * Type definitions for Spotify API responses
 */
export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export type SpotifyImage = {
  url: string;
  height: number;
  width: number;
};

export type SpotifyUser = {
  id: string;
  display_name: string | null;
  email: string;
  images?: SpotifyImage[];
};

export type SpotifyArtist = {
  id: string;
  name: string;
};

export type SpotifyTrack = {
  id: string;
  name: string;
  uri: string;
  album: {
    name: string;
    images: SpotifyImage[];
  };
  artists: SpotifyArtist[];
  duration_ms: number;
};
