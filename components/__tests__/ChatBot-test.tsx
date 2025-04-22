import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ChatBot from "../chat/ChatBot";
import { SpotifyAuthProvider } from "@/utils/auth/SpotifyAuthContext";

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

describe("ChatBot", () => {
  it("renders correctly", () => {
    const { getByPlaceholderText, getByText } = render(
      <SpotifyAuthProvider>
        <ChatBot />
      </SpotifyAuthProvider>
    );

    // Check if input field exists
    expect(getByPlaceholderText("Type a message...")).toBeTruthy();

    // Check if send button exists
    expect(getByText("Send")).toBeTruthy();
  });

  it("displays initial messages", () => {
    const initialMessages = [
      {
        id: "1",
        text: "Hello, this is a test message",
        isUser: false,
        timestamp: new Date(),
      },
    ];

    const { getByText } = render(
      <SpotifyAuthProvider>
        <ChatBot initialMessages={initialMessages} />
      </SpotifyAuthProvider>
    );

    // Check if the initial message is displayed
    expect(getByText("Hello, this is a test message")).toBeTruthy();
  });

  it("sends a message when the send button is pressed", async () => {
    // Mock hasShownAuthMessage to true to allow bot responses
    jest
      .spyOn(React, "useState")
      .mockImplementationOnce(() => [true, jest.fn()]);
    const { getByPlaceholderText, getByText, queryByText } = render(
      <SpotifyAuthProvider>
        <ChatBot />
      </SpotifyAuthProvider>
    );

    // Type a message
    const input = getByPlaceholderText("Type a message...");
    fireEvent.changeText(input, "Hello, chatbot!");

    // Press the send button
    const sendButton = getByText("Send");
    fireEvent.press(sendButton);

    // Check if the user message is displayed
    expect(getByText("Hello, chatbot!")).toBeTruthy();

    // Wait for the bot response
    await waitFor(
      () => {
        expect(
          queryByText(
            "I'll need Spotify access to help with that song. Please log in first."
          )
        ).toBeTruthy();
      },
      { timeout: 2000 }
    );
  });

  it("calls onSendMessage callback when a message is sent", () => {
    const onSendMessage = jest.fn();
    const { getByPlaceholderText, getByText } = render(
      <SpotifyAuthProvider>
        <ChatBot onSendMessage={onSendMessage} />
      </SpotifyAuthProvider>
    );

    // Type a message
    const input = getByPlaceholderText("Type a message...");
    fireEvent.changeText(input, "Test callback");

    // Press the send button
    const sendButton = getByText("Send");
    fireEvent.press(sendButton);

    // Check if the callback was called with the correct message
    expect(onSendMessage).toHaveBeenCalledWith("Test callback");
  });
});
