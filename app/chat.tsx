import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import ChatBot from '@/components/chat/ChatBot';
import { ChatProvider } from '@/components/chat/ChatProvider';
import { ThemedView } from '@/components/ThemedView';

export default function ChatScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Chat' }} />
      <ThemedView style={styles.content}>
        <ChatProvider>
          <ChatBot />
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
