import TrackPlayer, { Capability, Event } from 'react-native-track-player';
import { SpotifyTrack } from '../auth/spotify';

// Define the service event handlers
export const PlaybackService = async function() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());
  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
};

// Initialize the player
export const setupPlayer = async () => {
  try {
    await TrackPlayer.setupPlayer();
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
      compactCapabilities: [Capability.Play, Capability.Pause],
    });
    return true;
  } catch (error) {
    console.error('Error setting up the player:', error);
    return false;
  }
};

// Add a track to the player
export const addTrack = async (track: SpotifyTrack) => {
  try {
    if (!track.preview_url) {
      console.warn('No preview URL available for this track');
      return false;
    }
    
    await TrackPlayer.reset();
    await TrackPlayer.add({
      id: track.id,
      url: track.preview_url,
      title: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      artwork: track.album.images[0]?.url,
    });
    
    return true;
  } catch (error) {
    console.error('Error adding track:', error);
    return false;
  }
};

// Play the current track
export const playTrack = async () => {
  try {
    await TrackPlayer.play();
    return true;
  } catch (error) {
    console.error('Error playing track:', error);
    return false;
  }
};

// Pause the current track
export const pauseTrack = async () => {
  try {
    await TrackPlayer.pause();
    return true;
  } catch (error) {
    console.error('Error pausing track:', error);
    return false;
  }
};

// Stop and reset the player
export const resetPlayer = async () => {
  try {
    await TrackPlayer.reset();
    return true;
  } catch (error) {
    console.error('Error resetting player:', error);
    return false;
  }
};
