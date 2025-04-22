import React from "react";
import { StyleSheet, View, Image } from "react-native";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import { MessageType } from "./ChatBot";
import { useColorScheme } from "@/hooks/useColorScheme";

interface ChatMessageProps {
  message: MessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.isUser;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.botMessageContainer,
      ]}
    >
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: "#007AFF" }]} />
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
        <View style={[styles.avatar, { backgroundColor: "#34C759" }]} />
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
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 8,
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
