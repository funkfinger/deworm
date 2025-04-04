"use client";

import { getAuthenticatedSpotifyClient } from "@/app/lib/spotify-client";
import type { SpotifyTrack } from "@/app/models/spotify";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SpotifyPlayerContextType {
  isPlayerReady: boolean;
  currentTrack: SpotifyTrack | null;
  isPlaying: boolean;
  playbackError: string | null;
  initializePlayer: () => Promise<boolean>;
  playTrack: (track: SpotifyTrack) => Promise<void>;
  pausePlayback: () => Promise<void>;
  resumePlayback: () => Promise<void>;
}

const defaultContext: SpotifyPlayerContextType = {
  isPlayerReady: false,
  currentTrack: null,
  isPlaying: false,
  playbackError: null,
  initializePlayer: async () => false,
  playTrack: async () => {},
  pausePlayback: async () => {},
  resumePlayback: async () => {},
};

const SpotifyPlayerContext = createContext<SpotifyPlayerContextType>(defaultContext);

export const useSpotifyPlayer = () => useContext(SpotifyPlayerContext);

export function SpotifyPlayerProvider({ children }: { children: ReactNode }) {
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Initialize the player when the user has interacted
  const initializePlayer = async (): Promise<boolean> => {
    try {
      setHasInteracted(true);
      console.log("Initializing Spotify player...");
      
      // This is just a placeholder to mark that the player is ready
      // In a real implementation, you might initialize the Spotify Web Playback SDK here
      setIsPlayerReady(true);
      return true;
    } catch (error) {
      console.error("Failed to initialize player:", error);
      setPlaybackError("Failed to initialize Spotify player");
      return false;
    }
  };

  // Play a specific track
  const playTrack = async (track: SpotifyTrack): Promise<void> => {
    try {
      setPlaybackError(null);
      
      if (!isPlayerReady) {
        const initialized = await initializePlayer();
        if (!initialized) {
          throw new Error("Player not initialized");
        }
      }
      
      const spotifyClient = await getAuthenticatedSpotifyClient();
      if (!spotifyClient) {
        throw new Error("Not authenticated with Spotify");
      }
      
      console.log("Playing track:", track.name);
      await spotifyClient.playTrack(track.uri);
      
      setCurrentTrack(track);
      setIsPlaying(true);
    } catch (error) {
      console.error("Playback error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setPlaybackError(`Could not play track: ${errorMessage}. Make sure you have an active Spotify device.`);
    }
  };

  // Pause playback
  const pausePlayback = async (): Promise<void> => {
    try {
      const spotifyClient = await getAuthenticatedSpotifyClient();
      if (!spotifyClient) {
        throw new Error("Not authenticated with Spotify");
      }
      
      await spotifyClient.pause();
      setIsPlaying(false);
    } catch (error) {
      console.error("Pause error:", error);
      setPlaybackError("Could not pause playback");
    }
  };

  // Resume playback
  const resumePlayback = async (): Promise<void> => {
    try {
      if (!currentTrack) {
        throw new Error("No track to resume");
      }
      
      const spotifyClient = await getAuthenticatedSpotifyClient();
      if (!spotifyClient) {
        throw new Error("Not authenticated with Spotify");
      }
      
      await spotifyClient.playTrack(currentTrack.uri);
      setIsPlaying(true);
    } catch (error) {
      console.error("Resume error:", error);
      setPlaybackError("Could not resume playback");
    }
  };

  return (
    <SpotifyPlayerContext.Provider
      value={{
        isPlayerReady,
        currentTrack,
        isPlaying,
        playbackError,
        initializePlayer,
        playTrack,
        pausePlayback,
        resumePlayback,
      }}
    >
      {children}
    </SpotifyPlayerContext.Provider>
  );
}
