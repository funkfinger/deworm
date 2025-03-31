'use client';

import type { SpotifyTrack } from '@/app/models/spotify';
import {
  faBackward,
  faForward,
  faPause,
  faPlay,
  faVolumeHigh,
  faVolumeMute,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback, useEffect, useState } from 'react';

// Define the SDK Player object
declare global {
  interface Window {
    Spotify: {
      Player: new (options: SpotifyPlayerOptions) => SpotifyPlayerInstance;
    };
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

// Type definitions for Spotify Web Playback SDK
interface SpotifyPlayerOptions {
  name: string;
  getOAuthToken: (callback: (token: string) => void) => void;
  volume: number;
}

interface SpotifyPlayerInstance {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  addListener: (event: string, callback: (data: unknown) => void) => void;
  removeListener: (event: string) => void;
  togglePlay: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
}

// Type definitions for Spotify event data
interface PlayerErrorEvent {
  message: string;
}

interface PlayerDeviceEvent {
  device_id: string;
}

interface PlayerTrackArtist {
  uri: string;
  name: string;
}

interface PlayerTrackAlbumImage {
  url: string;
  height: number;
  width: number;
}

interface PlayerTrackAlbum {
  uri: string;
  name: string;
  images: PlayerTrackAlbumImage[];
}

interface PlayerTrack {
  id: string;
  uri: string;
  name: string;
  duration_ms: number;
  artists: PlayerTrackArtist[];
  album: PlayerTrackAlbum;
}

interface PlayerStateEvent {
  paused: boolean;
  position: number;
  track_window: {
    current_track: PlayerTrack;
  };
}

interface SpotifyPlayerProps {
  accessToken: string;
  track?: SpotifyTrack;
  onPlayerStateChange?: (isPlaying: boolean) => void;
  onError?: (errorMessage: string) => void;
  onReady?: () => void;
  autoplay?: boolean;
  className?: string;
}

export default function SpotifyPlayer({
  accessToken,
  track,
  onPlayerStateChange,
  onError,
  onReady,
  autoplay = false,
  className = '',
}: SpotifyPlayerProps) {
  const [player, setPlayer] = useState<SpotifyPlayerInstance | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(50);
  const [isReady, setIsReady] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize the player
  const initializePlayer = useCallback(() => {
    const newPlayer = new window.Spotify.Player({
      name: 'DeWorm Web Player',
      getOAuthToken: (cb: (token: string) => void) => cb(accessToken),
      volume: volume / 100,
    });

    // Error handling
    newPlayer.addListener('initialization_error', (data: unknown) => {
      const errorEvent = data as PlayerErrorEvent;
      console.error('Initialization error:', errorEvent.message);
      setError(`Player initialization error: ${errorEvent.message}`);
      if (onError) onError(errorEvent.message);
    });

    newPlayer.addListener('authentication_error', (data: unknown) => {
      const errorEvent = data as PlayerErrorEvent;
      console.error('Authentication error:', errorEvent.message);
      setError(`Authentication error: ${errorEvent.message}`);
      if (onError) onError(errorEvent.message);
    });

    newPlayer.addListener('account_error', (data: unknown) => {
      const errorEvent = data as PlayerErrorEvent;
      console.error('Account error:', errorEvent.message);
      setError(`Account error: ${errorEvent.message}`);
      if (onError) onError(errorEvent.message);
    });

    newPlayer.addListener('playback_error', (data: unknown) => {
      const errorEvent = data as PlayerErrorEvent;
      console.error('Playback error:', errorEvent.message);
      setError(`Playback error: ${errorEvent.message}`);
      if (onError) onError(errorEvent.message);
    });

    // Ready handling
    newPlayer.addListener('ready', (data: unknown) => {
      const readyEvent = data as PlayerDeviceEvent;
      console.log('Ready with Device ID', readyEvent.device_id);
      setDeviceId(readyEvent.device_id);
      setIsReady(true);
      setError(null);
      if (onReady) onReady();
    });

    // Not Ready handling
    newPlayer.addListener('not_ready', (data: unknown) => {
      const readyEvent = data as PlayerDeviceEvent;
      console.log('Device ID has gone offline', readyEvent.device_id);
      setIsReady(false);
    });

    // Player State
    newPlayer.addListener('player_state_changed', (data: unknown) => {
      if (!data) return;

      const state = data as PlayerStateEvent;
      setIsPlaying(!state.paused);
      if (onPlayerStateChange) onPlayerStateChange(!state.paused);

      // Update current track if available in state
      if (state.track_window?.current_track) {
        const { current_track } = state.track_window;

        const spotifyTrack: SpotifyTrack = {
          id: current_track.id,
          name: current_track.name,
          artists: current_track.artists.map((artist) => ({
            id: artist.uri.split(':').pop() || '',
            name: artist.name,
            external_urls: {
              spotify: `https://open.spotify.com/artist/${
                artist.uri.split(':').pop() || ''
              }`,
            },
          })),
          album: {
            id: current_track.album.uri.split(':').pop() || '',
            name: current_track.album.name,
            images: current_track.album.images.map((image) => ({
              url: image.url,
              height: image.height,
              width: image.width,
            })),
            release_date: '', // Not available from the SDK state
            external_urls: {
              spotify: `https://open.spotify.com/album/${
                current_track.album.uri.split(':').pop() || ''
              }`,
            },
          },
          external_urls: {
            spotify: `https://open.spotify.com/track/${current_track.id}`,
          },
          uri: current_track.uri,
          duration_ms: current_track.duration_ms,
          preview_url: null, // Not available from the SDK state
        };

        setCurrentTrack(spotifyTrack);
      }
    });

    // Connect
    newPlayer.connect().then((success: boolean) => {
      if (success) {
        console.log('The Web Playback SDK successfully connected to Spotify!');
        setPlayer(newPlayer);
      }
    });

    return newPlayer;
  }, [accessToken, volume, onError, onReady, onPlayerStateChange]);

  // Load the Spotify Web Playback SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      initializePlayer();
    };

    return () => {
      document.body.removeChild(script);
      player?.disconnect();
    };
    // We need initializePlayer in the dependencies array because it uses accessToken,
    // but accessToken itself doesn't need to be there as it's already captured in initializePlayer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initializePlayer, player]);

  // Handle track changes
  useEffect(() => {
    if (track && deviceId && isReady) {
      playTrack(track.uri);
      setCurrentTrack(track);
    }
  }, [track, deviceId, isReady]);

  // Handle autoplay
  useEffect(() => {
    if (autoplay && isReady && currentTrack) {
      handlePlayPause();
    }
  }, [autoplay, isReady, currentTrack]);

  // Play a specific track
  const playTrack = async (uri: string) => {
    try {
      await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ uris: [uri] }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setIsPlaying(true);
      if (onPlayerStateChange) onPlayerStateChange(true);
    } catch (err) {
      console.error('Error playing track:', err);
      setError('Error playing track');
      if (onError) onError('Error playing track');
    }
  };

  // Play/Pause Toggle
  const handlePlayPause = () => {
    if (!player) return;

    player.togglePlay().then(() => {
      setIsPlaying(!isPlaying);
      if (onPlayerStateChange) onPlayerStateChange(!isPlaying);
    });
  };

  // Next Track
  const handleNext = () => {
    if (!player) return;

    player.nextTrack().then(() => {
      console.log('Skipped to next track');
    });
  };

  // Previous Track
  const handlePrevious = () => {
    if (!player) return;

    player.previousTrack().then(() => {
      console.log('Skipped to previous track');
    });
  };

  // Volume Control
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseInt(e.target.value);
    setVolume(newVolume);

    if (player) {
      player.setVolume(newVolume / 100).then(() => {
        console.log(`Volume set to ${newVolume}%`);
      });
    }

    // If volume was 0 and now it's not, update mute state
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    } else if (newVolume === 0 && !isMuted) {
      setIsMuted(true);
    }
  };

  // Mute Toggle
  const handleMuteToggle = () => {
    if (!player) return;

    if (isMuted) {
      // Unmute: restore previous volume
      player.setVolume(previousVolume / 100).then(() => {
        setVolume(previousVolume);
        setIsMuted(false);
      });
    } else {
      // Mute: save current volume and set to 0
      setPreviousVolume(volume);
      player.setVolume(0).then(() => {
        setVolume(0);
        setIsMuted(true);
      });
    }
  };

  return (
    <div
      className={`p-4 rounded-lg bg-base-200 ${className}`}
      data-testid="spotify-player"
    >
      {/* Current Track Display */}
      {currentTrack && (
        <div className="flex items-center mb-4">
          {currentTrack.album.images[0] && (
            <img
              src={currentTrack.album.images[0].url}
              alt={`${currentTrack.name} album cover`}
              className="w-16 h-16 rounded mr-4"
              data-testid="current-track-image"
            />
          )}
          <div>
            <h3
              className="text-lg font-bold line-clamp-1"
              data-testid="current-track-name"
            >
              {currentTrack.name}
            </h3>
            <p
              className="text-sm opacity-75 line-clamp-1"
              data-testid="current-track-artist"
            >
              {currentTrack.artists.map((a) => a.name).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Player Controls */}
      <div className="flex items-center justify-center space-x-4">
        <button
          className="btn btn-circle btn-outline"
          onClick={handlePrevious}
          disabled={!isReady}
          type="button"
          data-testid="previous-button"
        >
          <FontAwesomeIcon icon={faBackward} />
        </button>

        <button
          className="btn btn-circle btn-primary"
          onClick={handlePlayPause}
          disabled={!isReady || !currentTrack}
          type="button"
          data-testid="play-pause-button"
        >
          <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
        </button>

        <button
          className="btn btn-circle btn-outline"
          onClick={handleNext}
          disabled={!isReady}
          type="button"
          data-testid="next-button"
        >
          <FontAwesomeIcon icon={faForward} />
        </button>
      </div>

      {/* Volume Control */}
      <div className="mt-4 flex items-center space-x-2">
        <button
          className="btn btn-sm btn-ghost btn-circle"
          onClick={handleMuteToggle}
          type="button"
          data-testid="mute-button"
        >
          <FontAwesomeIcon icon={isMuted ? faVolumeMute : faVolumeHigh} />
        </button>

        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          className="range range-xs range-primary"
          data-testid="volume-slider"
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 text-error text-sm" data-testid="player-error">
          {error}
        </div>
      )}

      {/* Player Status */}
      {!isReady && !error && (
        <div className="mt-4 text-center">
          <span className="loading loading-spinner loading-md" />
          <p className="text-sm mt-2">Connecting to Spotify...</p>
        </div>
      )}
    </div>
  );
}
