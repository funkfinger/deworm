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
  activateElement(): void;
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
  autoPlay?: boolean;
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

// Device state persistence key
const DEVICE_STATE_KEY = "spotify_device_state";

// Add Spotify device interface
interface SpotifyDevice {
  id: string;
  is_active: boolean;
  name: string;
  type: string;
  volume_percent: number;
}

export default function SpotifyPlayer({
  accessToken,
  trackUri,
  onPlayerReady,
  onPlayerError,
  onTrackEnd,
  autoPlay,
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
  const [isReconnecting, setIsReconnecting] = useState(false);
  const playerInitialized = useRef(false);
  const initializationAttempts = useRef(0);
  const reconnectAttempts = useRef(0);
  const instanceId = useRef(`player-${Math.random().toString(36).slice(2, 9)}`);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  // Debug logger that includes component instance ID
  const log = (message: string, data?: unknown) => {
    const prefix = `[SpotifyPlayer:${instanceId.current}]`;
    console.log(`${prefix} ${message}`, data === undefined ? "" : data);
  };

  // Load persisted device state
  useEffect(() => {
    try {
      const persistedState = localStorage.getItem(DEVICE_STATE_KEY);
      if (persistedState) {
        const { deviceId: savedDeviceId, volume: savedVolume } =
          JSON.parse(persistedState);
        if (savedDeviceId) {
          setDeviceId(savedDeviceId);
          log("Loaded persisted device ID:", savedDeviceId);
        }
        if (typeof savedVolume === "number") {
          setVolume(savedVolume);
        }
      }
    } catch (err) {
      log("Error loading persisted device state:", err);
    }
  }, []);

  // Save device state when it changes
  useEffect(() => {
    if (deviceId) {
      try {
        localStorage.setItem(
          DEVICE_STATE_KEY,
          JSON.stringify({ deviceId, volume })
        );
      } catch (err) {
        log("Error saving device state:", err);
      }
    }
  }, [deviceId, volume]);

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

  // Verify device state with Spotify API
  const verifyDeviceState = async () => {
    if (!deviceId || !accessToken) return false;

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/me/player/devices`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        log("Failed to verify device state:", response.status);
        return false;
      }

      const data = await response.json();
      const devices = data.devices || [];
      return devices.some((device: SpotifyDevice) => device.id === deviceId);
    } catch (err) {
      log("Error verifying device state:", err);
      return false;
    }
  };

  // Handle reconnection
  const handleReconnection = async () => {
    if (isReconnecting || reconnectAttempts.current >= 3) {
      log("Max reconnection attempts reached");
      setError("Failed to reconnect to Spotify. Please refresh the page.");
      return;
    }

    setIsReconnecting(true);
    reconnectAttempts.current += 1;

    log(`Attempting reconnection (attempt ${reconnectAttempts.current})`);

    // Clear any existing reconnect timeout
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }

    // Verify device state
    const isDeviceValid = await verifyDeviceState();
    if (!isDeviceValid) {
      log("Device state invalid, clearing persisted state");
      localStorage.removeItem(DEVICE_STATE_KEY);
      setDeviceId("");
      setIsReady(false);
      playerInitialized.current = false;
      setIsReconnecting(false);
      return;
    }

    // Try to reconnect
    if (player) {
      try {
        await player.connect();
        log("Reconnected successfully");
        setIsReconnecting(false);
        reconnectAttempts.current = 0;
      } catch (err) {
        log("Reconnection failed:", err);
        // Schedule another reconnection attempt
        reconnectTimeout.current = setTimeout(handleReconnection, 2000);
      }
    } else {
      setIsReconnecting(false);
    }
  };

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
                      ? album["name"]
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
                    id: currentTrackData["id"],
                    name: currentTrackData["name"],
                    uri: currentTrackData["uri"],
                    album: {
                      name: albumName,
                      images: albumImages,
                    },
                    artists: Array.isArray(currentTrackData["artists"])
                      ? (currentTrackData["artists"] as { name: string }[])
                      : [],
                    duration_ms:
                      typeof currentTrackData["duration_ms"] === "number"
                        ? currentTrackData["duration_ms"]
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
            typeof event["device_id"] === "string" ? event["device_id"] : null;
          if (!deviceId) {
            log("Ready event missing device ID");
            return;
          }

          log("Player ready with Device ID:", deviceId);
          setDeviceId(deviceId);
          setIsReady(true);

          // Activate the player for mobile support
          newPlayer.activateElement();

          if (onPlayerReady) {
            onPlayerReady();
          }
        });

        // Not Ready
        newPlayer.addListener("not_ready", ({ device_id }) => {
          log("Device ID has gone offline:", device_id);
          setIsReady(false);
          handleReconnection();
        });

        // Connect to the player
        log("Connecting to Spotify player...");
        newPlayer
          .connect()
          .then((success) => {
            if (success) {
              log("Player connected successfully");
              setPlayer(newPlayer);
              reconnectAttempts.current = 0;
            } else {
              log("Player failed to connect");
              setError("Failed to connect to Spotify. Please try again.");
            }
          })
          .catch((err) => {
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

    // Set up the SDK ready callback
    if (window.Spotify) {
      log("Window.Spotify is available, initializing player");
      const newPlayer = initializePlayer();
      if (!newPlayer) {
        log("Player initialization failed");
        playerInitialized.current = false;
      }
    } else {
      log("Setting up onSpotifyWebPlaybackSDKReady callback");
      window.onSpotifyWebPlaybackSDKReady = () => {
        log("Spotify Web Playback SDK is ready");
        const newPlayer = initializePlayer();
        if (newPlayer) {
          setPlayer(newPlayer);
        }
      };
    }

    // Return cleanup function
    return () => {
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

    if (!deviceId || !trackUri || !isReady || !player) {
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

          // Verify device state before attempting playback
          const isDeviceValid = await verifyDeviceState();
          if (!isDeviceValid) {
            log("Device state invalid, attempting reconnection");
            handleReconnection();
            return;
          }

          // Use the Web Playback SDK's native playback method
          try {
            // First ensure we're connected
            const connected = await player.connect();
            if (!connected) {
              throw new Error("Failed to connect to Spotify player");
            }

            // Set the volume before playing
            await player.setVolume(volume);

            // Load the track first
            const loadResponse = await fetch(
              `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
              {
                method: "PUT",
                body: JSON.stringify({ uris: [trackUri] }),
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );

            if (!loadResponse.ok) {
              throw new Error("Failed to load track");
            }

            // Start playback if autoPlay is true
            if (autoPlay) {
              await player.togglePlay();
              setIsPlaying(true);
            }

            setError(null);
            log("Track playback initiated successfully");
          } catch (playbackError) {
            log("Error during playback:", playbackError);
            setError("Failed to play track. Please try again.");
            if (onPlayerError) {
              onPlayerError(new Error("Failed to play track"));
            }
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
    volume,
    autoPlay,
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
            <span className="text-sm opacity-75">
              {isReconnecting
                ? "Reconnecting to Spotify..."
                : "Connecting to Spotify..."}
            </span>
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
