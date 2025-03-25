"use client";

import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faVolumeHigh,
  faVolumeMute,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";

// Types for Spotify objects
interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  album: {
    name: string;
    images?: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
  artists?: Array<{
    name: string;
  }>;
  duration_ms: number;
}

// Spotify event interfaces with looser typing to match SDK expectations
interface SpotifyEventBase extends Record<string, unknown> {
  // Base interface that extends Record<string, unknown> for compatibility
}

interface SpotifyError extends SpotifyEventBase {
  message: string;
}

interface SpotifyPlayerState extends SpotifyEventBase {
  paused: boolean;
  position: number;
  track_window: {
    current_track: SpotifyTrack;
    previous_tracks: SpotifyTrack[];
    next_tracks: SpotifyTrack[];
  };
}

interface SpotifyReadyEvent extends SpotifyEventBase {
  device_id: string;
}

type SpotifyPlayerProps = {
  accessToken: string;
  trackUri?: string;
  onPlayerReady?: () => void;
  onPlayerError?: (error: Error) => void;
  onTrackEnd?: () => void;
};

export default function SpotifyPlayer({
  accessToken,
  trackUri,
  onPlayerReady,
  onPlayerError,
  onTrackEnd,
}: SpotifyPlayerProps) {
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [deviceId, setDeviceId] = useState<string>("");
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const playerInitialized = useRef(false);
  const initializationAttempts = useRef(0);

  // Load Spotify Web Playback SDK script
  useEffect(() => {
    if (window.Spotify) {
      setSdkLoaded(true);
      return;
    }

    console.log("🔄 Loading Spotify Web Playback SDK script...");
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    script.onload = () => {
      console.log("✅ Spotify SDK script loaded");
      setSdkLoaded(true);
    };

    script.onerror = () => {
      console.error("❌ Failed to load Spotify SDK");
      setError(
        "Failed to load Spotify player. Please refresh the page and try again."
      );
    };

    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Initialize Spotify Player when SDK is loaded
  useEffect(() => {
    if (!sdkLoaded || !accessToken) return;

    // Avoid multiple initialization attempts
    if (playerInitialized.current) {
      console.log("Player already being initialized, skipping");
      return;
    }

    console.log("🔄 Setting up Spotify Web Playback SDK...");
    playerInitialized.current = true;
    initializationAttempts.current += 1;

    // If we've tried more than 3 times, show an error
    if (initializationAttempts.current > 3) {
      console.error("❌ Too many initialization attempts. Giving up.");
      setError(
        "Unable to connect to Spotify after multiple attempts. Please refresh the page."
      );
      return;
    }

    // Add a short delay before initializing player to ensure SDK is fully ready
    const initTimer = setTimeout(() => {
      const initializePlayer = () => {
        try {
          console.log("🔄 Initializing Spotify player with token...");

          // Check if Spotify SDK is available
          if (!window.Spotify) {
            console.error("❌ Spotify SDK not available yet");
            setError(
              "Spotify player couldn't be initialized. Please refresh the page."
            );
            playerInitialized.current = false;
            return null;
          }

          const player = new window.Spotify.Player({
            name: "Deworm Web Player",
            getOAuthToken: (callback) => {
              console.log("🔄 Providing OAuth token to player");
              callback(accessToken);
            },
            volume: volume,
          });

          // Error handling - use type assertion to match SDK expectations
          player.addListener("initialization_error", ((event) => {
            const errorEvent = event as SpotifyError;
            console.error("❌ Initialization error:", errorEvent.message);
            setError(`Player initialization failed: ${errorEvent.message}`);
            if (onPlayerError) onPlayerError(new Error(errorEvent.message));
          }) as (event: Record<string, unknown>) => void);

          player.addListener("authentication_error", ((event) => {
            const errorEvent = event as SpotifyError;
            console.error("❌ Authentication error:", errorEvent.message);
            setError(`Authentication failed: ${errorEvent.message}`);
            if (onPlayerError) onPlayerError(new Error(errorEvent.message));
          }) as (event: Record<string, unknown>) => void);

          player.addListener("account_error", ((event) => {
            const errorEvent = event as SpotifyError;
            console.error("❌ Account error:", errorEvent.message);
            setError(`Account error: ${errorEvent.message}`);
            if (onPlayerError) onPlayerError(new Error(errorEvent.message));
          }) as (event: Record<string, unknown>) => void);

          player.addListener("playback_error", ((event) => {
            const errorEvent = event as SpotifyError;
            console.error("❌ Playback error:", errorEvent.message);
            setError(`Playback error: ${errorEvent.message}`);
            if (onPlayerError) onPlayerError(new Error(errorEvent.message));
          }) as (event: Record<string, unknown>) => void);

          // Playback status updates
          player.addListener("player_state_changed", ((state) => {
            if (!state) {
              console.log("🔍 Player state changed but state is null");
              return;
            }

            // Cast the state to our expected type
            const playerState = state as SpotifyPlayerState;

            console.log("🔍 Player state changed:", {
              paused: playerState.paused,
              position: playerState.position,
              track: playerState.track_window?.current_track?.name || "unknown",
            });

            // Update track information
            if (playerState.track_window?.current_track) {
              setCurrentTrack(playerState.track_window.current_track);
            }

            // Update playing state
            setIsPlaying(!playerState.paused);

            // Handle track end
            if (
              playerState.paused &&
              playerState.position === 0 &&
              onTrackEnd
            ) {
              onTrackEnd();
            }
          }) as (event: Record<string, unknown>) => void);

          // Ready
          player.addListener("ready", ((event) => {
            const readyEvent = event as SpotifyReadyEvent;
            console.log("✅ Player ready with Device ID", readyEvent.device_id);
            setDeviceId(readyEvent.device_id);
            setIsReady(true);
            if (onPlayerReady) onPlayerReady();
          }) as (event: Record<string, unknown>) => void);

          // Not Ready
          player.addListener("not_ready", ((event) => {
            const readyEvent = event as SpotifyReadyEvent;
            console.log("❌ Device ID has gone offline", readyEvent.device_id);
            setIsReady(false);
          }) as (event: Record<string, unknown>) => void);

          // Connect to the player
          console.log("🔄 Connecting to Spotify player...");
          player
            .connect()
            .then((success) => {
              if (success) {
                console.log("✅ Player connected successfully");
                setPlayer(player);
              } else {
                console.error("❌ Player failed to connect");
                setError("Failed to connect to Spotify. Please try again.");
              }
            })
            .catch((err) => {
              console.error("❌ Error connecting to player:", err);
              setError(
                "Error connecting to Spotify player. Please refresh and try again."
              );
            });

          return player;
        } catch (error) {
          console.error("❌ Error initializing player:", error);
          setError(
            "Failed to initialize Spotify player. Please refresh the page."
          );
          return null;
        }
      };

      try {
        // Initialize player when SDK is ready
        if (window.Spotify) {
          const newPlayer = initializePlayer();

          // Check if player was created successfully
          if (!newPlayer) {
            console.error("❌ Player initialization failed");
            playerInitialized.current = false; // Allow retry
          }
        } else {
          // Set up event listener for when SDK becomes ready
          const spotifyCallback = () => {
            console.log("🔄 Spotify Web Playback SDK is ready");
            const newPlayer = initializePlayer();
            if (newPlayer) {
              setPlayer(newPlayer);
            }
          };

          window.onSpotifyWebPlaybackSDKReady = spotifyCallback;
        }
      } catch (err) {
        console.error("❌ Unexpected error during player setup:", err);
        setError("An unexpected error occurred. Please refresh the page.");
        playerInitialized.current = false; // Allow retry
      }
    }, 500); // Short delay before initializing

    // Return cleanup function
    return () => {
      clearTimeout(initTimer);

      if (player) {
        console.log("🧹 Disconnecting player on cleanup");
        try {
          player.disconnect();
        } catch (err) {
          console.error("❌ Error during player disconnect:", err);
        }
      }

      // Clean up Spotify callback if we set it
      if (
        typeof window !== "undefined" &&
        window.onSpotifyWebPlaybackSDKReady
      ) {
        window.onSpotifyWebPlaybackSDKReady = null;
      }

      playerInitialized.current = false;
    };
  }, [
    accessToken,
    onPlayerReady,
    onPlayerError,
    onTrackEnd,
    volume,
    sdkLoaded,
  ]);

  // Play a track when trackUri changes and the player is ready
  useEffect(() => {
    if (!deviceId || !trackUri || !isReady || !player) {
      console.log("🔍 Not ready to play:", {
        hasDeviceId: !!deviceId,
        hasTrackUri: !!trackUri,
        isReady,
        hasPlayer: !!player,
      });
      return;
    }

    console.log("🔄 Attempting to play track:", trackUri);

    // Add a slight delay to ensure player is fully ready
    const playTimer = setTimeout(() => {
      const playTrack = async () => {
        try {
          console.log(`🔄 Playing track on device ${deviceId}`);

          // Ensure we still have a valid accessToken
          if (!accessToken) {
            console.error("❌ No access token available for playback");
            setError("Authentication error. Please log in again.");
            return;
          }

          const response = await fetch(
            `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
            {
              method: "PUT",
              body: JSON.stringify({ uris: [trackUri] }),
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              redirect: "follow",
            }
          );

          if (response.ok) {
            console.log("✅ Track playback initiated successfully");
            setIsPlaying(true);
            setError(null);
          } else {
            const errorData = await response.json().catch(() => ({}));
            console.error(
              "❌ Error playing track:",
              response.status,
              errorData
            );

            if (response.status === 404) {
              setError("Player not found. Try refreshing the page.");
            } else if (response.status === 403) {
              setError("Premium account required for playback.");
            } else {
              setError(
                `Failed to play track: ${
                  errorData.error?.message || response.statusText
                }`
              );
            }
          }
        } catch (err) {
          console.error("❌ Error playing track:", err);
          setError("Failed to play track. Please try again.");
        }
      };

      playTrack();
    }, 1000); // 1 second delay

    return () => clearTimeout(playTimer);
  }, [accessToken, deviceId, isReady, trackUri, player]);

  // Toggle play/pause
  const togglePlayback = async () => {
    if (!player) {
      setError("Player not initialized. Please refresh the page.");
      return;
    }

    try {
      console.log("🔄 Toggling playback");
      await player.togglePlay();
    } catch (err) {
      console.error("❌ Error toggling playback:", err);
      setError("Failed to toggle playback. Please try again.");
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (!player) return;

    try {
      if (isMuted) {
        console.log("🔄 Unmuting player");
        player.setVolume(volume);
        setIsMuted(false);
      } else {
        console.log("🔄 Muting player");
        player.setVolume(0);
        setIsMuted(true);
      }
    } catch (err) {
      console.error("❌ Error toggling mute:", err);
      setError("Failed to toggle mute. Please try again.");
    }
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);

    if (player) {
      console.log(`🔄 Setting volume to ${newVolume}`);
      player.setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  // Retry player initialization
  const retryInitialization = () => {
    console.log("🔄 Retrying player initialization");
    setError(null);
    playerInitialized.current = false;

    if (player) {
      try {
        player.disconnect();
      } catch (err) {
        console.error("❌ Error during disconnect on retry:", err);
      }
    }

    setPlayer(null);
    setIsReady(false);
  };

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
        <button
          onClick={retryInitialization}
          className="btn btn-outline btn-sm"
        >
          <FontAwesomeIcon icon={faRotateRight} className="mr-2" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body p-4">
        {currentTrack ? (
          <div className="flex items-center space-x-4">
            {currentTrack.album?.images?.[0]?.url && (
              <img
                src={currentTrack.album.images[0].url}
                alt={currentTrack.album.name}
                className="w-12 h-12 rounded-md"
              />
            )}
            <div className="flex-1">
              <h3 className="font-bold">{currentTrack.name}</h3>
              <p className="text-sm opacity-75">
                {currentTrack.artists?.map((a) => a.name).join(", ")}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <div
              className="skeleton w-12 h-12 rounded-md"
              data-testid="player-skeleton"
            ></div>
            <div className="flex-1">
              <div className="skeleton h-4 w-4/5 mb-2"></div>
              <div className="skeleton h-3 w-3/5"></div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <button
            className="btn btn-circle btn-primary"
            onClick={togglePlayback}
            disabled={!isReady}
            data-testid="play-pause-button"
          >
            <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
          </button>

          <div className="flex items-center space-x-2 flex-1 ml-4">
            <button
              className="btn btn-circle btn-sm"
              onClick={toggleMute}
              disabled={!isReady}
            >
              <FontAwesomeIcon icon={isMuted ? faVolumeMute : faVolumeHigh} />
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="range range-primary range-xs"
              disabled={!isReady}
            />
          </div>
        </div>

        {!isReady && (
          <div className="text-center mt-4">
            <span className="loading loading-spinner loading-sm mr-2"></span>
            <span className="text-sm opacity-75">Connecting to Spotify...</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Extend Window interface to include Spotify SDK
declare global {
  interface Window {
    Spotify: {
      Player: new (options: {
        name: string;
        getOAuthToken: (callback: (token: string) => void) => void;
        volume: number;
      }) => Spotify.Player;
    };
    onSpotifyWebPlaybackSDKReady: (() => void) | null;
  }
}

// Type declarations for Spotify Web Playback SDK
// Using module declaration instead of namespace for better TS compatibility
declare namespace Spotify {
  interface Player {
    connect(): Promise<boolean>;
    disconnect(): void;
    togglePlay(): Promise<void>;
    setVolume(volume: number): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    seek(position_ms: number): Promise<void>;
    addListener(
      event: string,
      callback: (event: Record<string, unknown>) => void
    ): void;
    removeListener(
      event: string,
      callback?: (event: Record<string, unknown>) => void
    ): void;
  }
}
