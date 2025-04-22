import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  loginWithSpotify, 
  logoutFromSpotify, 
  isAuthenticated, 
  getAuthData, 
  getUserProfile,
  SpotifyAuthData,
  SpotifyUserProfile
} from './spotify';

interface SpotifyAuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  authData: SpotifyAuthData | null;
  userProfile: SpotifyUserProfile | null;
  login: () => Promise<boolean>;
  logout: () => Promise<boolean>;
  error: string | null;
}

const SpotifyAuthContext = createContext<SpotifyAuthContextType | undefined>(undefined);

interface SpotifyAuthProviderProps {
  children: ReactNode;
}

export const SpotifyAuthProvider: React.FC<SpotifyAuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authData, setAuthData] = useState<SpotifyAuthData | null>(null);
  const [userProfile, setUserProfile] = useState<SpotifyUserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const authenticated = await isAuthenticated();
        setIsLoggedIn(authenticated);
        
        if (authenticated) {
          const auth = await getAuthData();
          setAuthData(auth);
          
          const profile = await getUserProfile();
          setUserProfile(profile);
        }
      } catch (err) {
        console.error('Error checking authentication:', err);
        setError('Failed to check authentication status');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Login function
  const login = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await loginWithSpotify();
      
      if (result.success) {
        setIsLoggedIn(true);
        setAuthData(result.authData || null);
        setUserProfile(result.userProfile || null);
        return true;
      } else {
        setError(result.error || 'Login failed');
        return false;
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError('An unexpected error occurred during login');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const success = await logoutFromSpotify();
      
      if (success) {
        setIsLoggedIn(false);
        setAuthData(null);
        setUserProfile(null);
        return true;
      } else {
        setError('Logout failed');
        return false;
      }
    } catch (err) {
      console.error('Error during logout:', err);
      setError('An unexpected error occurred during logout');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isLoggedIn,
    isLoading,
    authData,
    userProfile,
    login,
    logout,
    error,
  };

  return (
    <SpotifyAuthContext.Provider value={value}>
      {children}
    </SpotifyAuthContext.Provider>
  );
};

// Custom hook to use the Spotify auth context
export const useSpotifyAuth = (): SpotifyAuthContextType => {
  const context = useContext(SpotifyAuthContext);
  
  if (context === undefined) {
    throw new Error('useSpotifyAuth must be used within a SpotifyAuthProvider');
  }
  
  return context;
};
