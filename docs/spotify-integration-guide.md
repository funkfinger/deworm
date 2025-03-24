# Spotify API Integration Guide

## Overview

The DeWorm app relies heavily on Spotify integration for:

1. User authentication
2. Searching for earworm songs
3. Playing replacement songs
4. Managing playback

This document outlines the key aspects of integrating with Spotify's APIs.

## Prerequisites

1. A Spotify Developer account
2. A registered Spotify application with:
   - Redirect URI set to `https://deworm.us/api/auth/callback` (production) and `http://localhost:3000/api/auth/callback` (development)
   - Required scopes (see below)

## Required API Scopes

For our application to function correctly, we need the following Spotify OAuth scopes:

```
user-read-private
user-read-email
streaming
user-modify-playback-state
user-read-playback-state
user-read-currently-playing
```

## Authentication Flow

We'll implement the OAuth Authorization Code Flow with PKCE (Proof Key for Code Exchange) for security:

1. Generate a PKCE code verifier and challenge
2. Redirect user to Spotify authorization URL with required scopes and challenge
3. Receive authorization code at callback URL
4. Exchange code for access and refresh tokens using code verifier
5. Store tokens securely and refresh as needed

## Key API Endpoints

### Authentication

- **Authorization**: `https://accounts.spotify.com/authorize`
- **Token**: `https://accounts.spotify.com/api/token`

### Search

- **Search Tracks**: `https://api.spotify.com/v1/search?q={query}&type=track`

### Track Information

- **Get Track**: `https://api.spotify.com/v1/tracks/{id}`
- **Get Audio Features**: `https://api.spotify.com/v1/audio-features/{id}`

### Playlist

- **Get Playlist**: `https://api.spotify.com/v1/playlists/{playlist_id}`
- **Get Playlist Tracks**: `https://api.spotify.com/v1/playlists/{playlist_id}/tracks`

### Playback

- **Get Playback State**: `https://api.spotify.com/v1/me/player`
- **Transfer Playback**: `https://api.spotify.com/v1/me/player`
- **Play**: `https://api.spotify.com/v1/me/player/play`
- **Pause**: `https://api.spotify.com/v1/me/player/pause`
- **Skip**: `https://api.spotify.com/v1/me/player/next`

## Web Playback SDK Integration

The Spotify Web Playback SDK allows us to create a player directly in the browser:

1. Load the SDK script: `https://sdk.scdn.co/spotify-player.js`
2. Initialize the player with an access token
3. Connect to the user's Spotify account
4. Control playback through the SDK

Example initialization:

```typescript
window.onSpotifyWebPlaybackSDKReady = () => {
  const player = new Spotify.Player({
    name: "DeWorm Player",
    getOAuthToken: (cb) => {
      cb(accessToken);
    },
    volume: 0.5,
  });

  player.connect();

  // Event listeners
  player.addListener("ready", ({ device_id }) => {
    console.log("Ready with Device ID", device_id);
    // Store device_id for playback control
  });

  player.addListener("not_ready", ({ device_id }) => {
    console.log("Device ID has gone offline", device_id);
  });

  player.addListener("player_state_changed", (state) => {
    // Handle player state changes
  });
};
```

## Rate Limiting and Error Handling

- Implement exponential backoff for rate-limited requests
- Handle token expiration and refresh
- Provide fallback options when playback fails (open in Spotify)
- Display user-friendly error messages

## Data Caching

- Cache search results when appropriate
- Store recently played tracks for quick access
- Cache playlist data to minimize API calls

## Testing

- Mock Spotify API responses for unit tests
- Use a test account for E2E testing
- Ensure all API interactions are properly tested

## Security Considerations

- Never expose client secrets in client-side code
- Implement CSRF protection for OAuth callbacks
- Store tokens securely (encryption at rest)
- Use HTTPS for all API calls
- Validate all user inputs

## Resources

- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api)
- [Spotify Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk)
- [OAuth 2.0 with PKCE](https://oauth.net/2/pkce/)
- [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
