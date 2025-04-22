import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SpotifyTrack } from "@/utils/auth/spotify";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import TrackPlayer, {
  State,
  usePlaybackState,
  useProgress,
} from "react-native-track-player";
import {
  setupPlayer,
  addTrack,
  playTrack,
  pauseTrack,
} from "@/utils/player/trackPlayerService";

interface SpotifyPlayerProps {
  track: SpotifyTrack;
}

export default function SpotifyPlayer({ track }: SpotifyPlayerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const playbackState = usePlaybackState();
  const progress = useProgress();
  const [isPlaying, setIsPlaying] = useState(false);

  // Setup track player on component mount
  useEffect(() => {
    let isMounted = true;

    const setup = async () => {
      try {
        setIsLoading(true);

        // Setup player
        const isSetup = await setupPlayer();
        if (!isSetup) {
          throw new Error("Failed to setup player");
        }

        // Add track to queue
        const isAdded = await addTrack(track);
        if (!isAdded) {
          throw new Error("Failed to add track");
        }

        if (isMounted) {
          setIsLoading(false);
          // Auto-play the track
          await playTrack();
          setIsPlaying(true);
        }
      } catch (error) {
        console.error("Error setting up track:", error);
        if (isMounted) {
          setIsLoading(false);
          setIsError(true);
        }
      }
    };

    setup();

    return () => {
      isMounted = false;
      // Clean up player when component unmounts
      TrackPlayer.reset();
    };
  }, [track]);

  // Update isPlaying state based on playback state
  useEffect(() => {
    if (playbackState === State.Playing) {
      setIsPlaying(true);
    } else if (
      playbackState === State.Paused ||
      playbackState === State.Stopped
    ) {
      setIsPlaying(false);
    }
  }, [playbackState]);

  const togglePlayback = async () => {
    try {
      if (isPlaying) {
        await pauseTrack();
      } else {
        await playTrack();
      }
    } catch (error) {
      console.error("Error toggling playback:", error);
    }
  };

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (isLoading) {
    return (
      <View
        style={[styles.container, isDark ? styles.containerDark : {}]}
        testID="spotify-player-loading"
      >
        <ActivityIndicator size="small" color="#1DB954" />
        <Text style={[styles.loadingText, isDark ? styles.textDark : {}]}>
          Loading track...
        </Text>
      </View>
    );
  }

  if (isError || !track.preview_url) {
    return (
      <View
        style={[styles.container, isDark ? styles.containerDark : {}]}
        testID="spotify-player-error"
      >
        <Text style={[styles.errorText, isDark ? styles.textDark : {}]}>
          {!track.preview_url
            ? "No preview available for this track"
            : "Error loading track"}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, isDark ? styles.containerDark : {}]}
      testID="spotify-player"
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
                width: `${(progress.position / progress.duration) * 100 || 0}%`,
              },
            ]}
          />
          <View style={styles.timeContainer}>
            <Text style={[styles.timeText, isDark ? styles.textDark : {}]}>
              {formatTime(progress.position)}
            </Text>
            <Text style={[styles.timeText, isDark ? styles.textDark : {}]}>
              {formatTime(progress.duration)}
            </Text>
          </View>
        </View>
      </View>
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
  },
  textDark: {
    color: "#ddd",
  },
});
