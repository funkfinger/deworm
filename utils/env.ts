// Import environment variables from process.env
import Constants from "expo-constants";

// Get environment variables from process.env or Constants.expoConfig.extra
const getEnv = (name: string): string => {
  if (process.env[name]) return process.env[name] || "";
  if (Constants.expoConfig?.extra && Constants.expoConfig.extra[name]) {
    return Constants.expoConfig.extra[name] || "";
  }
  return "";
};

// Export environment variables with fallbacks
export const SPOTIFY_CLIENT_ID = getEnv("SPOTIFY_CLIENT_ID");
export const SPOTIFY_CLIENT_SECRET = getEnv("SPOTIFY_CLIENT_SECRET");

// Validate required environment variables
if (!SPOTIFY_CLIENT_ID) {
  console.warn("SPOTIFY_CLIENT_ID is not set in the environment variables");
}

if (!SPOTIFY_CLIENT_SECRET) {
  console.warn("SPOTIFY_CLIENT_SECRET is not set in the environment variables");
}
