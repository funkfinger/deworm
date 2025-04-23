import { getAuthData } from '../auth/spotify';
import { SpotifyTrack } from '../auth/spotify';

// Types for Spotify Connect API responses
interface SpotifyDevice {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number;
}

interface SpotifyDevicesResponse {
  devices: SpotifyDevice[];
}

interface SpotifyPlaybackState {
  device: SpotifyDevice;
  shuffle_state: boolean;
  repeat_state: string;
  timestamp: number;
  context: {
    uri: string;
    href: string;
    external_urls: {
      spotify: string;
    };
    type: string;
  } | null;
  progress_ms: number;
  item: SpotifyTrack | null;
  currently_playing_type: string;
  is_playing: boolean;
}

// Get available devices
export const getAvailableDevices = async (): Promise<SpotifyDevice[]> => {
  try {
    const authData = await getAuthData();
    if (!authData) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
      headers: {
        Authorization: `Bearer ${authData.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get devices: ${response.status}`);
    }

    const data = await response.json() as SpotifyDevicesResponse;
    return data.devices;
  } catch (error) {
    console.error('Error getting available devices:', error);
    return [];
  }
};

// Get current playback state
export const getCurrentPlaybackState = async (): Promise<SpotifyPlaybackState | null> => {
  try {
    const authData = await getAuthData();
    if (!authData) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('https://api.spotify.com/v1/me/player', {
      headers: {
        Authorization: `Bearer ${authData.accessToken}`,
      },
    });

    if (response.status === 204) {
      // No active device
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to get playback state: ${response.status}`);
    }

    const data = await response.json() as SpotifyPlaybackState;
    return data;
  } catch (error) {
    console.error('Error getting playback state:', error);
    return null;
  }
};

// Play a track on an available device
export const playTrack = async (trackUri: string, deviceId?: string): Promise<boolean> => {
  try {
    const authData = await getAuthData();
    if (!authData) {
      throw new Error('Not authenticated');
    }

    // If no device ID is provided, get available devices and use the first active one
    if (!deviceId) {
      const devices = await getAvailableDevices();
      const activeDevice = devices.find(device => device.is_active);
      
      if (activeDevice) {
        deviceId = activeDevice.id;
      } else if (devices.length > 0) {
        deviceId = devices[0].id;
      } else {
        throw new Error('No available devices found');
      }
    }

    const endpoint = deviceId 
      ? `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`
      : 'https://api.spotify.com/v1/me/player/play';

    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authData.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uris: [trackUri],
      }),
    });

    if (response.status === 204) {
      return true;
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response from Spotify:', errorData);
      throw new Error(`Failed to play track: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error playing track:', error);
    return false;
  }
};

// Pause playback
export const pausePlayback = async (deviceId?: string): Promise<boolean> => {
  try {
    const authData = await getAuthData();
    if (!authData) {
      throw new Error('Not authenticated');
    }

    const endpoint = deviceId 
      ? `https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`
      : 'https://api.spotify.com/v1/me/player/pause';

    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authData.accessToken}`,
      },
    });

    if (response.status === 204) {
      return true;
    }

    if (!response.ok) {
      throw new Error(`Failed to pause playback: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error pausing playback:', error);
    return false;
  }
};

// Resume playback
export const resumePlayback = async (deviceId?: string): Promise<boolean> => {
  try {
    const authData = await getAuthData();
    if (!authData) {
      throw new Error('Not authenticated');
    }

    const endpoint = deviceId 
      ? `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`
      : 'https://api.spotify.com/v1/me/player/play';

    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authData.accessToken}`,
      },
    });

    if (response.status === 204) {
      return true;
    }

    if (!response.ok) {
      throw new Error(`Failed to resume playback: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error resuming playback:', error);
    return false;
  }
};

// Check if there are any active devices
export const hasActiveDevices = async (): Promise<boolean> => {
  try {
    const devices = await getAvailableDevices();
    return devices.length > 0;
  } catch (error) {
    console.error('Error checking for active devices:', error);
    return false;
  }
};
