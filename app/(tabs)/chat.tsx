import React from "react";
import {
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import ChatBot from "@/components/chat/ChatBot";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChatScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ThemedView style={styles.container}>
        <ThemedView
          style={[
            styles.header,
            {
              paddingTop:
                Platform.OS === "ios" ? insets.top : StatusBar.currentHeight,
            },
          ]}
          testID="chat-header"
        >
          <ThemedText type="title" style={styles.title} testID="app-title">
            De Worm
          </ThemedText>
          <ThemedText
            type="subtitle"
            style={styles.subtitle}
            testID="app-subtitle"
          >
            Kill the worm!
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.chatContainer}>
          <ChatBot
            initialMessages={[
              {
                id: "1",
                text: "Oh no, I know why you're here! You've got a pesky song stuck in you melon! Well, let's get that taken care of right away!",
                isUser: false,
                timestamp: new Date(),
              },
            ]}
          />
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}

// Get screen dimensions
const { width, height } = Dimensions.get("window");
const isIPhoneSize = width <= 428; // iPhone 13 Pro Max width is 428pt

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  container: {
    flex: 1,
    maxWidth: isIPhoneSize ? "100%" : 428, // Limit width on larger screens
    alignSelf: "center",
    width: "100%",
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#007AFF",
    zIndex: 1, // Lower zIndex than the autocomplete dropdown
  },
  title: {
    fontSize: 24, // Reduced font size
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16, // Reduced font size
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 2, // Reduced margin
    textAlign: "center",
  },
  chatContainer: {
    flex: 1,
    padding: 8,
  },
});
