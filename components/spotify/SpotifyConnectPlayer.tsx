import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from "react-native";
import { SpotifyTrack } from "@/utils/auth/spotify";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import {
  playTrack,
  pausePlayback,
  resumePlayback,
  getCurrentPlaybackState,
  getAvailableDevices,
  hasActiveDevices,
} from "@/utils/player/spotifyConnectService";

interface SpotifyConnectPlayerProps {
  track: SpotifyTrack;
}

export default function SpotifyConnectPlayer({ track }: SpotifyConnectPlayerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasDevices, setHasDevices] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Check for available devices and start playback
  useEffect(() => {
    let isMounted = true;

    const checkDevicesAndPlay = async () => {
      try {
        setIsLoading(true);
        
        // Check if there are any active Spotify devices
        const hasDevices = await hasActiveDevices();
        
        if (isMounted) {
          setHasDevices(hasDevices);
          
          if (!hasDevices) {
            setIsError(true);
            setErrorMessage("No Spotify devices found. Please open Spotify on another device.");
            setIsLoading(false);
            return;
          }
          
          // Start playback
          const success = await playTrack(track.uri);
          
          if (success) {
            setIsPlaying(true);
            startPolling();
          } else {
            setIsError(true);
            setErrorMessage("Failed to start playback. Please try again.");
          }
          
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error setting up playback:", error);
        if (isMounted) {
          setIsLoading(false);
          setIsError(true);
          setErrorMessage("Error connecting to Spotify. Please try again.");
        }
      }
    };

    checkDevicesAndPlay();

    return () => {
      isMounted = false;
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [track]);

  // Start polling for playback state
  const startPolling = useCallback(() => {
    // Clear any existing interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    // Poll every 1 second
    const interval = setInterval(async () => {
      try {
        const state = await getCurrentPlaybackState();
        
        if (state) {
          setIsPlaying(state.is_playing);
          setProgress(state.progress_ms || 0);
          setDuration(state.item?.duration_ms || 0);
        }
      } catch (error) {
        console.error("Error polling playback state:", error);
      }
    }, 1000);

    setPollingInterval(interval);
  }, []);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Toggle playback
  const togglePlayback = async () => {
    try {
      if (isPlaying) {
        const success = await pausePlayback();
        if (success) {
          setIsPlaying(false);
        }
      } else {
        const success = await resumePlayback();
        if (success) {
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error("Error toggling playback:", error);
      Alert.alert("Playback Error", "Failed to control playback. Please try again.");
    }
  };

  // Open Spotify app
  const openSpotifyApp = () => {
    const spotifyUri = Platform.select({
      ios: 'spotify://',
      android: 'spotify://',
      default: 'https://open.spotify.com',
    });
    
    Linking.canOpenURL(spotifyUri).then(supported => {
      if (supported) {
        Linking.openURL(spotifyUri);
      } else {
        Linking.openURL('https://open.spotify.com');
      }
    });
  };

  // Format milliseconds to mm:ss
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (isLoading) {
    return (
      <View
        style={[styles.container, isDark ? styles.containerDark : {}]}
        testID="spotify-connect-player-loading"
      >
        <ActivityIndicator size="small" color="#1DB954" />
        <Text style={[styles.loadingText, isDark ? styles.textDark : {}]}>
          Connecting to Spotify...
        </Text>
      </View>
    );
  }

  if (isError || !hasDevices) {
    return (
      <View
        style={[styles.container, isDark ? styles.containerDark : {}]}
        testID="spotify-connect-player-error"
      >
        <Text style={[styles.errorText, isDark ? styles.textDark : {}]}>
          {errorMessage || "Error connecting to Spotify"}
        </Text>
        <TouchableOpacity
          style={styles.spotifyButton}
          onPress={openSpotifyApp}
        >
          <Text style={styles.spotifyButtonText}>Open Spotify App</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, isDark ? styles.containerDark : {}]}
      testID="spotify-connect-player"
    >
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={togglePlayback}
          testID="play-pause-button"
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={24}
            color="#1DB954"
          />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${(progress / (duration || 1)) * 100 || 0}%`,
              },
            ]}
          />
          <View style={styles.timeContainer}>
            <Text style={[styles.timeText, isDark ? styles.textDark : {}]}>
              {formatTime(progress)}
            </Text>
            <Text style={[styles.timeText, isDark ? styles.textDark : {}]}>
              {formatTime(duration)}
            </Text>
          </View>
        </View>
      </View>
      <Text style={[styles.connectText, isDark ? styles.textDark : {}]}>
        Playing on Spotify Connect
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  containerDark: {
    backgroundColor: "#2c2c2e",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  progressContainer: {
    flex: 1,
    height: 20,
    justifyContent: "center",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#1DB954",
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
    color: "#666",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    color: "#ff3b30",
    textAlign: "center",
    marginBottom: 12,
  },
  textDark: {
    color: "#ddd",
  },
  connectText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
  spotifyButton: {
    backgroundColor: "#1DB954",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "center",
    marginTop: 8,
  },
  spotifyButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
});
