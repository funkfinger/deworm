import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import ChatBot from "../chat/ChatBot";
import { SpotifyAuthProvider } from "@/utils/auth/SpotifyAuthContext";

// Mock the Spotify auth context with different states
const createMockSpotifyAuth = (isLoggedIn: boolean, isLoading: boolean) => {
  jest.mock("@/utils/auth/SpotifyAuthContext", () => {
    const originalModule = jest.requireActual("@/utils/auth/SpotifyAuthContext");

    return {
      ...originalModule,
      useSpotifyAuth: () => ({
        isLoggedIn,
        isLoading,
        login: jest.fn().mockResolvedValue(true),
        error: null,
      }),
    };
  });
};

describe("Chat Integration", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  it("shows Spotify login message when user is not logged in", async () => {
    // Mock not logged in state
    createMockSpotifyAuth(false, false);

    const { getByText, queryByText } = render(
      <SpotifyAuthProvider>
        <ChatBot
          initialMessages={[
            {
              id: "1",
              text: "Oh no, I know why you're here! You've got a pesky song stuck in you melon! Well, let's get that taken care of right away!",
              isUser: false,
              timestamp: new Date(),
            },
          ]}
        />
      </SpotifyAuthProvider>
    );

    // Initial message should be visible
    expect(
      getByText(
        "Oh no, I know why you're here! You've got a pesky song stuck in you melon! Well, let's get that taken care of right away!"
      )
    ).toBeTruthy();

    // Advance timers to trigger the auth message
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Auth message should appear
    await waitFor(() => {
      expect(
        getByText(
          "Before we can get started, I need you to log into Spotify. Once you've done that, I'll be able to get started on your song removal."
        )
      ).toBeTruthy();
    });

    // Login button should be visible
    expect(getByText("Log into Spotify")).toBeTruthy();
  });

  it("shows welcome back message when user is logged in", async () => {
    // Mock logged in state
    createMockSpotifyAuth(true, false);

    const { getByText, queryByText } = render(
      <SpotifyAuthProvider>
        <ChatBot
          initialMessages={[
            {
              id: "1",
              text: "Oh no, I know why you're here! You've got a pesky song stuck in you melon! Well, let's get that taken care of right away!",
              isUser: false,
              timestamp: new Date(),
            },
          ]}
        />
      </SpotifyAuthProvider>
    );

    // Initial message should be visible
    expect(
      getByText(
        "Oh no, I know why you're here! You've got a pesky song stuck in you melon! Well, let's get that taken care of right away!"
      )
    ).toBeTruthy();

    // Advance timers to trigger the welcome back message
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Welcome back message should appear
    await waitFor(() => {
      expect(
        getByText(
          "Oh no you're back! Sure hope it wasn't my fault... Let's get that annoying song out of your dome."
        )
      ).toBeTruthy();
    });

    // Login button should not be visible
    expect(queryByText("Log into Spotify")).toBeNull();
  });

  it("handles user sending a message and getting a response when logged in", async () => {
    // Mock logged in state
    createMockSpotifyAuth(true, false);

    const { getByText, getByPlaceholderText } = render(
      <SpotifyAuthProvider>
        <ChatBot
          initialMessages={[
            {
              id: "1",
              text: "Oh no, I know why you're here! You've got a pesky song stuck in you melon! Well, let's get that taken care of right away!",
              isUser: false,
              timestamp: new Date(),
            },
          ]}
        />
      </SpotifyAuthProvider>
    );

    // Advance timers to trigger the welcome back message
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Set hasShownAuthMessage to true to allow bot responses
    jest.spyOn(React, "useState").mockImplementationOnce(() => [true, jest.fn()]);

    // Type and send a message
    const input = getByPlaceholderText("Type a message...");
    fireEvent.changeText(input, "I have a song stuck in my head");
    fireEvent.press(getByText("Send"));

    // User message should be visible
    expect(getByText("I have a song stuck in my head")).toBeTruthy();

    // Advance timers to trigger the bot response
    act(() => {
      jest.advanceTimersByTime(1500);
    });

    // Bot response should appear
    await waitFor(() => {
      expect(
        getByText("Thanks! I'm analyzing your Spotify data to help with that song.")
      ).toBeTruthy();
    });
  });

  it("handles user sending a message and getting a response when not logged in", async () => {
    // Mock not logged in state
    createMockSpotifyAuth(false, false);

    const { getByText, getByPlaceholderText } = render(
      <SpotifyAuthProvider>
        <ChatBot
          initialMessages={[
            {
              id: "1",
              text: "Oh no, I know why you're here! You've got a pesky song stuck in you melon! Well, let's get that taken care of right away!",
              isUser: false,
              timestamp: new Date(),
            },
          ]}
        />
      </SpotifyAuthProvider>
    );

    // Advance timers to trigger the auth message
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Set hasShownAuthMessage to true to allow bot responses
    jest.spyOn(React, "useState").mockImplementationOnce(() => [true, jest.fn()]);

    // Type and send a message
    const input = getByPlaceholderText("Type a message...");
    fireEvent.changeText(input, "I have a song stuck in my head");
    fireEvent.press(getByText("Send"));

    // User message should be visible
    expect(getByText("I have a song stuck in my head")).toBeTruthy();

    // Advance timers to trigger the bot response
    act(() => {
      jest.advanceTimersByTime(1500);
    });

    // Bot response should appear
    await waitFor(() => {
      expect(
        getByText("I'll need Spotify access to help with that song. Please log in first.")
      ).toBeTruthy();
    });
  });
});
