import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as AuthSession from 'expo-auth-session';

export default function RedirectUriDisplay() {
  const [redirectUri, setRedirectUri] = useState<string>('');
  
  useEffect(() => {
    // Get the redirect URI
    const uri = AuthSession.makeRedirectUri({
      scheme: 'deworm',
      path: 'spotify-auth-callback',
    });
    
    setRedirectUri(uri);
  }, []);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spotify Redirect URI</Text>
      <Text style={styles.uri}>{redirectUri}</Text>
      
      <Text style={styles.title}>For Spotify Dashboard</Text>
      <Text style={styles.note}>Add these URIs to your Spotify Dashboard:</Text>
      
      <Text style={styles.subtitle}>Web Redirect URI:</Text>
      <Text style={styles.uri}>{redirectUri}</Text>
      
      <Text style={styles.subtitle}>iOS/Android Redirect URI:</Text>
      <Text style={styles.uri}>deworm://spotify-auth-callback</Text>
      
      <Text style={styles.subtitle}>Expo Development URI:</Text>
      <Text style={styles.uri}>https://auth.expo.io/@your-expo-username/deworm-chatbot</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  uri: {
    fontSize: 14,
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 5,
    fontFamily: 'monospace',
    marginBottom: 5,
  },
  note: {
    fontSize: 14,
    marginBottom: 10,
    fontStyle: 'italic',
  },
});
