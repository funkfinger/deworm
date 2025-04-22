import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ChatBot from '../chat/ChatBot';

describe('ChatBot', () => {
  it('renders correctly', () => {
    const { getByPlaceholderText, getByText } = render(<ChatBot />);
    
    // Check if input field exists
    expect(getByPlaceholderText('Type a message...')).toBeTruthy();
    
    // Check if send button exists
    expect(getByText('Send')).toBeTruthy();
  });

  it('displays initial messages', () => {
    const initialMessages = [
      {
        id: '1',
        text: 'Hello, this is a test message',
        isUser: false,
        timestamp: new Date(),
      },
    ];
    
    const { getByText } = render(<ChatBot initialMessages={initialMessages} />);
    
    // Check if the initial message is displayed
    expect(getByText('Hello, this is a test message')).toBeTruthy();
  });

  it('sends a message when the send button is pressed', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<ChatBot />);
    
    // Type a message
    const input = getByPlaceholderText('Type a message...');
    fireEvent.changeText(input, 'Hello, chatbot!');
    
    // Press the send button
    const sendButton = getByText('Send');
    fireEvent.press(sendButton);
    
    // Check if the user message is displayed
    expect(getByText('Hello, chatbot!')).toBeTruthy();
    
    // Wait for the bot response
    await waitFor(() => {
      expect(queryByText("I'm a simple chatbot. I can't do much yet, but I'm here to help!")).toBeTruthy();
    }, { timeout: 2000 });
  });

  it('calls onSendMessage callback when a message is sent', () => {
    const onSendMessage = jest.fn();
    const { getByPlaceholderText, getByText } = render(
      <ChatBot onSendMessage={onSendMessage} />
    );
    
    // Type a message
    const input = getByPlaceholderText('Type a message...');
    fireEvent.changeText(input, 'Test callback');
    
    // Press the send button
    const sendButton = getByText('Send');
    fireEvent.press(sendButton);
    
    // Check if the callback was called with the correct message
    expect(onSendMessage).toHaveBeenCalledWith('Test callback');
  });
});
