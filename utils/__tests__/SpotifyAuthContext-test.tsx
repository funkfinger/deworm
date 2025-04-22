import React from 'react';
import { render, act } from '@testing-library/react-native';
import { Text, Button, View } from 'react-native';
import { SpotifyAuthProvider, useSpotifyAuth } from '@/utils/auth/SpotifyAuthContext';

// Mock the Spotify auth functions
jest.mock('@/utils/auth/spotify', () => ({
  isAuthenticated: jest.fn().mockResolvedValue(false),
  getAuthData: jest.fn().mockResolvedValue(null),
  getUserProfile: jest.fn().mockResolvedValue(null),
  loginWithSpotify: jest.fn().mockResolvedValue({
    success: true,
    authData: { accessToken: 'test-token' },
    userProfile: { display_name: 'Test User' },
  }),
  logoutFromSpotify: jest.fn().mockResolvedValue(true),
}));

// Test component that uses the SpotifyAuthContext
function TestComponent() {
  const { isLoggedIn, isLoading, login, logout } = useSpotifyAuth();
  
  return (
    <View>
      <Text testID="login-status">{isLoggedIn ? 'Logged In' : 'Logged Out'}</Text>
      <Text testID="loading-status">{isLoading ? 'Loading' : 'Not Loading'}</Text>
      <Button
        testID="login-button"
        title="Login"
        onPress={login}
      />
      <Button
        testID="logout-button"
        title="Logout"
        onPress={logout}
      />
    </View>
  );
}

describe('SpotifyAuthContext', () => {
  it('provides authentication state', () => {
    const { getByTestId } = render(
      <SpotifyAuthProvider>
        <TestComponent />
      </SpotifyAuthProvider>
    );
    
    // Initially not logged in and not loading (after the initial check)
    expect(getByTestId('login-status').props.children).toBe('Logged Out');
    expect(getByTestId('loading-status').props.children).toBe('Not Loading');
  });
  
  it('handles login', async () => {
    const { getByTestId } = render(
      <SpotifyAuthProvider>
        <TestComponent />
      </SpotifyAuthProvider>
    );
    
    // Trigger login
    await act(async () => {
      fireEvent.press(getByTestId('login-button'));
    });
    
    // Should be logged in after successful login
    expect(getByTestId('login-status').props.children).toBe('Logged In');
  });
  
  it('handles logout', async () => {
    const { getByTestId } = render(
      <SpotifyAuthProvider>
        <TestComponent />
      </SpotifyAuthProvider>
    );
    
    // Login first
    await act(async () => {
      fireEvent.press(getByTestId('login-button'));
    });
    
    // Then logout
    await act(async () => {
      fireEvent.press(getByTestId('logout-button'));
    });
    
    // Should be logged out after successful logout
    expect(getByTestId('login-status').props.children).toBe('Logged Out');
  });
});
