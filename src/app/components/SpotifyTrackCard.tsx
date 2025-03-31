'use client';

import type { SpotifyTrack } from '@/app/models/spotify';
import { faMusic, faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

interface SpotifyTrackCardProps {
  track: SpotifyTrack;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
  showControls?: boolean;
}

export default function SpotifyTrackCard({
  track,
  isPlaying = false,
  onPlayPause,
  isSelected = false,
  onClick,
  className = '',
  showControls = true,
}: SpotifyTrackCardProps) {
  const [imageError, setImageError] = useState(false);

  const albumImage = track.album.images[0]?.url;

  const formatArtists = (artists: typeof track.artists) => {
    return artists.map((artist) => artist.name).join(', ');
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // This is a card with two interactive elements:
  // 1. The card itself (clickable)
  // 2. The play/pause button (if showControls is true)

  // We need to use a wrapper div for layout and inside it
  // have separate interactive elements to avoid nesting issues
  return (
    <div
      className={`relative card card-side bg-base-100 shadow-md hover:shadow-lg transition-all cursor-pointer ${
        isSelected ? 'border-2 border-primary' : ''
      } ${className}`}
      data-testid="spotify-track-card"
    >
      {/* Main card area as a button */}
      <button
        className="absolute inset-0 w-full h-full opacity-0"
        onClick={onClick}
        type="button"
        aria-label={`Select ${track.name} by ${formatArtists(track.artists)}`}
      />

      <figure className="relative z-10 w-16 h-16 md:w-24 md:h-24 pointer-events-none">
        {albumImage && !imageError ? (
          <img
            src={albumImage}
            alt={`${track.name} album cover`}
            onError={() => setImageError(true)}
            className="object-cover w-full h-full"
            data-testid="track-image"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-base-200">
            <FontAwesomeIcon icon={faMusic} className="text-2xl" />
          </div>
        )}
      </figure>

      <div className="card-body p-3 md:p-4 pointer-events-none">
        <h2
          className="card-title text-base md:text-lg line-clamp-1"
          data-testid="track-title"
        >
          {track.name}
        </h2>
        <p
          className="text-sm opacity-80 line-clamp-1"
          data-testid="track-artist"
        >
          {formatArtists(track.artists)}
        </p>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs opacity-60" data-testid="track-duration">
            {formatDuration(track.duration_ms)}
          </span>

          {showControls && onPlayPause && (
            <div className="relative z-20">
              <button
                className="btn btn-circle btn-sm btn-primary pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayPause();
                }}
                type="button"
                data-testid="play-pause-button"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
