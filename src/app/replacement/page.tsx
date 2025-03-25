"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Mascot from "@/app/components/Mascot";
import SpotifyPlayer from "@/app/components/SpotifyPlayer";
import {
  getReplacementPlaylistTracks,
  getReplacementPlaylistInfo,
  REPLACEMENT_PLAYLIST_ID,
} from "@/app/lib/client-actions";
import { getAccessToken } from "@/app/lib/client-session";

// Types for Spotify data
type SpotifyImage = {
  url: string;
  height: number;
  width: number;
};

type SpotifyArtist = {
  id: string;
  name: string;
};

type SpotifyTrack = {
  id: string;
  name: string;
  uri: string;
  album: {
    name: string;
    images: SpotifyImage[];
  };
  artists: SpotifyArtist[];
  duration_ms: number;
};

type PlaylistTrackItem = {
  track: SpotifyTrack;
  added_at: string;
};

type PlaylistInfo = {
  name: string;
  description: string;
  images: SpotifyImage[];
  tracks: {
    total: number;
  };
  external_urls: {
    spotify: string;
  };
};

export default function ReplacementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get earworm data from URL params
  const earwormId = searchParams.get("trackId");
  const earwormName = searchParams.get("trackName");
  const earwormArtist = searchParams.get("artist");
  const earwormUri = searchParams.get("uri");
  const earwormImage = searchParams.get("image");

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<PlaylistTrackItem[]>([]);
  const [playlistInfo, setPlaylistInfo] = useState<PlaylistInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);

  // Load access token when component mounts
  useEffect(() => {
    const loadAccessToken = () => {
      try {
        const token = getAccessToken();
        if (token) {
          setAccessToken(token);
        } else {
          router.push("/api/auth/login");
        }
      } catch (err) {
        console.error("Error loading access token:", err);
        setError("Failed to load access token. Please login again.");
        router.push("/api/auth/login");
      }
    };

    loadAccessToken();
  }, [router]);

  // Load playlist data
  useEffect(() => {
    if (!accessToken) return;
    if (!earwormId || !earwormName) {
      setError("No earworm specified. Please select an earworm first.");
      return;
    }

    const loadPlaylistData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Load playlist info and tracks
        const [infoResponse, tracksResponse] = await Promise.all([
          getReplacementPlaylistInfo(),
          getReplacementPlaylistTracks(50, 0),
        ]);

        setPlaylistInfo(infoResponse);
        setPlaylistTracks(tracksResponse.items);

        // Check if earworm is already in the playlist
        await checkAndAddEarwormToPlaylist();

        // Automatically select a random track as recommendation
        if (tracksResponse.items.length > 0) {
          const randomIndex = Math.floor(
            Math.random() * tracksResponse.items.length
          );
          setSelectedTrack(tracksResponse.items[randomIndex].track);
          setShowPlayer(true);
        }
      } catch (err) {
        console.error("Error loading playlist data:", err);
        setError("Failed to load replacement songs. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadPlaylistData();
  }, [accessToken, earwormId, earwormName]);

  // Check if earworm is in playlist and add it if not
  const checkAndAddEarwormToPlaylist = async () => {
    if (!earwormId || !earwormUri || !accessToken) return;

    try {
      // Check if track is already in the playlist by checking all tracks
      let allPlaylistTracks: PlaylistTrackItem[] = [];
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        const response = await getReplacementPlaylistTracks(100, offset);
        if (response && response.items) {
          allPlaylistTracks = [...allPlaylistTracks, ...response.items];

          if (response.next) {
            offset += 100;
          } else {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      }

      // Check if the track exists in the playlist
      const trackExists = allPlaylistTracks.some(
        (item) => item.track && item.track.id === earwormId
      );

      if (!trackExists) {
        // Add the track to the playlist
        await addTrackToPlaylist(earwormUri);
      }
    } catch (err) {
      console.error("Error checking/adding track to playlist:", err);
    }
  };

  // Add a track to the Spotify playlist
  const addTrackToPlaylist = async (trackUri: string) => {
    if (!accessToken) return;

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${REPLACEMENT_PLAYLIST_ID}/tracks`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uris: [trackUri],
            position: 0,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to add track to playlist: ${response.status}`);
      }

      console.log("Track added to playlist successfully");
    } catch (err) {
      console.error("Error adding track to playlist:", err);
    }
  };

  // Format milliseconds to minutes:seconds
  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, "0")}`;
  };

  const handleSelectTrack = (track: SpotifyTrack) => {
    setSelectedTrack(track);
    setShowPlayer(true);
  };

  const handleReplaceAgain = () => {
    if (playlistTracks.length > 0) {
      // Select a different random track
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * playlistTracks.length);
      } while (
        selectedTrack &&
        playlistTracks[randomIndex]?.track?.id === selectedTrack.id &&
        playlistTracks.length > 1
      );

      // Ensure we have a valid track before setting it
      const trackToSelect = playlistTracks[randomIndex]?.track;
      if (trackToSelect) {
        setSelectedTrack(trackToSelect);
        setShowPlayer(true);
      }
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Earworm Replacement</h1>
        <p className="opacity-75">
          We&apos;ve found a replacement song to help cure your earworm
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-2/3">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : error ? (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          ) : (
            <>
              <div className="card bg-base-200 shadow-xl mb-6">
                <div className="card-body">
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex items-center">
                      <Mascot mood="sad" width={80} height={80} />
                    </div>
                    <div className="flex-1">
                      <h2 className="card-title">Your Earworm</h2>
                      <div className="flex items-center gap-3 my-2">
                        {earwormImage && (
                          <img
                            src={earwormImage}
                            alt={earwormName || "Earworm"}
                            className="w-12 h-12 rounded-md"
                          />
                        )}
                        <div>
                          <p className="font-bold">{earwormName}</p>
                          <p className="text-sm opacity-75">{earwormArtist}</p>
                        </div>
                      </div>
                      <p className="mt-2">
                        Don&apos;t worry! I&apos;ll help replace this song with
                        something even catchier.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedTrack && (
                <div className="card bg-base-200 shadow-xl mb-6">
                  <div className="card-body">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                      <div className="flex items-center">
                        <Mascot mood="happy" width={80} height={80} />
                      </div>
                      <div className="flex-1">
                        <h2 className="card-title">Recommended Replacement</h2>
                        <div className="flex items-center gap-3 my-2">
                          {selectedTrack.album.images &&
                            selectedTrack.album.images[0] && (
                              <img
                                src={selectedTrack.album.images[0].url}
                                alt={selectedTrack.album.name}
                                className="w-12 h-12 rounded-md"
                              />
                            )}
                          <div>
                            <p className="font-bold">{selectedTrack.name}</p>
                            <p className="text-sm opacity-75">
                              {selectedTrack.artists
                                .map((artist) => artist.name)
                                .join(", ")}
                            </p>
                          </div>
                        </div>
                        <p className="mt-2">
                          This catchy tune should help replace your earworm.
                          Give it a listen!
                        </p>
                        <div className="card-actions justify-end mt-4">
                          <button
                            className="btn btn-outline"
                            onClick={handleReplaceAgain}
                          >
                            Try Another Song
                          </button>
                          <button
                            className="btn btn-primary"
                            onClick={() => handleSelectTrack(selectedTrack)}
                          >
                            Play This Song
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {playlistInfo && (
                <div className="card bg-base-200 shadow-xl mb-6">
                  <div className="card-body">
                    <h2 className="card-title">Browse All Replacement Songs</h2>
                    <p className="mb-4">{playlistInfo.description}</p>

                    <div className="overflow-x-auto">
                      <table className="table table-compact w-full">
                        <thead>
                          <tr>
                            <th></th>
                            <th>Song</th>
                            <th>Artist</th>
                            <th>Duration</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {playlistTracks.map((item, index) => (
                            <tr key={item.track.id} className="hover">
                              <td>{index + 1}</td>
                              <td>
                                <div className="flex items-center gap-2">
                                  {item.track.album.images &&
                                    item.track.album.images.length > 0 &&
                                    item.track.album.images[
                                      item.track.album.images.length - 1
                                    ]?.url && (
                                      <img
                                        src={
                                          item.track.album.images[
                                            item.track.album.images.length - 1
                                          ]?.url
                                        }
                                        alt={
                                          item.track.album.name || "Album cover"
                                        }
                                        className="w-8 h-8 rounded"
                                      />
                                    )}
                                  <span>{item.track.name}</span>
                                </div>
                              </td>
                              <td>
                                {item.track.artists
                                  .map((artist) => artist.name)
                                  .join(", ")}
                              </td>
                              <td>{formatDuration(item.track.duration_ms)}</td>
                              <td>
                                <button
                                  className="btn btn-xs btn-primary"
                                  onClick={() => handleSelectTrack(item.track)}
                                >
                                  Play
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="card-actions justify-center mt-4">
                      <a
                        href={playlistInfo.external_urls.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-sm"
                      >
                        View Full Playlist on Spotify
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="w-full md:w-1/3">
          {showPlayer && selectedTrack && accessToken ? (
            <div className="sticky top-4">
              <div className="card bg-base-200 shadow-xl mb-6">
                <div className="card-body">
                  <h2 className="card-title">Now Playing</h2>
                  <SpotifyPlayer
                    accessToken={accessToken}
                    trackUri={selectedTrack.uri}
                    onPlayerError={(error) => setError(error.message)}
                    onTrackEnd={handleReplaceAgain}
                  />
                </div>
              </div>

              <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">Did it work?</h2>
                  <p className="mb-4">
                    Is your earworm gone? Let us know if this replacement
                    worked!
                  </p>

                  <div className="flex justify-between">
                    <button className="btn btn-error btn-sm">
                      Didn&apos;t Work
                    </button>
                    <button className="btn btn-success btn-sm">
                      It Worked!
                    </button>
                  </div>

                  <div className="divider">OR</div>

                  <Link href="/search" className="btn btn-outline w-full">
                    Find Another Earworm
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">How It Works</h2>
                <ol className="list-decimal list-inside space-y-2">
                  <li>We identify your earworm</li>
                  <li>Our algorithm finds a replacement</li>
                  <li>Listen to the replacement song</li>
                  <li>Your earworm gets replaced!</li>
                </ol>
                <div className="divider"></div>
                <p className="text-sm opacity-75">
                  Deworm uses scientifically backed methods to help replace
                  annoying earworms with songs you&apos;ll enjoy.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
