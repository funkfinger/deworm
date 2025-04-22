import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { SpotifyTrack } from "@/utils/auth/spotify";
import { useColorScheme } from "@/hooks/useColorScheme";

interface SongSearchAutocompleteProps {
  tracks: SpotifyTrack[];
  isLoading: boolean;
  onSelectTrack: (track: SpotifyTrack) => void;
  visible: boolean;
}

export default function SongSearchAutocomplete({
  tracks,
  isLoading,
  onSelectTrack,
  visible,
}: SongSearchAutocompleteProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  if (!visible) {
    return null;
  }

  return (
    <View
      style={[styles.container, isDark ? styles.containerDark : {}]}
      testID="song-autocomplete"
    >
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={[styles.loadingText, isDark ? styles.textDark : {}]}>
            Searching...
          </Text>
        </View>
      ) : tracks.length > 0 ? (
        <FlatList
          data={tracks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.trackItem}
              onPress={() => onSelectTrack(item)}
              testID={`track-item-${item.id}`}
            >
              <Image
                source={{ uri: item.album.images[0]?.url }}
                style={styles.albumCover}
                defaultSource={require("@/assets/images/user-placeholder.png")}
              />
              <View style={styles.trackInfo}>
                <Text
                  style={[styles.trackName, isDark ? styles.textDark : {}]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Text
                  style={[styles.artistName, isDark ? styles.textDark : {}]}
                  numberOfLines={1}
                >
                  {item.artists.map((artist) => artist.name).join(", ")}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          style={styles.list}
        />
      ) : (
        <View style={styles.noResultsContainer}>
          <Text style={[styles.noResultsText, isDark ? styles.textDark : {}]}>
            No songs found
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 70,
    left: 10,
    right: 10,
    maxHeight: 200, // Reduced height to show fewer items
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#ddd",
    zIndex: 1000, // Ensure it appears above other elements
  },
  containerDark: {
    backgroundColor: "#1c1c1e",
    borderColor: "#38383A",
  },
  list: {
    maxHeight: 200, // Reduced height to match container
  },
  trackItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  albumCover: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  artistName: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  textDark: {
    color: "#fff",
  },
  loadingContainer: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  noResultsContainer: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  noResultsText: {
    fontSize: 14,
    color: "#666",
  },
});
