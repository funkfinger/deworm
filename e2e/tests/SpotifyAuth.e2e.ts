import { by, device, element, expect } from 'detox';

describe('Spotify Authentication', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('should show login button when not logged in', async () => {
    // Wait for the login message to appear (it has a delay)
    await waitFor(element(by.text('Before we can get started, I need you to log into Spotify. Once you\'ve done that, I\'ll be able to get started on your song removal.')))
      .toBeVisible()
      .withTimeout(5000);
    
    await expect(element(by.text('Log into Spotify'))).toBeVisible();
  });

  // Note: Full OAuth flow testing would require mocking the Spotify authentication
  // This is a simplified test that just checks the UI elements
  it('should initiate Spotify login when button is pressed', async () => {
    await element(by.text('Log into Spotify')).tap();
    
    // In a real test, we would need to handle the WebView that opens for OAuth
    // For now, we'll just check that the app doesn't crash
    await expect(element(by.text('De Worm'))).toBeVisible();
  });
});
