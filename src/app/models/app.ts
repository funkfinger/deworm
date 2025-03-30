import type { SpotifyTrack } from './spotify';

export interface User {
  id: string;
  spotifyId: string;
  email: string;
  displayName: string;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Earworm {
  id: string;
  trackId: string;
  trackName: string;
  artistName: string;
  albumName: string;
  albumImageUrl?: string;
  spotifyUri: string;
  createdAt: Date;
}

export interface UserEarworm {
  id: string;
  userId: string;
  earwormId: string;
  replacementId?: string;
  status: 'active' | 'cured' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface ReplacementSong {
  id: string;
  trackId: string;
  trackName: string;
  artistName: string;
  albumName: string;
  albumImageUrl?: string;
  spotifyUri: string;
  usageCount: number;
  successRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EarwormSession {
  currentUser: User | null;
  currentEarworm: SpotifyTrack | null;
  replacementSong: SpotifyTrack | null;
  sessionStatus:
    | 'idle'
    | 'searching'
    | 'found'
    | 'processing'
    | 'replacement'
    | 'feedback';
}

export interface EffectivenessData {
  id: string;
  userEarwormId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  feedback?: string;
  createdAt: Date;
}
