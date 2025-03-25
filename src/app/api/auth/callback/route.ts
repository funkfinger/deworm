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

    // Calculate token expiry time
    const expiryTime = new Date(Date.now() + tokenData.expires_in * 1000);
    const maxAgeSeconds = tokenData.expires_in;

    // Create document cookies directly that will be accessible to client JavaScript
    const cookieOptions = `path=/; max-age=${maxAgeSeconds}; SameSite=Lax; ${
      process.env.NODE_ENV === "production" ? "Secure" : ""
    }`;

    // Create a response with a script that sets the cookies via JavaScript
    const redirectUrl = new URL("/search", request.url);
    const htmlResponse = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="refresh" content="0;url=${redirectUrl}">
          <title>Authentication Successful</title>
        </head>
        <body>
          <p>Authentication successful! Redirecting...</p>
          <script>
            // Set cookies directly in the browser to ensure client-side access
            document.cookie = "spotify_access_token=${
              tokenData.access_token
            }; ${cookieOptions}";
            document.cookie = "spotify_token_expiry=${expiryTime.getTime()}; ${cookieOptions}";
            ${
              tokenData.refresh_token
                ? `document.cookie = "spotify_refresh_token=${tokenData.refresh_token}; ${cookieOptions}";`
                : ""
            }
            
            // Fetch user profile and save it as a cookie too
            fetch("https://api.spotify.com/v1/me", {
              headers: {
                "Authorization": "Bearer ${tokenData.access_token}"
              }
            })
            .then(response => response.json())
            .then(profile => {
              document.cookie = "spotify_user=" + encodeURIComponent(JSON.stringify(profile)) + "; ${cookieOptions}";
              window.location.href = "${redirectUrl}"; 
            })
            .catch(error => {
              console.error("Error fetching user profile:", error);
              window.location.href = "${redirectUrl}";
            });
          </script>
        </body>
      </html>
    `;

    // Also save tokens to HTTP-only cookies (for server-side authentication)
    await saveTokens(tokenData);

    console.log("🔄 Fetching user profile for server-side storage...");
    const userProfile = await getSpotifyUserProfile(tokenData.access_token);
    await saveUserProfile(userProfile);

    console.log("✅ Returning HTML with cookie-setting JavaScript");
    return new NextResponse(htmlResponse, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("❌ Error during Spotify authentication:", error);
    return NextResponse.redirect(
      new URL("/auth/error?error=auth_failed", request.url)
    );
  }
}
