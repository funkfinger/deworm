// Import environment variables from .env file
import {
  SPOTIFY_CLIENT_ID as ENV_SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET as ENV_SPOTIFY_CLIENT_SECRET,
} from "@env";

// Export environment variables with fallbacks
export const SPOTIFY_CLIENT_ID = ENV_SPOTIFY_CLIENT_ID || "";
export const SPOTIFY_CLIENT_SECRET = ENV_SPOTIFY_CLIENT_SECRET || "";

// Validate required environment variables
if (!SPOTIFY_CLIENT_ID) {
  console.warn("SPOTIFY_CLIENT_ID is not set in the environment variables");
}

if (!SPOTIFY_CLIENT_SECRET) {
  console.warn("SPOTIFY_CLIENT_SECRET is not set in the environment variables");
}
