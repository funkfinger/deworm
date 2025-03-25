"use client";

import Cookies from "js-cookie";
import { type SpotifyUser } from "./spotify";

// Cookie names
const ACCESS_TOKEN_COOKIE_NAME = "spotify_access_token";
const REFRESH_TOKEN_COOKIE_NAME = "spotify_refresh_token";
const TOKEN_EXPIRY_COOKIE_NAME = "spotify_token_expiry";
const USER_COOKIE_NAME = "spotify_user";

// Client-side session management functions
export function getAccessToken(): string | undefined {
  return Cookies.get(ACCESS_TOKEN_COOKIE_NAME);
}

export function getRefreshToken(): string | undefined {
  return Cookies.get(REFRESH_TOKEN_COOKIE_NAME);
}

export function getTokenExpiry(): number | undefined {
  const expiry = Cookies.get(TOKEN_EXPIRY_COOKIE_NAME);
  return expiry ? parseInt(expiry, 10) : undefined;
}

export function getUserProfile(): SpotifyUser | undefined {
  const userJson = Cookies.get(USER_COOKIE_NAME);
  return userJson ? JSON.parse(userJson) : undefined;
}

export function isTokenExpired(): boolean {
  const expiry = getTokenExpiry();
  if (!expiry) return true;

  // Add a 60 second buffer to account for processing time
  return Date.now() + 60000 > expiry;
}

export function isAuthenticated(): boolean {
  const accessToken = getAccessToken();
  const tokenExpired = isTokenExpired();
  return !!accessToken && !tokenExpired;
}
