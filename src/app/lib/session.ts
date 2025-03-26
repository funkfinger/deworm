import { cookies } from "next/headers";
import { type SpotifyTokenResponse, type SpotifyUser } from "./spotify";
import Cookies from "js-cookie";

// Cookie names
const STATE_COOKIE_NAME = "spotify_auth_state";
const ACCESS_TOKEN_COOKIE_NAME = "spotify_access_token";
const REFRESH_TOKEN_COOKIE_NAME = "spotify_refresh_token";
const TOKEN_EXPIRY_COOKIE_NAME = "spotify_token_expiry";
const USER_COOKIE_NAME = "spotify_user";

// Cookie options
const SERVER_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 30 * 24 * 60 * 60, // 30 days
};

// Server-side session management functions
export async function saveAuthState(state: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE_NAME, state, SERVER_COOKIE_OPTIONS);
}

export async function getAuthState(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(STATE_COOKIE_NAME)?.value;
}

export async function clearAuthState(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(STATE_COOKIE_NAME);
}

export async function saveTokens(
  tokenData: SpotifyTokenResponse
): Promise<void> {
  const { access_token, refresh_token, expires_in } = tokenData;

  // Calculate token expiry time
  const expiryTime = new Date().getTime() + expires_in * 1000;

  const cookieStore = await cookies();
  cookieStore.set(
    ACCESS_TOKEN_COOKIE_NAME,
    access_token,
    SERVER_COOKIE_OPTIONS
  );
  cookieStore.set(
    TOKEN_EXPIRY_COOKIE_NAME,
    expiryTime.toString(),
    SERVER_COOKIE_OPTIONS
  );

  if (refresh_token) {
    cookieStore.set(
      REFRESH_TOKEN_COOKIE_NAME,
      refresh_token,
      SERVER_COOKIE_OPTIONS
    );
  }
}

export async function saveUserProfile(user: SpotifyUser): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(
    USER_COOKIE_NAME,
    JSON.stringify(user),
    SERVER_COOKIE_OPTIONS
  );
}

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value;
}

export async function getTokenExpiry(): Promise<number | undefined> {
  const cookieStore = await cookies();
  const expiry = cookieStore.get(TOKEN_EXPIRY_COOKIE_NAME)?.value;
  return expiry ? parseInt(expiry, 10) : undefined;
}

export async function getUserProfile(): Promise<SpotifyUser | undefined> {
  const cookieStore = await cookies();
  const userJson = cookieStore.get(USER_COOKIE_NAME)?.value;
  return userJson ? JSON.parse(userJson) : undefined;
}

export async function isTokenExpired(): Promise<boolean> {
  const expiry = await getTokenExpiry();
  if (!expiry) return true;

  // Add a 60 second buffer to account for processing time
  return Date.now() + 60000 > expiry;
}

export async function isAuthenticated(): Promise<boolean> {
  const accessToken = await getAccessToken();
  const tokenExpired = await isTokenExpired();
  return !!accessToken && !tokenExpired;
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE_NAME);
  cookieStore.delete(REFRESH_TOKEN_COOKIE_NAME);
  cookieStore.delete(TOKEN_EXPIRY_COOKIE_NAME);
  cookieStore.delete(USER_COOKIE_NAME);
  cookieStore.delete(STATE_COOKIE_NAME);
}

// Client-side session management functions
export function getAccessTokenClient(): string | undefined {
  return Cookies.get(ACCESS_TOKEN_COOKIE_NAME);
}

export function getRefreshTokenClient(): string | undefined {
  return Cookies.get(REFRESH_TOKEN_COOKIE_NAME);
}

export function getTokenExpiryClient(): number | undefined {
  const expiry = Cookies.get(TOKEN_EXPIRY_COOKIE_NAME);
  return expiry ? parseInt(expiry, 10) : undefined;
}

export function getUserProfileClient(): SpotifyUser | undefined {
  const userJson = Cookies.get(USER_COOKIE_NAME);
  return userJson ? JSON.parse(userJson) : undefined;
}

export function isTokenExpiredClient(): boolean {
  const expiry = getTokenExpiryClient();
  if (!expiry) return true;

  // Add a 60 second buffer to account for processing time
  return Date.now() + 60000 > expiry;
}

export function isAuthenticatedClient(): boolean {
  const accessToken = getAccessTokenClient();
  const tokenExpired = isTokenExpiredClient();
  return !!accessToken && !tokenExpired;
}
