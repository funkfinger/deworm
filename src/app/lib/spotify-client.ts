import { auth } from "@/app/lib/auth";
import type {
  SpotifySearchResult,
  SpotifyTrack,
  SpotifyUser,
} from "@/app/models/spotify";
import type { Session } from "next-auth";
import SpotifyWebApi from "spotify-web-api-node";

// Extend Session type for TypeScript
interface CustomSession extends Session {
  accessToken?: string;
}

export class SpotifyClient {
  private spotifyApi: SpotifyWebApi;

  constructor(accessToken?: string) {
    this.spotifyApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.SPOTIFY_REDIRECT_URI,
    });

    if (accessToken) {
      this.spotifyApi.setAccessToken(accessToken);
    }
  }

  /**
   * Get the current user's profile
   */
  async getCurrentUser(): Promise<SpotifyUser> {
    const response = await this.spotifyApi.getMe();
    return response.body as unknown as SpotifyUser;
  }

  /**
   * Search for tracks
   */
  async searchTracks(query: string, limit = 10): Promise<SpotifySearchResult> {
    const response = await this.spotifyApi.searchTracks(query, { limit });
    return response.body as unknown as SpotifySearchResult;
  }

  /**
   * Get track by ID
   */
  async getTrack(id: string): Promise<SpotifyTrack> {
    const response = await this.spotifyApi.getTrack(id);
    return response.body as unknown as SpotifyTrack;
  }

  /**
   * Get tracks from playlist
   */
  async getPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
    const response = await this.spotifyApi.getPlaylistTracks(playlistId);
    return response.body.items.map(
      (item) => item.track
    ) as unknown as SpotifyTrack[];
  }

  /**
   * Play a track
   */
  async playTrack(uri: string): Promise<void> {
    await this.spotifyApi.play({ uris: [uri] });
  }

  /**
   * Pause playback
   */
  async pause(): Promise<void> {
    await this.spotifyApi.pause();
  }
}

/**
 * Create a Spotify client with the current user's access token
 */
export async function getAuthenticatedSpotifyClient(): Promise<SpotifyClient | null> {
  const session = (await auth()) as CustomSession | null;

  if (!session?.accessToken) {
    return null;
  }

  return new SpotifyClient(session.accessToken);
}
