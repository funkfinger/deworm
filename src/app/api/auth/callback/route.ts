import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, getSpotifyUserProfile } from "@/app/lib/spotify";
import {
  getAuthState,
  clearAuthState,
  saveTokens,
  saveUserProfile,
} from "@/app/lib/session";

/**
 * Route handler for the Spotify OAuth callback.
 * This is where Spotify redirects users after they authorize (or deny) the application.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Get the authorization code and state from the URL
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Get the stored state from cookies
  const storedState = await getAuthState();

  // Clear the state from cookies
  await clearAuthState();

  // Check if authorization was denied
  if (error) {
    console.error("Spotify authorization error:", error);
    return NextResponse.redirect(
      new URL("/auth/error?error=spotify_denied", request.url)
    );
  }

  // Validate state to prevent CSRF attacks
  if (!state || !storedState || state !== storedState) {
    console.error("State validation failed:", { state, storedState });
    return NextResponse.redirect(
      new URL("/auth/error?error=state_mismatch", request.url)
    );
  }

  // Check if code is missing
  if (!code) {
    console.error("No authorization code received from Spotify");
    return NextResponse.redirect(
      new URL("/auth/error?error=no_code", request.url)
    );
  }

  try {
    // Exchange the authorization code for an access token
    const tokenData = await exchangeCodeForToken(code);

    // Save tokens to cookies
    await saveTokens(tokenData);

    // Get the user's profile information
    const userProfile = await getSpotifyUserProfile(tokenData.access_token);

    // Save user profile to cookies
    await saveUserProfile(userProfile);

    // Successfully authenticated, redirect to dashboard or home
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.error("Error during Spotify authentication:", error);
    return NextResponse.redirect(
      new URL("/auth/error?error=auth_failed", request.url)
    );
  }
}
