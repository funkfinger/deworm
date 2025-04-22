import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SpotifyLoginButton from '../spotify/SpotifyLoginButton';
import { SpotifyAuthProvider } from '@/utils/auth/SpotifyAuthContext';

// Mock the Spotify auth functions
jest.mock('@/utils/auth/SpotifyAuthContext', () => {
  const originalModule = jest.requireActual('@/utils/auth/SpotifyAuthContext');
  
  return {
    ...originalModule,
    useSpotifyAuth: () => ({
      isLoggedIn: false,
      isLoading: false,
      login: jest.fn().mockResolvedValue(true),
      error: null,
    }),
  };
});

describe('SpotifyLoginButton', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <SpotifyAuthProvider>
        <SpotifyLoginButton />
      </SpotifyAuthProvider>
    );
    
    expect(getByText('Log into Spotify')).toBeTruthy();
  });
  
  it('calls onLoginSuccess when login succeeds', async () => {
    const onLoginSuccess = jest.fn();
    const { getByText } = render(
      <SpotifyAuthProvider>
        <SpotifyLoginButton onLoginSuccess={onLoginSuccess} />
      </SpotifyAuthProvider>
    );
    
    fireEvent.press(getByText('Log into Spotify'));
    
    // Wait for the async login to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(onLoginSuccess).toHaveBeenCalled();
  });
});
