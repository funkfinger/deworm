import React from "react";
import { render, act, fireEvent } from "@testing-library/react-native";
import { ChatProvider, useChat } from "../chat/ChatProvider";
import { Text, Button, View } from "react-native";

// Test component that uses the ChatProvider
function TestComponent() {
  const { messages, addMessage, clearMessages } = useChat();

  return (
    <View>
      <Text testID="message-count">{messages.length}</Text>
      {messages.map((msg) => (
        <Text key={msg.id} testID={`message-${msg.id}`}>
          {msg.text}
        </Text>
      ))}
      <Button
        testID="add-user-message"
        title="Add User Message"
        onPress={() => addMessage("User message", true)}
      />
      <Button
        testID="add-bot-message"
        title="Add Bot Message"
        onPress={() => addMessage("Bot message", false)}
      />
      <Button
        testID="clear-messages"
        title="Clear Messages"
        onPress={clearMessages}
      />
    </View>
  );
}

describe("ChatProvider", () => {
  it("provides initial messages", () => {
    const initialMessages = [
      {
        id: "1",
        text: "Initial message",
        isUser: false,
        timestamp: new Date(),
      },
    ];

    const { getByTestId, getByText } = render(
      <ChatProvider initialMessages={initialMessages}>
        <TestComponent />
      </ChatProvider>
    );

    // Check if the initial message count is correct
    expect(getByTestId("message-count").props.children).toBe(1);

    // Check if the initial message is displayed
    expect(getByText("Initial message")).toBeTruthy();
  });

  it("adds user and bot messages", () => {
    const { getByTestId, getByText } = render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    // Check initial message count
    expect(getByTestId("message-count").props.children).toBe(0);

    // Add a user message
    act(() => {
      fireEvent.press(getByTestId("add-user-message"));
    });

    // Check if message count increased
    expect(getByTestId("message-count").props.children).toBe(1);

    // Check if the user message is displayed
    expect(getByText("User message")).toBeTruthy();

    // Add a bot message
    act(() => {
      fireEvent.press(getByTestId("add-bot-message"));
    });

    // Check if message count increased again
    expect(getByTestId("message-count").props.children).toBe(2);

    // Check if the bot message is displayed
    expect(getByText("Bot message")).toBeTruthy();
  });

  it("clears messages", () => {
    const { getByTestId } = render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    // Add messages
    act(() => {
      fireEvent.press(getByTestId("add-user-message"));
      fireEvent.press(getByTestId("add-bot-message"));
    });

    // Check if messages were added
    expect(getByTestId("message-count").props.children).toBe(2);

    // Clear messages
    act(() => {
      fireEvent.press(getByTestId("clear-messages"));
    });

    // Check if messages were cleared
    expect(getByTestId("message-count").props.children).toBe(0);
  });
});
