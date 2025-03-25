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
    images?: { url: string; height: number; width: number }[] | undefined;
  };
  artists: { name: string }[];
  duration_ms: number;
}

// Define a specific SDK player interface
interface SpotifySDKPlayer {
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

interface SpotifyPlayerProps {
  accessToken: string;
  trackUri: string;
  onPlayerReady?: () => void;
  onPlayerError?: (error: Error) => void;
  onTrackEnd?: () => void;
}

// Define Spotify SDK types locally
interface SpotifyPlayerOptions {
  name: string;
  getOAuthToken: (callback: (token: string) => void) => void;
  volume: number;
}

// Extend Window with Spotify SDK
declare global {
  interface Window {
    Spotify?: {
      Player: new (options: SpotifyPlayerOptions) => SpotifySDKPlayer;
    };
    onSpotifyWebPlaybackSDKReady?: () => void;
  }
}

export default function SpotifyPlayer({
  accessToken,
  trackUri,
  onPlayerReady,
  onPlayerError,
  onTrackEnd,
}: SpotifyPlayerProps) {
  const [player, setPlayer] = useState<SpotifySDKPlayer | null>(null);
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
  const instanceId = useRef(`player-${Math.random().toString(36).slice(2, 9)}`);

  // Debug logger that includes component instance ID
  const log = (message: string, data?: unknown) => {
    const prefix = `[SpotifyPlayer:${instanceId.current}]`;
    console.log(`${prefix} ${message}`, data === undefined ? "" : data);
  };

  // Check if Spotify SDK script is already loaded
  useEffect(() => {
    log(
      `Initializing - SDK loaded: ${!!window.Spotify}, Token available: ${!!accessToken}`
    );

    if (window.Spotify) {
      log("SDK already loaded in window");
      setSdkLoaded(true);
      return;
    }

    log("Loading Spotify Web Playback SDK script");
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    script.onload = () => {
      log("Spotify SDK script loaded successfully");
      setSdkLoaded(true);
    };

    script.onerror = () => {
      log("Failed to load Spotify SDK");
      setError("Failed to load Spotify player. Please refresh the page.");
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
    if (!sdkLoaded || !accessToken) {
      return;
    }

    // Avoid multiple initialization attempts
    if (playerInitialized.current) {
      log("Player already being initialized, skipping");
      return;
    }

    log("Setting up Spotify Web Playback SDK");
    playerInitialized.current = true;
    initializationAttempts.current += 1;

    // If we've tried more than 3 times, show an error
    if (initializationAttempts.current > 3) {
      log("Too many initialization attempts");
      setError("Unable to connect to Spotify. Please refresh the page.");
      return;
    }

    // Add a short delay before initializing player to ensure SDK is fully ready
    const initTimer = setTimeout(() => {
      const initializePlayer = () => {
        try {
          log("Initializing Spotify player with token");

          // Check if Spotify SDK is available
          if (!window.Spotify) {
            log("Spotify SDK not available yet");
            setError(
              "Spotify player couldn't be initialized. Please refresh the page."
            );
            playerInitialized.current = false;
            return null;
          }

          const newPlayer = new window.Spotify.Player({
            name: "Deworm Web Player",
            getOAuthToken: (callback) => {
              log("Providing OAuth token to player");
              callback(accessToken);
            },
            volume: volume,
          });

          // Error handling
          newPlayer.addListener(
            "initialization_error",
            (event: Record<string, unknown>) => {
              const message =
                typeof event["message"] === "string"
                  ? event["message"]
                  : "Unknown initialization error";
              log("Initialization error:", message);
              setError(`Player initialization failed: ${message}`);
              if (onPlayerError) onPlayerError(new Error(message));
            }
          );

          newPlayer.addListener(
            "authentication_error",
            (event: Record<string, unknown>) => {
              const message =
                typeof event["message"] === "string"
                  ? event["message"]
                  : "Unknown authentication error";
              log("Authentication error:", message);
              setError(`Authentication failed: ${message}`);

              // Only redirect if the error clearly indicates a need to re-authenticate
              if (
                message.toLowerCase().includes("token") ||
                message.toLowerCase().includes("expired") ||
                message.toLowerCase().includes("invalid")
              ) {
                window.location.href = "/api/auth/login";
              }

              if (onPlayerError) onPlayerError(new Error(message));
            }
          );

          newPlayer.addListener(
            "account_error",
            (event: Record<string, unknown>) => {
              const message =
                typeof event["message"] === "string"
                  ? event["message"]
                  : "Unknown account error";
              log("Account error:", message);
              setError(`Account error: ${message}`);
              if (onPlayerError) onPlayerError(new Error(message));
            }
          );

          newPlayer.addListener(
            "playback_error",
            (event: Record<string, unknown>) => {
              const message =
                typeof event["message"] === "string"
                  ? event["message"]
                  : "Unknown playback error";
              log("Playback error:", message);
              setError(`Playback error: ${message}`);
              if (onPlayerError) onPlayerError(new Error(message));

              // Try another track on playback errors
              if (onTrackEnd) {
                setTimeout(() => onTrackEnd(), 500);
              }
            }
          );

          // Playback status updates
          newPlayer.addListener(
            "player_state_changed",
            (state: Record<string, unknown>) => {
              if (!state) {
                log("Player state changed but state is null");
                return;
              }

              // Safely access properties with type checks
              const isPaused =
                typeof state["paused"] === "boolean" ? state["paused"] : true;
              const position =
                typeof state["position"] === "number" ? state["position"] : 0;

              // Safely handle track_window and current_track
              const trackWindow = state["track_window"] as
                | Record<string, unknown>
                | undefined;
              const currentTrackData = trackWindow?.["current_track"] as
                | Record<string, unknown>
                | undefined;

              if (currentTrackData) {
                const trackName =
                  typeof currentTrackData["name"] === "string"
                    ? currentTrackData["name"]
                    : "unknown";

                log("Player state changed:", {
                  paused: isPaused,
                  position,
                  track: trackName,
                });

                // Only use the track data if we have all required fields
                if (
                  typeof currentTrackData["id"] === "string" &&
                  typeof currentTrackData["name"] === "string" &&
                  typeof currentTrackData["uri"] === "string"
                ) {
                  try {
                    // Extract album info safely
                    const album = currentTrackData["album"] as
                      | Record<string, unknown>
                      | undefined;
                    const albumName =
                      typeof album?.["name"] === "string"
                        ? (album["name"] as string)
                        : "Unknown Album";

                    // Extract album images safely
                    let albumImages:
                      | { url: string; height: number; width: number }[]
                      | undefined = undefined;
                    if (
                      album &&
                      Array.isArray(album["images"]) &&
                      album["images"].length > 0
                    ) {
                      albumImages = album["images"] as {
                        url: string;
                        height: number;
                        width: number;
                      }[];
                    }

                    // Cast to SpotifyTrack with validation
                    const track: SpotifyTrack = {
                      id: currentTrackData["id"] as string,
                      name: currentTrackData["name"] as string,
                      uri: currentTrackData["uri"] as string,
                      album: {
                        name: albumName,
                        images: albumImages,
                      },
                      artists: Array.isArray(currentTrackData["artists"])
                        ? (currentTrackData["artists"] as { name: string }[])
                        : [],
                      duration_ms:
                        typeof currentTrackData["duration_ms"] === "number"
                          ? (currentTrackData["duration_ms"] as number)
                          : 0,
                    };

                    setCurrentTrack(track);
                  } catch (err) {
                    log("Error parsing track data:", err);
                  }
                }
              }

              // Update playing state
              setIsPlaying(!isPaused);

              // Handle track end
              if (isPaused && position === 0 && onTrackEnd) {
                log("Track ended, triggering onTrackEnd");
                onTrackEnd();
              }
            }
          );

          // Ready
          newPlayer.addListener("ready", (event: Record<string, unknown>) => {
            const deviceId =
              typeof event["device_id"] === "string" ? event["device_id"] : "";
            if (!deviceId) {
              log("Ready event missing device ID");
              return;
            }

            log("Player ready with Device ID:", deviceId);
            setDeviceId(deviceId);
            setIsReady(true);

            if (onPlayerReady) {
              onPlayerReady();
            }
          });

          // Not Ready
          newPlayer.addListener(
            "not_ready",
            (event: Record<string, unknown>) => {
              const deviceId =
                typeof event["device_id"] === "string"
                  ? event["device_id"]
                  : "unknown";
              log("Device ID has gone offline:", deviceId);
              setIsReady(false);
            }
          );

          // Connect to the player
          log("Connecting to Spotify player...");
          newPlayer
            .connect()
            .then((success: boolean) => {
              if (success) {
                log("Player connected successfully");
                setPlayer(newPlayer);
              } else {
                log("Player failed to connect");
                setError("Failed to connect to Spotify. Please try again.");
              }
            })
            .catch((err: Error) => {
              log("Error connecting to player:", err);
              setError(
                "Error connecting to Spotify player. Please refresh the page."
              );
            });

          return newPlayer;
        } catch (error) {
          log("Error initializing player:", error);
          setError(
            "Failed to initialize Spotify player. Please refresh the page."
          );
          return null;
        }
      };

      try {
        // Initialize player when SDK is ready
        if (window.Spotify) {
          log("Window.Spotify is available, initializing player");
          const newPlayer = initializePlayer();

          // Check if player was created successfully
          if (!newPlayer) {
            log("Player initialization failed");
            playerInitialized.current = false; // Allow retry
          }
        } else {
          // Set up event listener for when SDK becomes ready
          log("Setting up onSpotifyWebPlaybackSDKReady callback");
          const spotifyCallback = () => {
            log("Spotify Web Playback SDK is ready");
            const newPlayer = initializePlayer();
            if (newPlayer) {
              setPlayer(newPlayer);
            }
          };

          window.onSpotifyWebPlaybackSDKReady = spotifyCallback;
        }
      } catch (err) {
        log("Unexpected error during player setup:", err);
        setError("An unexpected error occurred. Please refresh the page.");
        playerInitialized.current = false; // Allow retry
      }
    }, 500); // Short delay before initializing

    // Return cleanup function
    return () => {
      clearTimeout(initTimer);

      if (player) {
        log("Disconnecting player on cleanup");
        try {
          player.disconnect();
        } catch (err) {
          log("Error during player disconnect:", err);
        }
      }

      // Clean up Spotify callback if we set it
      if (
        typeof window !== "undefined" &&
        window.onSpotifyWebPlaybackSDKReady
      ) {
        window.onSpotifyWebPlaybackSDKReady = null as unknown as () => void;
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
      log("Not ready to play:", {
        hasDeviceId: !!deviceId,
        hasTrackUri: !!trackUri,
        isReady,
        hasPlayer: !!player,
      });
      return;
    }

    log("Attempting to play track:", trackUri);

    // Add a slight delay to ensure player is fully ready
    playTimer = setTimeout(() => {
      const playTrack = async () => {
        try {
          log(`Playing track on device ${deviceId}`);

          // Ensure we still have a valid accessToken
          if (!accessToken) {
            log("No access token available for playback");
            setError("Authentication error. Please log in again.");
            return;
          }

          // First verify the track URI is valid
          if (
            !trackUri ||
            typeof trackUri !== "string" ||
            !trackUri.startsWith("spotify:track:")
          ) {
            log("Invalid track URI:", trackUri);
            setError("Invalid track format. Please try another song.");
            return;
          }

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

            if (playResponse.ok) {
              log("Track playback initiated successfully");
              setIsPlaying(true);
              setError(null);
            } else {
              // Handle specific status codes
              if (playResponse.status === 401) {
                log("Authentication token expired or invalid");
                setError(
                  "Your Spotify session has expired. Please log in again."
                );
                return;
              }

              // Try to read error response
              let errorMessage = playResponse.statusText || "Unknown error";

              try {
                const contentType = playResponse.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                  const errorData = await playResponse.json();
                  if (errorData && errorData.error && errorData.error.message) {
                    errorMessage = errorData.error.message;

                    // Check for premium account requirement
                    if (errorMessage.includes("premium")) {
                      setError(
                        "Spotify Premium account required for playback."
                      );
                    } else {
                      setError(`Failed to play track: ${errorMessage}`);
                    }

                    if (onPlayerError) {
                      onPlayerError(new Error(errorMessage));
                    }

                    // Try next track on any error
                    if (onTrackEnd) {
                      setTimeout(() => onTrackEnd(), 500);
                    }
                    return;
                  }
                }
              } catch {
                log("Could not parse error response");
              }

              // Generic error handling
              setError(`Failed to play track: ${errorMessage}`);

              if (onPlayerError) {
                onPlayerError(new Error(errorMessage));
              }

              // Try next track on any error
              if (onTrackEnd) {
                setTimeout(() => onTrackEnd(), 500);
              }
            }
          } catch (apiError) {
            log("Network error playing track:", apiError);
            setError("Network error playing track. Please try again.");

            if (onPlayerError) {
              onPlayerError(new Error("Network error playing track"));
            }

            // Try next track
            if (onTrackEnd) {
              setTimeout(() => onTrackEnd(), 500);
            }
          }
        } catch (err) {
          log("Error playing track:", err);
          setError("Failed to play track. Please try again.");

          if (onPlayerError) {
            onPlayerError(new Error("Failed to play track"));
          }

          if (onTrackEnd) {
            setTimeout(() => onTrackEnd(), 500);
          }
        }
      };

      playTrack();
    }, 1000); // 1 second delay

    return () => {
      if (playTimer) clearTimeout(playTimer);
    };
  }, [
    accessToken,
    deviceId,
    isReady,
    trackUri,
    player,
    onPlayerError,
    onTrackEnd,
  ]);

  // Toggle play/pause
  const togglePlayback = async () => {
    if (!player) {
      setError("Player not initialized. Please refresh the page.");
      return;
    }

    try {
      await player.togglePlay();
    } catch (err) {
      log("Error toggling playback:", err);
      setError("Failed to toggle playback. Please try again.");
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (!player) return;

    try {
      if (isMuted) {
        player.setVolume(volume);
        setIsMuted(false);
      } else {
        player.setVolume(0);
        setIsMuted(true);
      }
    } catch (err) {
      log("Error toggling mute:", err);
      setError("Failed to toggle mute. Please try again.");
    }
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);

    if (player) {
      player.setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  // Retry player initialization
  const retryInitialization = () => {
    setError(null);
    playerInitialized.current = false;

    if (player) {
      try {
        player.disconnect();
      } catch (err) {
        log("Error during disconnect on retry:", err);
      }
    }

    setPlayer(null);
    setIsReady(false);
  };

  // Show error with retry button
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
          Retry Connection
        </button>
      </div>
    );
  }

  // Loading state while initializing
  if (!isReady || !player) {
    return (
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body p-4">
          <div className="flex items-center space-x-4">
            <div className="skeleton w-12 h-12 rounded-md"></div>
            <div className="flex-1">
              <div className="skeleton h-4 w-4/5 mb-2"></div>
              <div className="skeleton h-3 w-3/5"></div>
            </div>
          </div>
          <div className="text-center mt-4">
            <span className="loading loading-spinner loading-sm mr-2"></span>
            <span className="text-sm opacity-75">Connecting to Spotify...</span>
          </div>
        </div>
      </div>
    );
  }

  // Player UI
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
            <div className="skeleton w-12 h-12 rounded-md"></div>
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
      </div>
    </div>
  );
}
