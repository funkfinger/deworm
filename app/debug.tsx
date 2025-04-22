import React from 'react';
import { StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import RedirectUriDisplay from '@/components/debug/RedirectUriDisplay';

export default function DebugScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Debug Info' }} />
      <ScrollView>
        <ThemedView style={styles.content}>
          <ThemedText type="title">Debug Information</ThemedText>
          <RedirectUriDisplay />
        </ThemedView>
      </ScrollView>
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
