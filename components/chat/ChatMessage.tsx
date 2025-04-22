import React from "react";
import { StyleSheet, View, Image } from "react-native";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import { MessageType } from "./ChatBot";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useSpotifyAuth } from "@/utils/auth/SpotifyAuthContext";

interface ChatMessageProps {
  message: MessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.isUser;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { userProfile } = useSpotifyAuth();

  return (
    <View
      style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.botMessageContainer,
      ]}
    >
      {!isUser && (
        <Image
          source={require("@/assets/images/mascot.png")}
          style={styles.avatar}
          resizeMode="cover"
        />
      )}
      <ThemedView
        style={[
          styles.messageBubble,
          isUser
            ? styles.userMessageBubble
            : [
                styles.botMessageBubble,
                isDark ? styles.botMessageBubbleDark : {},
              ],
        ]}
      >
        <ThemedText
          style={[
            styles.messageText,
            !isUser && !isDark ? styles.botMessageText : {},
          ]}
        >
          {message.text}
        </ThemedText>
        <ThemedText
          style={[
            styles.timestamp,
            !isUser && !isDark ? styles.botTimestamp : {},
          ]}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </ThemedText>
      </ThemedView>
      {isUser && (
        <Image
          source={
            userProfile?.images?.[0]?.url
              ? { uri: userProfile.images[0].url }
              : require("@/assets/images/user-placeholder.png")
          }
          style={styles.avatar}
          resizeMode="cover"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 8,
    maxWidth: "75%",
    flexDirection: "row",
    alignItems: "flex-end",
    position: "relative",
    zIndex: 1,
  },
  userMessageContainer: {
    alignSelf: "flex-end",
    flexDirection: "row",
  },
  botMessageContainer: {
    alignSelf: "flex-start",
    flexDirection: "row",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  messageBubble: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 40,
    maxWidth: "80%",
  },
  userMessageBubble: {
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 4,
  },
  botMessageBubble: {
    backgroundColor: "#E5E5EA",
    borderBottomLeftRadius: 4,
  },
  botMessageBubbleDark: {
    backgroundColor: "#3A3A3C",
  },
  messageText: {
    fontSize: 16,
    color: "#FFFFFF",
    lineHeight: 22,
  },
  botMessageText: {
    color: "#000000",
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
    opacity: 0.7,
    color: "#FFFFFF",
  },
  botTimestamp: {
    color: "#8E8E93",
  },
});
