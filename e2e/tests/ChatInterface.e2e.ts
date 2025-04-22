import { by, device, element, expect } from 'detox';

describe('Chat Interface', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('should display the app title and subtitle', async () => {
    await expect(element(by.text('De Worm'))).toBeVisible();
    await expect(element(by.text('Kill the worm!'))).toBeVisible();
  });

  it('should display the initial welcome message', async () => {
    await expect(
      element(by.text("Oh no, I know why you're here! You've got a pesky song stuck in you melon! Well, let's get that taken care of right away!"))
    ).toBeVisible();
  });

  it('should display the Spotify login message and button', async () => {
    // Wait for the login message to appear (it has a delay)
    await waitFor(element(by.text('Before we can get started, I need you to log into Spotify. Once you\'ve done that, I\'ll be able to get started on your song removal.')))
      .toBeVisible()
      .withTimeout(5000);
    
    await expect(element(by.text('Log into Spotify'))).toBeVisible();
  });

  it('should have a visible text input area', async () => {
    await expect(element(by.id('chat-input'))).toBeVisible();
  });

  it('should have a visible send button', async () => {
    await expect(element(by.text('Send'))).toBeVisible();
  });

  it('should be able to type and send a message', async () => {
    const testMessage = 'Hello, can you help me?';
    
    await element(by.id('chat-input')).typeText(testMessage);
    await element(by.text('Send')).tap();
    
    // Check if the message appears in the chat
    await expect(element(by.text(testMessage))).toBeVisible();
    
    // Check for bot response
    await waitFor(element(by.text(/I'll need Spotify access to help with that song/)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should not have bottom navigation tabs visible', async () => {
    // The tab bar should be hidden
    await expect(element(by.id('bottom-tab-bar'))).not.toBeVisible();
  });
});
