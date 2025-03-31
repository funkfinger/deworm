'use client';

import type { SpotifyTrack } from '@/app/models/spotify';
import { faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useRef, useState } from 'react';

interface SpotifySearchInputProps {
  onSearch: (query: string) => Promise<void>;
  onTrackSelect: (track: SpotifyTrack) => void;
  results: SpotifyTrack[];
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  initialValue?: string;
}

export default function SpotifySearchInput({
  onSearch,
  onTrackSelect,
  results,
  isLoading = false,
  placeholder = "What's stuck in your noggin?",
  className = '',
  initialValue = '',
}: SpotifySearchInputProps) {
  const [query, setQuery] = useState(initialValue);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (query.trim().length >= 2) {
        onSearch(query);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [query, onSearch]);

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (e.target.value.length >= 2) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleTrackSelect = (track: SpotifyTrack) => {
    setQuery(track.name);
    setShowResults(false);
    onTrackSelect(track);
  };

  return (
    <div
      className={`relative w-full ${className}`}
      data-testid="spotify-search"
    >
      <div className="input-group w-full">
        <input
          ref={inputRef}
          type="text"
          className="input input-bordered w-full"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          data-testid="search-input"
        />
        <button
          className="btn btn-square"
          disabled={isLoading || query.trim().length < 2}
          onClick={() => onSearch(query)}
          type="button"
          data-testid="search-button"
        >
          {isLoading ? (
            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
          ) : (
            <FontAwesomeIcon icon={faSearch} />
          )}
        </button>
      </div>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div
          ref={resultsRef}
          className="absolute z-10 mt-1 w-full bg-base-100 shadow-lg rounded-md overflow-auto max-h-96"
          data-testid="search-results"
        >
          <ul className="menu p-2">
            {results.map((track) => (
              <li key={track.id}>
                <button
                  type="button"
                  onClick={() => handleTrackSelect(track)}
                  className="flex items-center p-2 hover:bg-base-200 rounded-md"
                  data-testid={`result-${track.id}`}
                >
                  <div className="w-10 h-10 mr-2">
                    {track.album.images[0] ? (
                      <img
                        src={track.album.images[0].url}
                        alt={`${track.name} album cover`}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full bg-base-300 rounded flex items-center justify-center">
                        <FontAwesomeIcon icon={faSearch} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="font-medium truncate">{track.name}</div>
                    <div className="text-xs opacity-70 truncate">
                      {track.artists.map((a) => a.name).join(', ')}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No Results State */}
      {showResults &&
        query.length >= 2 &&
        results.length === 0 &&
        !isLoading && (
          <div
            className="absolute z-10 mt-1 w-full bg-base-100 shadow-lg rounded-md p-4 text-center"
            data-testid="no-results"
          >
            No songs found matching &quot;{query}&quot;
          </div>
        )}
    </div>
  );
}
