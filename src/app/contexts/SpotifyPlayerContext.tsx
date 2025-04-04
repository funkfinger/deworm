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
  selectTrack: (track: SpotifyTrack) => void;
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
  selectTrack: () => {},
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

  // Select a track (store it without playing)
  const selectTrack = (track: SpotifyTrack): void => {
    console.log("Track selected:", track.name, "URI:", track.uri);
    setCurrentTrack(track);
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

      // Store the track information regardless of playback success
      selectTrack(track);

      console.log(
        "Attempting to play track via API:",
        track.name,
        "URI:",
        track.uri
      );

      try {
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
        setIsPlaying(true);
      } catch (playError) {
        console.warn(
          "Playback warning: No active device found. Track is selected but not playing."
        );
        setPlaybackError(
          "No active Spotify device found. Open Spotify on your device and try the play button below."
        );
        // Don't reject the promise here, we still want to navigate to the solution page
      }

      return Promise.resolve();
    } catch (error) {
      console.error("Player initialization error:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setPlaybackError(`Could not initialize player: ${errorMessage}`);
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
        selectTrack,
        playTrack,
        pausePlayback,
        resumePlayback,
      }}
    >
      {children}
    </SpotifyPlayerContext.Provider>
  );
}
