"use client";

import type { SpotifyTrack } from "@/app/models/spotify";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

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

const SpotifyPlayerContext =
  createContext<SpotifyPlayerContextType>(defaultContext);

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
      console.log("Spotify player initialized successfully");
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
        console.log("Player not ready, initializing...");
        const initialized = await initializePlayer();
        if (!initialized) {
          throw new Error("Player not initialized");
        }
      }

      console.log("Playing track via API:", track.name, "URI:", track.uri);

      // Use the API route instead of calling the Spotify client directly
      const response = await fetch("/api/spotify/play", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uri: track.uri }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to play track");
      }

      console.log("Playback started successfully");
      setCurrentTrack(track);
      setIsPlaying(true);
      return Promise.resolve();
    } catch (error) {
      console.error("Playback error:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setPlaybackError(
        `Could not play track: ${errorMessage}. Make sure you have an active Spotify device.`
      );
      return Promise.reject(error);
    }
  };

  // Pause playback
  const pausePlayback = async (): Promise<void> => {
    try {
      // Use the API route instead of calling the Spotify client directly
      const response = await fetch("/api/spotify/play", {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to pause playback");
      }

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

      // Use the API route instead of calling the Spotify client directly
      const response = await fetch("/api/spotify/play", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uri: currentTrack.uri }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to resume playback");
      }

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
