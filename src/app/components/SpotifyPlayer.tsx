"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faVolumeHigh,
  faVolumeMute,
} from "@fortawesome/free-solid-svg-icons";

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
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize Spotify Player when component mounts
  useEffect(() => {
    // Load Spotify Web Playback SDK script
    if (!window.Spotify) {
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      document.body.appendChild(script);
    }

    // Initialize player when SDK is ready
    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "Deworm Web Player",
        getOAuthToken: (callback) => {
          callback(accessToken);
        },
        volume: volume,
      });

      // Error handling
      player.addListener("initialization_error", ({ message }) => {
        console.error("Initialization error:", message);
        setError(`Player initialization failed: ${message}`);
        if (onPlayerError) onPlayerError(new Error(message));
      });

      player.addListener("authentication_error", ({ message }) => {
        console.error("Authentication error:", message);
        setError(`Authentication failed: ${message}`);
        if (onPlayerError) onPlayerError(new Error(message));
      });

      player.addListener("account_error", ({ message }) => {
        console.error("Account error:", message);
        setError(`Account error: ${message}`);
        if (onPlayerError) onPlayerError(new Error(message));
      });

      player.addListener("playback_error", ({ message }) => {
        console.error("Playback error:", message);
        setError(`Playback error: ${message}`);
        if (onPlayerError) onPlayerError(new Error(message));
      });

      // Playback status updates
      player.addListener("player_state_changed", (state) => {
        if (!state) return;

        // Update track information
        if (state.track_window.current_track) {
          setCurrentTrack(state.track_window.current_track);
        }

        // Update playing state
        setIsPlaying(!state.paused);

        // Handle track end
        if (state.paused && state.position === 0 && onTrackEnd) {
          onTrackEnd();
        }
      });

      // Ready
      player.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID", device_id);
        setDeviceId(device_id);
        setIsReady(true);
        if (onPlayerReady) onPlayerReady();
      });

      // Not Ready
      player.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
        setIsReady(false);
      });

      // Connect to the player
      player.connect();
      setPlayer(player);

      // Cleanup on unmount
      return () => {
        player.disconnect();
      };
    };

    return () => {
      // Cleanup Spotify SDK script when component unmounts
      if (window.Spotify) {
        delete window.onSpotifyWebPlaybackSDKReady;
      }
    };
  }, [accessToken, onPlayerReady, onPlayerError, onTrackEnd, volume]);

  // Play a track when trackUri changes
  useEffect(() => {
    if (!deviceId || !trackUri || !isReady) return;

    const playTrack = async () => {
      try {
        await fetch(
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
        setIsPlaying(true);
      } catch (err) {
        console.error("Error playing track:", err);
        setError("Failed to play track. Please try again.");
      }
    };

    playTrack();
  }, [accessToken, deviceId, isReady, trackUri]);

  // Toggle play/pause
  const togglePlayback = async () => {
    if (!player) return;

    try {
      await player.togglePlay();
    } catch (err) {
      console.error("Error toggling playback:", err);
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
      console.error("Error toggling mute:", err);
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

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
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
                {currentTrack.artists?.map((a: any) => a.name).join(", ")}
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
              className="btn btn-sm btn-ghost btn-circle"
              onClick={toggleMute}
              disabled={!isReady}
              data-testid="mute-button"
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
              disabled={!isReady}
              className="range range-xs range-primary flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Add TypeScript type declaration for Spotify Web Playback SDK
declare global {
  interface Window {
    Spotify: {
      Player: new (options: {
        name: string;
        getOAuthToken: (callback: (token: string) => void) => void;
        volume: number;
      }) => Spotify.Player;
    };
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

// Spotify namespace
namespace Spotify {
  export interface Player {
    connect(): Promise<boolean>;
    disconnect(): void;
    togglePlay(): Promise<void>;
    setVolume(volume: number): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    seek(position_ms: number): Promise<void>;
    addListener(event: string, callback: (event: any) => void): void;
    removeListener(event: string, callback?: (event: any) => void): void;
  }
}
