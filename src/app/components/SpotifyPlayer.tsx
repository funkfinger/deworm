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

// Simple helper type for type checking
type AnyRecord = Record<string, unknown>;

// Spotify event types with proper typing for SDK compatibility
type SpotifyEvent = Record<string, unknown>;

interface SpotifyError {
  message: string;
}

interface SpotifyPlayerState {
  paused: boolean;
  position: number;
  track_window: {
    current_track: SpotifyTrack;
    previous_tracks: SpotifyTrack[];
    next_tracks: SpotifyTrack[];
  };
}

interface SpotifyReadyEvent {
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
  // Use Player interface directly without namespace
  const [player, setPlayer] = useState<Player | null>(null);
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
          player.addListener("initialization_error", (event) => {
            // Type safe access to message property using bracket notation
            const message =
              typeof event["message"] === "string"
                ? event["message"]
                : "Unknown initialization error";

            console.error("❌ Initialization error:", message);
            setError(`Player initialization failed: ${message}`);
            if (onPlayerError) onPlayerError(new Error(message));
          });

          player.addListener("authentication_error", (event) => {
            const message =
              typeof event["message"] === "string"
                ? event["message"]
                : "Unknown authentication error";

            console.error("❌ Authentication error:", message);
            setError(`Authentication failed: ${message}`);
            if (onPlayerError) onPlayerError(new Error(message));
          });

          player.addListener("account_error", (event) => {
            const message =
              typeof event["message"] === "string"
                ? event["message"]
                : "Unknown account error";

            console.error("❌ Account error:", message);
            setError(`Account error: ${message}`);
            if (onPlayerError) onPlayerError(new Error(message));
          });

          player.addListener("playback_error", (event) => {
            const message =
              typeof event["message"] === "string"
                ? event["message"]
                : "Unknown playback error";

            console.error("❌ Playback error:", message);
            setError(`Playback error: ${message}`);
            if (onPlayerError) onPlayerError(new Error(message));
          });

          // Playback status updates
          player.addListener("player_state_changed", (state) => {
            if (!state) {
              console.log("🔍 Player state changed but state is null");
              return;
            }

            // Safely access properties with type checks and bracket notation
            const isPaused =
              typeof state["paused"] === "boolean" ? state["paused"] : true;
            const position =
              typeof state["position"] === "number" ? state["position"] : 0;

            // Safely handle track_window and current_track
            const trackWindowRaw = state["track_window"] as
              | AnyRecord
              | undefined;
            const currentTrackRaw =
              trackWindowRaw && typeof trackWindowRaw === "object"
                ? (trackWindowRaw["current_track"] as AnyRecord | undefined)
                : undefined;

            // Extract track name safely
            const currentTrackName =
              currentTrackRaw &&
              typeof currentTrackRaw === "object" &&
              typeof currentTrackRaw["name"] === "string"
                ? currentTrackRaw["name"]
                : "unknown";

            console.log("🔍 Player state changed:", {
              paused: isPaused,
              position: position,
              track: currentTrackName,
            });

            // Update track information if it looks valid
            if (
              currentTrackRaw &&
              typeof currentTrackRaw === "object" &&
              typeof currentTrackRaw["id"] === "string" &&
              typeof currentTrackRaw["name"] === "string" &&
              typeof currentTrackRaw["uri"] === "string"
            ) {
              // We have enough information to consider this a valid track
              setCurrentTrack(currentTrackRaw as unknown as SpotifyTrack);
            }

            // Update playing state
            setIsPlaying(!isPaused);

            // Handle track end
            if (isPaused && position === 0 && onTrackEnd) {
              onTrackEnd();
            }
          });

          // Ready
          player.addListener("ready", (event) => {
            // Safely access device_id property using bracket notation
            const deviceId =
              typeof event["device_id"] === "string" ? event["device_id"] : "";

            if (!deviceId) {
              console.error("❌ Ready event missing device ID");
              return;
            }

            console.log("✅ Player ready with Device ID", deviceId);
            setDeviceId(deviceId);
            setIsReady(true);
            if (onPlayerReady) onPlayerReady();
          });

          // Not Ready
          player.addListener("not_ready", (event) => {
            // Safely access device_id property using bracket notation
            const deviceId =
              typeof event["device_id"] === "string"
                ? event["device_id"]
                : "unknown";

            console.log("❌ Device ID has gone offline", deviceId);
            setIsReady(false);
          });

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
    let playTimer: NodeJS.Timeout | null = null;

    if (!deviceId || !trackUri || !isReady) {
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
    playTimer = setTimeout(() => {
      const playTrack = async () => {
        try {
          console.log(`🔄 Playing track on device ${deviceId}`);

          // Ensure we still have a valid accessToken
          if (!accessToken) {
            console.error("❌ No access token available for playback");
            setError("Authentication error. Please log in again.");
            return;
          }

          // First verify the track URI is valid
          if (
            !trackUri ||
            typeof trackUri !== "string" ||
            !trackUri.startsWith("spotify:track:")
          ) {
            console.error("❌ Invalid track URI:", trackUri);
            setError("Invalid track format. Please try another song.");
            return;
          }

          // Try to use the API endpoint with proper error handling
          try {
            const playResponse = await fetch(
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

            // Handle non-JSON responses
            const contentType = playResponse.headers.get("content-type");
            const isJson =
              contentType && contentType.includes("application/json");

            if (playResponse.ok) {
              console.log("✅ Track playback initiated successfully");
              setIsPlaying(true);
              setError(null);
            } else {
              // Try to read the error body, but don't fail if we can't
              let errorMessage = playResponse.statusText || "Unknown error";

              if (isJson) {
                try {
                  const errorData = await playResponse.json();
                  if (errorData && errorData.error && errorData.error.message) {
                    errorMessage = errorData.error.message;
                  }
                } catch (parseError) {
                  console.error(
                    "❌ Could not parse error response:",
                    parseError
                  );
                }
              }

              console.error(
                "❌ Error playing track:",
                playResponse.status,
                errorMessage
              );

              if (playResponse.status === 404) {
                setError("Player not found. Try refreshing the page.");
              } else if (playResponse.status === 403) {
                setError("Premium account required for playback.");
              } else {
                setError(`Failed to play track: ${errorMessage}`);
              }

              if (onPlayerError) {
                onPlayerError(new Error(errorMessage));
              }
            }
          } catch (apiError) {
            console.error("❌ Error playing track via API:", apiError);
            setError("Network error playing track. Please try again.");

            if (onPlayerError) {
              onPlayerError(new Error("Network error playing track"));
            }
          }
        } catch (err) {
          console.error("❌ Error playing track:", err);
          setError("Failed to play track. Please try again.");

          if (onPlayerError) {
            onPlayerError(new Error("Failed to play track"));
          }
        }
      };

      playTrack();
    }, 1000); // 1 second delay

    return () => {
      if (playTimer) clearTimeout(playTimer);
    };
  }, [accessToken, deviceId, isReady, trackUri, player, onPlayerError]);

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

// Type declarations for Spotify SDK
declare global {
  // Using interface in a module context to avoid namespace linter error
  interface Spotify {
    Player: {
      prototype: Player;
      new (options: {
        name: string;
        getOAuthToken: (callback: (token: string) => void) => void;
        volume: number;
      }): Player;
    };
  }

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
