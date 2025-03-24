import { NextResponse } from "next/server";
import { generateRandomState, getSpotifyAuthURL } from "@/app/lib/spotify";
import { saveAuthState } from "@/app/lib/session";

/**
 * Route handler for initiating the Spotify OAuth flow.
 * Generates a random state parameter for security and redirects to Spotify's authorization page.
 */
export async function GET(): Promise<NextResponse> {
  // Generate a random state for CSRF protection
  const state = generateRandomState(16);

  // Save the state to cookies to verify it when the user returns
  await saveAuthState(state);

  // Generate the authorization URL with the state
  const authURL = getSpotifyAuthURL(state);

  // Redirect the user to Spotify's authorization page
  return NextResponse.redirect(authURL);
}
