import React from "react";
import { render } from "@testing-library/react-native";
import ChatMessage from "../chat/ChatMessage";
import { SpotifyAuthProvider } from "@/utils/auth/SpotifyAuthContext";

// Mock the useColorScheme hook
jest.mock("@/hooks/useColorScheme", () => ({
  useColorScheme: () => "light",
}));

// Mock the Spotify auth context
jest.mock("@/utils/auth/SpotifyAuthContext", () => {
  return {
    SpotifyAuthProvider: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    useSpotifyAuth: () => ({
      isLoggedIn: true,
      isLoading: false,
      userProfile: {
        id: "test-user",
        display_name: "Test User",
        email: "test@example.com",
        images: [{ url: "https://example.com/avatar.jpg" }],
        uri: "spotify:user:test-user",
      },
      login: jest.fn().mockResolvedValue(true),
      logout: jest.fn().mockResolvedValue(true),
      error: null,
      authData: null,
    }),
  };
});

describe("ChatMessage", () => {
  it("renders user message correctly", () => {
    const message = {
      id: "1",
      text: "Hello, this is a user message",
      isUser: true,
      timestamp: new Date("2023-01-01T12:00:00"),
    };

    const { getByText } = render(
      <SpotifyAuthProvider>
        <ChatMessage message={message} />
      </SpotifyAuthProvider>
    );

    // Check if the message text is displayed
    expect(getByText("Hello, this is a user message")).toBeTruthy();

    // Check if the timestamp is displayed (format may vary by locale)
    expect(
      getByText(
        message.timestamp.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      )
    ).toBeTruthy();
  });

  it("renders bot message correctly", () => {
    const message = {
      id: "2",
      text: "Hello, this is a bot message",
      isUser: false,
      timestamp: new Date("2023-01-01T12:05:00"),
    };

    const { getByText } = render(
      <SpotifyAuthProvider>
        <ChatMessage message={message} />
      </SpotifyAuthProvider>
    );

    // Check if the message text is displayed
    expect(getByText("Hello, this is a bot message")).toBeTruthy();

    // Check if the timestamp is displayed (format may vary by locale)
    expect(
      getByText(
        message.timestamp.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      )
    ).toBeTruthy();
  });
});
