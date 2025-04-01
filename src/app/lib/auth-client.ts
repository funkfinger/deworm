"use client";

import type { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

// Custom Session type with our properties
export interface CustomSession extends Session {
  accessToken?: string;
}

/**
 * Sign in with Spotify
 * @returns Promise that resolves when the sign in process is complete
 */
export const loginWithSpotify = async () => {
  return signIn("spotify", { callbackUrl: "/earworm-search" });
};

/**
 * Sign out of the current session
 * @returns Promise that resolves when the sign out process is complete
 */
export const logout = async () => {
  return signOut({ callbackUrl: "/" });
};

/**
 * Hook to get the current session with Spotify-specific properties
 * @returns The current session with Spotify-specific properties
 */
export const useSpotifySession = () => {
  const { data: session, status } = useSession();
  const customSession = session as CustomSession | null;

  return {
    session: customSession,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
  };
};
