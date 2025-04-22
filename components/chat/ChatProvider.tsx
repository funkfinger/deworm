import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MessageType } from './ChatBot';

interface ChatContextType {
  messages: MessageType[];
  addMessage: (text: string, isUser: boolean) => void;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
  initialMessages?: MessageType[];
}

export function ChatProvider({ children, initialMessages = [] }: ChatProviderProps) {
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);

  const addMessage = (text: string, isUser: boolean) => {
    const newMessage: MessageType = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <ChatContext.Provider value={{ messages, addMessage, clearMessages }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
