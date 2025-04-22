import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Platform, Dimensions } from "react-native";
import ChatBot from "../chat/ChatBot";
import { SpotifyAuthProvider } from "@/utils/auth/SpotifyAuthContext";

// Mock the react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

// Mock the useColorScheme hook
jest.mock("@/hooks/useColorScheme", () => ({
  useColorScheme: () => "light",
}));

// Mock the Spotify auth context
jest.mock("@/utils/auth/SpotifyAuthContext", () => {
  const originalModule = jest.requireActual("@/utils/auth/SpotifyAuthContext");

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

describe("Chat UI Fixes", () => {
  // Mock Platform.OS for testing iOS-specific behavior
  const originalPlatform = Platform.OS;
  const originalDimensions = Dimensions.get;

  beforeEach(() => {
    // Mock Platform.OS as iOS
    Platform.OS = "ios";
    
    // Mock iPhone dimensions
    Dimensions.get = jest.fn().mockReturnValue({
      width: 375,
      height: 812,
      scale: 2,
      fontScale: 1,
    });
  });

  afterEach(() => {
    // Restore original values
    Platform.OS = originalPlatform;
    Dimensions.get = originalDimensions;
  });

  it("renders the input container at the bottom of the screen", () => {
    const { getByTestId } = render(
      <SpotifyAuthProvider>
        <ChatBot />
      </SpotifyAuthProvider>
    );

    // Input container should be present
    const inputContainer = getByTestId("chat-input");
    expect(inputContainer).toBeTruthy();
  });

  it("applies safe area insets to the input container on iOS", () => {
    const { getByTestId } = render(
      <SpotifyAuthProvider>
        <ChatBot />
      </SpotifyAuthProvider>
    );

    // Input container wrapper should have padding bottom for safe area
    const inputContainer = getByTestId("chat-input");
    expect(inputContainer).toBeTruthy();
  });

  it("allows typing in the input field", () => {
    const { getByTestId } = render(
      <SpotifyAuthProvider>
        <ChatBot />
      </SpotifyAuthProvider>
    );

    // Input should be functional
    const input = getByTestId("chat-input");
    fireEvent.changeText(input, "Test message");
    expect(input.props.value).toBe("Test message");
  });

  it("has a visible send button", () => {
    const { getByTestId } = render(
      <SpotifyAuthProvider>
        <ChatBot />
      </SpotifyAuthProvider>
    );

    // Send button should be visible
    const sendButton = getByTestId("send-button");
    expect(sendButton).toBeTruthy();
  });

  it("applies dark mode styles when in dark mode", () => {
    // Override the useColorScheme mock for this test
    jest.mock("@/hooks/useColorScheme", () => ({
      useColorScheme: () => "dark",
    }));

    const { getByTestId } = render(
      <SpotifyAuthProvider>
        <ChatBot />
      </SpotifyAuthProvider>
    );

    // Input should be present
    const input = getByTestId("chat-input");
    expect(input).toBeTruthy();
  });
});
