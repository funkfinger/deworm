import React from "react";
import { StyleSheet, View, Text, Image } from "react-native";
import { SpotifyTrack } from "@/utils/auth/spotify";
import { useColorScheme } from "@/hooks/useColorScheme";
import SpotifyConnectPlayer from "./SpotifyConnectPlayer";

interface SelectedSongProps {
  track: SpotifyTrack;
}

export default function SelectedSong({ track }: SelectedSongProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      style={[styles.container, isDark ? styles.containerDark : {}]}
      testID="selected-song"
    >
      <Image
        source={{ uri: track.album.images[0]?.url }}
        style={styles.albumCover}
        defaultSource={require("@/assets/images/user-placeholder.png")}
      />
      <View style={styles.trackInfo}>
        <Text style={[styles.trackName, isDark ? styles.textDark : {}]}>
          {track.name}
        </Text>
        <Text style={[styles.artistName, isDark ? styles.textDark : {}]}>
          {track.artists.map((artist) => artist.name).join(", ")}
        </Text>
        <Text style={[styles.albumName, isDark ? styles.textDark : {}]}>
          {track.album.name}
        </Text>
      </View>

      {/* Spotify Connect Player */}
      <SpotifyConnectPlayer track={track} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  containerDark: {
    backgroundColor: "#2c2c2e",
  },
  albumCover: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 16,
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  artistName: {
    fontSize: 16,
    color: "#666",
    marginBottom: 2,
  },
  albumName: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
  },
  textDark: {
    color: "#fff",
  },
});
