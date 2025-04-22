import React from "react";
import { StyleSheet, SafeAreaView } from "react-native";
import { Stack } from "expo-router";
import ChatBot, { MessageType } from "@/components/chat/ChatBot";
import { ChatProvider } from "@/components/chat/ChatProvider";
import { ThemedView } from "@/components/ThemedView";

export default function ChatScreen() {
  // Initial welcome message
  const initialMessages: MessageType[] = [
    {
      id: "1",
      text: "Oh no, I know why you're here! You've got a pesky song stuck in you melon! Well, let's get that taken care of right away!",
      isUser: false,
      timestamp: new Date(),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Chat" }} />
      <ThemedView style={styles.content}>
        <ChatProvider initialMessages={initialMessages}>
          <ChatBot initialMessages={initialMessages} />
        </ChatProvider>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
