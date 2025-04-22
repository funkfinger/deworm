import React from 'react';
import { render } from '@testing-library/react-native';
import ChatMessage from '../chat/ChatMessage';

describe('ChatMessage', () => {
  it('renders user message correctly', () => {
    const message = {
      id: '1',
      text: 'Hello, this is a user message',
      isUser: true,
      timestamp: new Date('2023-01-01T12:00:00'),
    };
    
    const { getByText } = render(<ChatMessage message={message} />);
    
    // Check if the message text is displayed
    expect(getByText('Hello, this is a user message')).toBeTruthy();
    
    // Check if the timestamp is displayed (format may vary by locale)
    expect(getByText(message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))).toBeTruthy();
  });

  it('renders bot message correctly', () => {
    const message = {
      id: '2',
      text: 'Hello, this is a bot message',
      isUser: false,
      timestamp: new Date('2023-01-01T12:05:00'),
    };
    
    const { getByText } = render(<ChatMessage message={message} />);
    
    // Check if the message text is displayed
    expect(getByText('Hello, this is a bot message')).toBeTruthy();
    
    // Check if the timestamp is displayed (format may vary by locale)
    expect(getByText(message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))).toBeTruthy();
  });
});
