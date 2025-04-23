import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { SPOTIFY_CLIENT_ID } from "../env";

// Register the redirect URI for web browser
WebBrowser.maybeCompleteAuthSession();

// Spotify API credentials from environment variables
const CLIENT_ID = SPOTIFY_CLIENT_ID;
const REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: "exp",
  path: "spotify-auth-callback",
});

console.log("Spotify Redirect URI:", REDIRECT_URI);

// Scopes for Spotify API access
const SCOPES = [
  "user-read-email",
  "user-read-private",
  "user-read-recently-played",
  "user-top-read",
  "user-library-read",
  "streaming",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
];

// Storage keys
const AUTH_STORAGE_KEY = "spotify_auth_data";
const USER_STORAGE_KEY = "spotify_user_data";

// Types
export interface SpotifyAuthData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: number;
  tokenType: string;
  scope: string;
}

export interface SpotifyUserProfile {
  id: string;
  display_name: string;
  email: string;
  images: Array<{ url: string }>;
  uri: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  uri: string;
  preview_url?: string; // URL to a 30 second preview of the track
}

// Create the auth request
const createAuthRequest = () => {
  return new AuthSession.AuthRequest({
    clientId: CLIENT_ID,
    scopes: SCOPES,
    usePKCE: false,
    responseType: AuthSession.ResponseType.Token,
    redirectUri: REDIRECT_URI,
  });
};

// Save auth data to AsyncStorage
const saveAuthData = async (authData: SpotifyAuthData) => {
  try {
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    return true;
  } catch (error) {
    console.error("Error saving auth data:", error);
    return false;
  }
};

// Save user profile to AsyncStorage
const saveUserProfile = async (userProfile: SpotifyUserProfile) => {
  try {
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userProfile));
    return true;
  } catch (error) {
    console.error("Error saving user profile:", error);
    return false;
  }
};

// Get auth data from AsyncStorage
export const getAuthData = async (): Promise<SpotifyAuthData | null> => {
  try {
    const authDataString = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (authDataString) {
      const authData = JSON.parse(authDataString) as SpotifyAuthData;

      // Check if token is expired
      if (authData.expiresAt < Date.now()) {
        // Token is expired, clear it
        await clearAuthData();
        return null;
      }

      return authData;
    }
    return null;
  } catch (error) {
    console.error("Error getting auth data:", error);
    return null;
  }
};

// Get user profile from AsyncStorage
export const getUserProfile = async (): Promise<SpotifyUserProfile | null> => {
  try {
    const userProfileString = await AsyncStorage.getItem(USER_STORAGE_KEY);
    if (userProfileString) {
      return JSON.parse(userProfileString) as SpotifyUserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

// Clear auth data from AsyncStorage
export const clearAuthData = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Error clearing auth data:", error);
    return false;
  }
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const authData = await getAuthData();
  return !!authData;
};

// Fetch user profile from Spotify API
export const fetchUserProfile = async (
  accessToken: string
): Promise<SpotifyUserProfile | null> => {
  try {
    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      const userProfile = await response.json();
      await saveUserProfile(userProfile);
      return userProfile;
    }

    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

// Login with Spotify
export const loginWithSpotify = async (): Promise<{
  success: boolean;
  authData?: SpotifyAuthData;
  userProfile?: SpotifyUserProfile;
  error?: string;
}> => {
  try {
    const authRequest = createAuthRequest();
    const result = await authRequest.promptAsync({
      authorizationEndpoint: "https://accounts.spotify.com/authorize",
    });

    if (result.type === "success") {
      const { access_token, refresh_token, expires_in, token_type, scope } =
        result.params;

      // Calculate expiration time
      const expiresAt = Date.now() + expires_in * 1000;

      const authData: SpotifyAuthData = {
        accessToken: access_token,
        refreshToken: refresh_token || "",
        expiresIn: expires_in,
        expiresAt,
        tokenType: token_type,
        scope,
      };

      // Save auth data
      await saveAuthData(authData);

      // Fetch user profile
      const userProfile = await fetchUserProfile(access_token);

      return {
        success: true,
        authData,
        userProfile: userProfile || undefined,
      };
    } else if (result.type === "error") {
      return {
        success: false,
        error: result.error?.message || "Authentication failed",
      };
    } else {
      return {
        success: false,
        error: "Authentication was cancelled or failed",
      };
    }
  } catch (error) {
    console.error("Error during Spotify login:", error);
    return {
      success: false,
      error: "An unexpected error occurred during authentication",
    };
  }
};

// Logout from Spotify
export const logoutFromSpotify = async (): Promise<boolean> => {
  return await clearAuthData();
};

// Get the redirect URI for the current platform
export const getRedirectUri = (): string => {
  return REDIRECT_URI;
};

// Get the Spotify client ID
export const getClientId = (): string => {
  return CLIENT_ID;
};

// Search for tracks on Spotify
export const searchTracks = async (
  query: string,
  accessToken: string,
  limit: number = 3
): Promise<SpotifyTrack[]> => {
  try {
    if (!query.trim()) return [];

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        query
      )}&type=track&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      // Log the first track to see its structure
      if (data.tracks.items.length > 0) {
        console.log("Track preview URL:", data.tracks.items[0].preview_url);
      }
      return data.tracks.items;
    }

    console.error("Error searching tracks:", response.status);
    return [];
  } catch (error) {
    console.error("Error searching tracks:", error);
    return [];
  }
};
