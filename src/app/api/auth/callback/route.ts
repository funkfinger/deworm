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
  console.log("🔍 Auth callback received request", { url: request.url });

  // Get the authorization code and state from the URL
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  console.log("🔍 Auth parameters:", {
    code: code ? "exists" : "missing",
    state: state || "missing",
    error: error || "none",
  });

  // Get the stored state from cookies
  const storedState = await getAuthState();
  console.log("🔍 Stored state in cookie:", storedState || "missing");

  // Clear the state from cookies
  await clearAuthState();

  // Check if authorization was denied
  if (error) {
    console.error("❌ Spotify authorization error:", error);
    return NextResponse.redirect(
      new URL("/auth/error?error=spotify_denied", request.url)
    );
  }

  // Validate state to prevent CSRF attacks
  if (!state || !storedState || state !== storedState) {
    console.error("❌ State validation failed:", { state, storedState });
    return NextResponse.redirect(
      new URL("/auth/error?error=state_mismatch", request.url)
    );
  }

  // Check if code is missing
  if (!code) {
    console.error("❌ No authorization code received from Spotify");
    return NextResponse.redirect(
      new URL("/auth/error?error=no_code", request.url)
    );
  }

  try {
    console.log("🔄 Exchanging code for token...");
    // Exchange the authorization code for an access token
    const tokenData = await exchangeCodeForToken(code);
    console.log("✅ Received token data from Spotify", {
      access_token: tokenData.access_token ? "exists" : "missing",
      expires_in: tokenData.expires_in,
      refresh_token: tokenData.refresh_token ? "exists" : "missing",
    });

    // Save tokens to cookies
    await saveTokens(tokenData);
    console.log("✅ Saved tokens to HTTP-only cookies");

    // Get the user's profile information
    console.log("🔄 Fetching user profile...");
    const userProfile = await getSpotifyUserProfile(tokenData.access_token);
    console.log("✅ Received user profile", {
      id: userProfile.id,
      name: userProfile.display_name,
    });

    // Save user profile to cookies
    await saveUserProfile(userProfile);
    console.log("✅ Saved user profile to HTTP-only cookies");

    // Create a response that redirects to search page (formerly dashboard)
    const response = NextResponse.redirect(new URL("/search", request.url));
    console.log("🔄 Creating redirect response to /search");

    // Set client-side accessible cookies for token persistence
    const expiryTime = new Date().getTime() + tokenData.expires_in * 1000;

    // Set cookies that are accessible to JavaScript - essential for client components
    console.log("🔄 Setting client-accessible cookies...");

    // Set token with both httpOnly and non-httpOnly versions to ensure client access
    response.cookies.set("spotify_access_token", tokenData.access_token, {
      path: "/",
      maxAge: tokenData.expires_in,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: false, // Must be accessible to client JavaScript
    });

    response.cookies.set("spotify_token_expiry", expiryTime.toString(), {
      path: "/",
      maxAge: tokenData.expires_in,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: false, // Must be accessible to client JavaScript
    });

    if (tokenData.refresh_token) {
      response.cookies.set("spotify_refresh_token", tokenData.refresh_token, {
        path: "/",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        httpOnly: false, // Must be accessible to client JavaScript
      });
    }

    response.cookies.set("spotify_user", JSON.stringify(userProfile), {
      path: "/",
      maxAge: tokenData.expires_in,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: false, // Must be accessible to client JavaScript
    });

    console.log("✅ Client-accessible cookies set, redirecting to /search");
    return response;
  } catch (error) {
    console.error("❌ Error during Spotify authentication:", error);
    return NextResponse.redirect(
      new URL("/auth/error?error=auth_failed", request.url)
    );
  }
}
