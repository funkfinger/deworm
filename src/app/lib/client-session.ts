"use client";

import Cookies from "js-cookie";
import { type SpotifyUser } from "./spotify";

// Cookie names
const ACCESS_TOKEN_COOKIE_NAME = "spotify_access_token";
const REFRESH_TOKEN_COOKIE_NAME = "spotify_refresh_token";
const TOKEN_EXPIRY_COOKIE_NAME = "spotify_token_expiry";
const USER_COOKIE_NAME = "spotify_user";

// Utility function to check if a cookie exists directly in document.cookie
function cookieExists(name: string): boolean {
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(name + "=") === 0) {
      return true;
    }
  }
  return false;
}

// Client-side session management functions
export function getAccessToken(): string | undefined {
  // First check if cookie exists in document.cookie
  if (!cookieExists(ACCESS_TOKEN_COOKIE_NAME)) {
    console.log("🔍 Client: Access token not found in document.cookie");
    return undefined;
  }

  const token = Cookies.get(ACCESS_TOKEN_COOKIE_NAME);
  console.log(
    "🔍 Client: Access token from cookie:",
    token ? "exists" : "missing"
  );
  return token;
}

export function getRefreshToken(): string | undefined {
  if (!cookieExists(REFRESH_TOKEN_COOKIE_NAME)) {
    console.log("🔍 Client: Refresh token not found in document.cookie");
    return undefined;
  }

  const token = Cookies.get(REFRESH_TOKEN_COOKIE_NAME);
  console.log(
    "🔍 Client: Refresh token from cookie:",
    token ? "exists" : "missing"
  );
  return token;
}

export function getTokenExpiry(): number | undefined {
  if (!cookieExists(TOKEN_EXPIRY_COOKIE_NAME)) {
    console.log("🔍 Client: Token expiry not found in document.cookie");
    return undefined;
  }

  const expiry = Cookies.get(TOKEN_EXPIRY_COOKIE_NAME);
  console.log("🔍 Client: Token expiry from cookie:", expiry || "missing");
  return expiry ? parseInt(expiry, 10) : undefined;
}

export function getUserProfile(): SpotifyUser | undefined {
  if (!cookieExists(USER_COOKIE_NAME)) {
    console.log("🔍 Client: User profile not found in document.cookie");
    return undefined;
  }

  const userJson = Cookies.get(USER_COOKIE_NAME);
  console.log(
    "🔍 Client: User profile from cookie:",
    userJson ? "exists" : "missing"
  );
  if (!userJson) return undefined;

  try {
    return JSON.parse(userJson);
  } catch (error) {
    console.error("❌ Client: Error parsing user profile JSON:", error);
    return undefined;
  }
}

export function isTokenExpired(): boolean {
  const expiry = getTokenExpiry();
  if (!expiry) {
    console.log("❌ Client: No token expiry found, considering expired");
    return true;
  }

  // Add a 60 second buffer to account for processing time
  const isExpired = Date.now() + 60000 > expiry;
  console.log(
    `🔍 Client: Token expiry check: ${
      isExpired ? "expired" : "valid"
    } (Expires at ${new Date(expiry).toISOString()})`
  );
  return isExpired;
}

export function isAuthenticated(): boolean {
  if (!cookieExists(ACCESS_TOKEN_COOKIE_NAME)) {
    console.log("❌ Client: Access token cookie not found in document.cookie");
    return false;
  }

  const accessToken = getAccessToken();
  const tokenExpired = isTokenExpired();
  const result = !!accessToken && !tokenExpired;
  console.log(
    `🔍 Client: Authentication check: ${
      result ? "authenticated" : "not authenticated"
    }`
  );
  return result;
}

// Debug function to see all cookies
export function debugCookies(): void {
  console.log("🔎 Client: All cookies (document.cookie):", document.cookie);
  console.log(
    "🔎 Client: Access token exists:",
    cookieExists(ACCESS_TOKEN_COOKIE_NAME)
  );
  console.log(
    "🔎 Client: Access token (js-cookie):",
    Cookies.get(ACCESS_TOKEN_COOKIE_NAME)
  );
  console.log(
    "🔎 Client: Refresh token exists:",
    cookieExists(REFRESH_TOKEN_COOKIE_NAME)
  );
  console.log(
    "🔎 Client: Token expiry exists:",
    cookieExists(TOKEN_EXPIRY_COOKIE_NAME)
  );
  console.log(
    "🔎 Client: User profile exists:",
    cookieExists(USER_COOKIE_NAME)
  );
}
