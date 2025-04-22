import React from 'react';
import { StyleSheet } from 'react-native';
import ChatBot from '@/components/chat/ChatBot';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export default function ChatScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">De Worm</ThemedText>
        <ThemedText type="subtitle">Kill the worm!</ThemedText>
      </ThemedView>
      <ThemedView style={styles.chatContainer}>
        <ChatBot 
          initialMessages={[
            {
              id: '1',
              text: "Oh no, I know why you're here! You've got a pesky song stuck in you melon! Well, let's get that taken care of right away!",
              isUser: false,
              timestamp: new Date(),
            }
          ]}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  chatContainer: {
    flex: 1,
    padding: 8,
  },
});
