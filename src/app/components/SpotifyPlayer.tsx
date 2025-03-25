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
    images?: { url: string; height: number; width: number }[];
  };
  artists: { name: string }[];
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

// Define a more specific SDK player interface
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
  const [useFallback, setUseFallback] = useState(false);
  const playerInitialized = useRef(false);
  const initializationAttempts = useRef(0);
  const uniqueComponentId = useRef(
    `spotify-player-${Math.random().toString(36).substring(2, 9)}`
  );

  // Get track ID from URI for embed fallback
  const getTrackIdFromUri = (uri: string) => {
    if (!uri) return null;
    const parts = uri.split(":");
    return parts.length === 3 && parts[1] === "track" ? parts[2] : null;
  };

  const trackId = getTrackIdFromUri(trackUri);

  // Add debug log helper that includes component ID
  const debugLog = (message: string, data?: unknown) => {
    if (data) {
      console.log(`🎵 [${uniqueComponentId.current}] ${message}`, data);
    } else {
      console.log(`🎵 [${uniqueComponentId.current}] ${message}`);
    }
  };

  // Debug token integrity
  useEffect(() => {
    if (accessToken) {
      try {
        // Check token structure
        const tokenParts = accessToken.split(".");
        if (tokenParts.length !== 3) {
          debugLog(
            "⚠️ Warning: Access token does not appear to be a valid JWT"
          );
          setUseFallback(true);
        } else {
          debugLog("✅ Access token has valid JWT structure");
        }

        // Log token length and first/last 4 chars for debugging
        debugLog(
          `Token length: ${accessToken.length}, Format: ${accessToken.substring(
            0,
            4
          )}...${accessToken.substring(accessToken.length - 4)}`
        );
      } catch (err) {
        debugLog("⚠️ Error inspecting token", err);
        setUseFallback(true);
      }
    } else {
      debugLog("⚠️ No access token provided");
      setUseFallback(true);
    }
  }, [accessToken]);

  // Switch to fallback on errors
  useEffect(() => {
    const fallbackTimeout = setTimeout(() => {
      // If we haven't initialized the player after 5 seconds, switch to fallback
      if (!isReady && !error) {
        debugLog("⚠️ Switching to fallback player due to timeout");
        setUseFallback(true);
      }
    }, 5000);

    return () => clearTimeout(fallbackTimeout);
  }, [isReady, error]);

  // Load Spotify Web Playback SDK script
  useEffect(() => {
    debugLog(
      `Initializing player. SDK loaded: ${!!window.Spotify}, Has token: ${!!accessToken}`
    );

    if (window.Spotify) {
      debugLog("SDK already loaded in window");
      setSdkLoaded(true);
      return;
    }

    debugLog("🔄 Loading Spotify Web Playback SDK script...");
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    script.onload = () => {
      debugLog("✅ Spotify SDK script loaded successfully");
      setSdkLoaded(true);
    };

    script.onerror = (event) => {
      debugLog("❌ Failed to load Spotify SDK", event);
      setError(
        "Failed to load Spotify player. Please refresh the page and try again."
      );
    };

    document.body.appendChild(script);

    return () => {
      debugLog("🧹 Cleaning up SDK script");
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Initialize Spotify Player when SDK is loaded
  useEffect(() => {
    if (!sdkLoaded || !accessToken) {
      debugLog(
        `Not ready to initialize player: SDK loaded: ${sdkLoaded}, Has token: ${!!accessToken}`
      );
      return;
    }

    // Avoid multiple initialization attempts
    if (playerInitialized.current) {
      debugLog("Player already being initialized, skipping");
      return;
    }

    debugLog("🔄 Setting up Spotify Web Playback SDK...");
    playerInitialized.current = true;
    initializationAttempts.current += 1;

    // If we've tried more than 3 times, show an error
    if (initializationAttempts.current > 3) {
      debugLog("❌ Too many initialization attempts. Giving up.");
      setError(
        "Unable to connect to Spotify after multiple attempts. Please refresh the page."
      );
      return;
    }

    // Add a short delay before initializing player to ensure SDK is fully ready
    const initTimer = setTimeout(() => {
      const initializePlayer = () => {
        try {
          debugLog("🔄 Initializing Spotify player with token...");

          // Check if Spotify SDK is available
          if (!window.Spotify) {
            debugLog("❌ Spotify SDK not available yet");
            setError(
              "Spotify player couldn't be initialized. Please refresh the page."
            );
            playerInitialized.current = false;
            return null;
          }

          const newPlayer = new window.Spotify.Player({
            name: "Deworm Web Player",
            getOAuthToken: (callback) => {
              debugLog("🔄 Providing OAuth token to player");
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
              debugLog("❌ Initialization error:", message);
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
              debugLog("❌ Authentication error:", message);
              setError(`Authentication failed: ${message}`);

              // Redirect to login on authentication errors
              debugLog("🔄 Redirecting to login due to authentication error");
              window.location.href = "/api/auth/login";

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
              debugLog("❌ Account error:", message);
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
              debugLog("❌ Playback error:", message);
              setError(`Playback error: ${message}`);
              if (onPlayerError) onPlayerError(new Error(message));
            }
          );

          // Playback status updates
          newPlayer.addListener(
            "player_state_changed",
            (state: Record<string, unknown>) => {
              if (!state) {
                debugLog("🔍 Player state changed but state is null");
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
                const currentTrackName =
                  typeof currentTrackData["name"] === "string"
                    ? currentTrackData["name"]
                    : "unknown";

                debugLog("🔍 Player state changed:", {
                  paused: isPaused,
                  position: position,
                  track: currentTrackName,
                  trackId: currentTrackData["id"],
                  trackUri: currentTrackData["uri"],
                });

                // Only use the track data if we have all required fields
                if (
                  typeof currentTrackData["id"] === "string" &&
                  typeof currentTrackData["name"] === "string" &&
                  typeof currentTrackData["uri"] === "string"
                ) {
                  try {
                    const album = currentTrackData["album"] as
                      | Record<string, unknown>
                      | undefined;
                    const albumName =
                      typeof album?.["name"] === "string"
                        ? (album["name"] as string)
                        : "Unknown Album";

                    let albumImages: {
                      url: string;
                      height: number;
                      width: number;
                    }[] = [];
                    if (album && Array.isArray(album["images"])) {
                      albumImages = album["images"] as {
                        url: string;
                        height: number;
                        width: number;
                      }[];
                    }

                    // Cast to SpotifyTrack with validation
                    const validTrack: SpotifyTrack = {
                      id: currentTrackData["id"] as string,
                      name: currentTrackData["name"] as string,
                      uri: currentTrackData["uri"] as string,
                      album: {
                        name: albumName,
                        images:
                          album &&
                          Array.isArray(album["images"]) &&
                          album["images"].length > 0
                            ? (album["images"] as {
                                url: string;
                                height: number;
                                width: number;
                              }[])
                            : undefined,
                      },
                      artists: Array.isArray(currentTrackData["artists"])
                        ? (currentTrackData[
                            "artists"
                          ] as SpotifyTrack["artists"])
                        : [],
                      duration_ms:
                        typeof currentTrackData["duration_ms"] === "number"
                          ? (currentTrackData["duration_ms"] as number)
                          : 0,
                    };

                    debugLog("✅ Successfully parsed current track:", {
                      id: validTrack.id,
                      name: validTrack.name,
                      album: validTrack.album.name,
                    });
                    setCurrentTrack(validTrack);
                  } catch (parseError) {
                    debugLog("❌ Error parsing track data:", parseError);
                  }
                }
              }

              // Update playing state
              setIsPlaying(!isPaused);

              // Handle track end
              if (isPaused && position === 0 && onTrackEnd) {
                debugLog("🔄 Track ended, calling onTrackEnd callback");
                onTrackEnd();
              }
            }
          );

          // Ready
          newPlayer.addListener("ready", (event: Record<string, unknown>) => {
            const deviceId =
              typeof event["device_id"] === "string" ? event["device_id"] : "";
            if (!deviceId) {
              debugLog("❌ Ready event missing device ID");
              return;
            }

            debugLog("✅ Player ready with Device ID:", deviceId);
            setDeviceId(deviceId);
            setIsReady(true);
            if (onPlayerReady) {
              debugLog("🔄 Calling onPlayerReady callback");
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
              debugLog("❌ Device ID has gone offline:", deviceId);
              setIsReady(false);
            }
          );

          // Connect to the player
          debugLog("🔄 Connecting to Spotify player...");
          newPlayer
            .connect()
            .then((success: boolean) => {
              if (success) {
                debugLog("✅ Player connected successfully");
                setPlayer(newPlayer);
              } else {
                debugLog("❌ Player failed to connect");
                setError("Failed to connect to Spotify. Please try again.");
              }
            })
            .catch((err: Error) => {
              debugLog("❌ Error connecting to player:", err);
              setError(
                "Error connecting to Spotify player. Please refresh and try again."
              );
            });

          return newPlayer;
        } catch (error) {
          debugLog("❌ Error initializing player:", error);
          setError(
            "Failed to initialize Spotify player. Please refresh the page."
          );
          return null;
        }
      };

      try {
        // Initialize player when SDK is ready
        if (window.Spotify) {
          debugLog("🔄 Window.Spotify is available, initializing player");
          const newPlayer = initializePlayer();

          // Check if player was created successfully
          if (!newPlayer) {
            debugLog("❌ Player initialization failed");
            playerInitialized.current = false; // Allow retry
          }
        } else {
          // Set up event listener for when SDK becomes ready
          debugLog("🔄 Setting up onSpotifyWebPlaybackSDKReady callback");
          const spotifyCallback = () => {
            debugLog("🔄 Spotify Web Playback SDK is ready");
            const newPlayer = initializePlayer();
            if (newPlayer) {
              setPlayer(newPlayer);
            }
          };

          window.onSpotifyWebPlaybackSDKReady = spotifyCallback;
        }
      } catch (err) {
        debugLog("❌ Unexpected error during player setup:", err);
        setError("An unexpected error occurred. Please refresh the page.");
        playerInitialized.current = false; // Allow retry
      }
    }, 500); // Short delay before initializing

    // Return cleanup function
    return () => {
      debugLog("🧹 Cleaning up player initialization");
      clearTimeout(initTimer);

      if (player) {
        debugLog("🧹 Disconnecting player on cleanup");
        try {
          player.disconnect();
        } catch (err) {
          debugLog("❌ Error during player disconnect:", err);
        }
      }

      // Clean up Spotify callback if we set it
      if (
        typeof window !== "undefined" &&
        window.onSpotifyWebPlaybackSDKReady
      ) {
        debugLog("🧹 Cleaning up onSpotifyWebPlaybackSDKReady callback");
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
      debugLog("🔍 Not ready to play:", {
        hasDeviceId: !!deviceId,
        hasTrackUri: !!trackUri,
        isReady,
        hasPlayer: !!player,
      });
      return;
    }

    debugLog("🔄 Attempting to play track:", trackUri);

    // Add a slight delay to ensure player is fully ready
    playTimer = setTimeout(() => {
      const playTrack = async () => {
        try {
          debugLog(`🔄 Playing track on device ${deviceId}`);

          // Ensure we still have a valid accessToken
          if (!accessToken) {
            debugLog("❌ No access token available for playback");
            setError("Authentication error. Please log in again.");
            // Redirect to login on missing token
            window.location.href = "/api/auth/login";
            return;
          }

          // First verify the track URI is valid
          if (
            !trackUri ||
            typeof trackUri !== "string" ||
            !trackUri.startsWith("spotify:track:")
          ) {
            debugLog("❌ Invalid track URI:", trackUri);
            setError("Invalid track format. Please try another song.");
            return;
          }

          // Log the exact request we're about to make
          debugLog("🔄 Making play request:", {
            url: `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
            method: "PUT",
            body: JSON.stringify({ uris: [trackUri] }),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken.substring(0, 10)}...`,
            },
          });

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

            debugLog("🔄 Received play response:", {
              status: playResponse.status,
              statusText: playResponse.statusText,
              contentType,
              isJson,
              headers: Object.fromEntries(playResponse.headers.entries()),
            });

            if (playResponse.ok) {
              debugLog("✅ Track playback initiated successfully");
              setIsPlaying(true);
              setError(null);
            } else {
              // Handle specific auth errors
              if (playResponse.status === 401) {
                debugLog("❌ Authentication token expired or invalid");
                setError(
                  "Your Spotify session has expired. Please log in again."
                );

                // Force re-login for authentication issues
                window.location.href = "/api/auth/login";
                return;
              }

              // Try to read the error body, but don't fail if we can't
              let errorMessage = playResponse.statusText || "Unknown error";
              let errorData = null;

              if (isJson) {
                try {
                  errorData = await playResponse.json();
                  debugLog("🔄 Error response body:", errorData);

                  if (errorData && errorData.error && errorData.error.message) {
                    errorMessage = errorData.error.message;

                    // Check for specific Spotify error messages related to authentication
                    if (
                      errorData.error.message.includes("token") ||
                      errorData.error.message.includes("auth") ||
                      errorData.error.message.includes("premium")
                    ) {
                      debugLog(
                        "❌ Spotify subscription or auth issue:",
                        errorMessage
                      );

                      // Redirect for premium requirement or auth issues
                      if (errorData.error.message.includes("premium")) {
                        setError(
                          "Spotify Premium account required for playback."
                        );
                      } else {
                        setError("Authentication issue. Please log in again.");
                        window.location.href = "/api/auth/login";
                        return;
                      }
                    }
                  }
                } catch (parseError) {
                  debugLog("❌ Could not parse error response:", parseError);
                }
              } else {
                // If it's not JSON, log the text response if possible
                try {
                  const textResponse = await playResponse.text();
                  debugLog("🔄 Non-JSON error response:", textResponse);
                } catch (textError) {
                  debugLog("❌ Could not read response text:", textError);
                }
              }

              debugLog(
                "❌ Error playing track:",
                `${playResponse.status} - ${errorMessage}`
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

              // If the player failed, automatically try a different track
              if (onTrackEnd) {
                debugLog("🔄 Play failed, trying next track");
                onTrackEnd();
              }
            }
          } catch (apiError) {
            debugLog("❌ Error playing track via API:", apiError);
            setError("Network error playing track. Please try again.");

            if (onPlayerError) {
              onPlayerError(new Error("Network error playing track"));
            }

            // If we failed completely, try a different track
            if (onTrackEnd) {
              debugLog("🔄 Network error, trying next track");
              onTrackEnd();
            }
          }
        } catch (err) {
          debugLog("❌ Error playing track:", err);
          setError("Failed to play track. Please try again.");

          if (onPlayerError) {
            onPlayerError(new Error("Failed to play track"));
          }

          // If we failed completely, try a different track
          if (onTrackEnd) {
            debugLog("🔄 General error, trying next track");
            onTrackEnd();
          }
        }
      };

      playTrack();
    }, 1000); // 1 second delay

    return () => {
      debugLog("🧹 Cleaning up play track timer");
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
      debugLog("🔄 Toggling playback");
      await player.togglePlay();
    } catch (err) {
      debugLog("❌ Error toggling playback:", err);
      setError("Failed to toggle playback. Please try again.");
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (!player) return;

    try {
      if (isMuted) {
        debugLog("🔄 Unmuting player");
        player.setVolume(volume);
        setIsMuted(false);
      } else {
        debugLog("🔄 Muting player");
        player.setVolume(0);
        setIsMuted(true);
      }
    } catch (err) {
      debugLog("❌ Error toggling mute:", err);
      setError("Failed to toggle mute. Please try again.");
    }
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);

    if (player) {
      debugLog(`🔄 Setting volume to ${newVolume}`);
      player.setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  // Retry player initialization
  const retryInitialization = () => {
    debugLog("🔄 Retrying player initialization");
    setError(null);
    playerInitialized.current = false;

    if (player) {
      try {
        player.disconnect();
      } catch (err) {
        debugLog("❌ Error during disconnect on retry:", err);
      }
    }

    setPlayer(null);
    setIsReady(false);
  };

  // Fallback player for when SDK initialization fails
  const renderFallbackPlayer = () => {
    if (!trackId) {
      return (
        <div className="alert alert-error">
          <span>Invalid track URI format. Cannot play this track.</span>
        </div>
      );
    }

    debugLog("🔄 Using fallback Spotify Embed player for track ID:", trackId);

    return (
      <div className="spotify-embed">
        <iframe
          src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
          width="100%"
          height="152"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          onLoad={() => {
            debugLog("✅ Spotify embed iframe loaded");
            if (onPlayerReady) onPlayerReady();
          }}
          onError={() => {
            debugLog("❌ Spotify embed iframe error");
            if (onPlayerError)
              onPlayerError(new Error("Embed player failed to load"));
          }}
        ></iframe>
        <div className="text-right mt-2">
          <button
            onClick={() => {
              debugLog("🔄 User clicked next in fallback player");
              if (onTrackEnd) onTrackEnd();
            }}
            className="btn btn-sm btn-outline"
          >
            Try Another Song
          </button>
        </div>
      </div>
    );
  };

  if (useFallback) {
    return renderFallbackPlayer();
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={retryInitialization}
            className="btn btn-outline btn-sm"
          >
            <FontAwesomeIcon icon={faRotateRight} className="mr-2" />
            Retry
          </button>
          <button
            onClick={() => setUseFallback(true)}
            className="btn btn-primary btn-sm"
          >
            Use Fallback Player
          </button>
        </div>
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
