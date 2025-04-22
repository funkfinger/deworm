import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  Image,
} from "react-native";
import { useSpotifyAuth } from "@/utils/auth/SpotifyAuthContext";
import { SPOTIFY_CLIENT_ID } from "@/utils/env";
import { getClientId, getRedirectUri } from "@/utils/auth/spotify";

interface SpotifyLoginButtonProps {
  onLoginSuccess?: () => void;
  onLoginFailure?: (error: string) => void;
}

const SpotifyLoginButton: React.FC<SpotifyLoginButtonProps> = ({
  onLoginSuccess,
  onLoginFailure,
}) => {
  const { login, isLoading, error } = useSpotifyAuth();

  // Debug information
  console.log("SPOTIFY_CLIENT_ID from env:", SPOTIFY_CLIENT_ID);
  console.log("SPOTIFY_CLIENT_ID from getClientId():", getClientId());
  console.log("REDIRECT_URI:", getRedirectUri());

  const handleLogin = async () => {
    const success = await login();

    if (success && onLoginSuccess) {
      onLoginSuccess();
    } else if (!success && onLoginFailure && error) {
      onLoginFailure(error);
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      testID="spotify-login-button"
      onPress={handleLogin}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <View style={styles.buttonContent}>
          <View style={styles.icon} />
          <Text style={styles.buttonText}>Log into Spotify</Text>
        </View>
      )}
      {__DEV__ && (
        <Text style={styles.debugText}>
          Client ID:{" "}
          {SPOTIFY_CLIENT_ID
            ? SPOTIFY_CLIENT_ID.substring(0, 4) + "..."
            : "Not set"}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#1DB954", // Spotify green
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  icon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    marginRight: 8,
  },
  debugText: {
    color: "#FFFFFF",
    fontSize: 10,
    marginTop: 4,
    opacity: 0.7,
  },
});

export default SpotifyLoginButton;
