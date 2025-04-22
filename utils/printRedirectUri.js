const { makeRedirectUri } = require('expo-auth-session');

// Print the redirect URI for different platforms
const redirectUri = makeRedirectUri({
  scheme: 'deworm',
  path: 'spotify-auth-callback',
  // Add specific options for different platforms
  native: 'deworm://spotify-auth-callback',
  useProxy: false,
});

console.log('Redirect URI:', redirectUri);

// Also print platform-specific URIs
console.log('Web Redirect URI:', makeRedirectUri({
  scheme: 'deworm',
  path: 'spotify-auth-callback',
  useProxy: false,
}));

console.log('iOS/Android Redirect URI:', 'deworm://spotify-auth-callback');

// For Expo development
console.log('Expo Redirect URI:', 'https://auth.expo.io/@your-expo-username/deworm-chatbot/spotify-auth-callback');
