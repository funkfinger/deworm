import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import ChatMessage from "./ChatMessage";
import SpotifyLoginButton from "../spotify/SpotifyLoginButton";
import { useSpotifyAuth } from "@/utils/auth/SpotifyAuthContext";

export type MessageType = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  showLoginButton?: boolean;
};

interface ChatBotProps {
  initialMessages?: MessageType[];
  onSendMessage?: (message: string) => void;
}

export default function ChatBot({
  initialMessages = [],
  onSendMessage,
}: ChatBotProps) {
  const { isLoggedIn, isLoading } = useSpotifyAuth();
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [hasShownAuthMessage, setHasShownAuthMessage] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Show Spotify login message if not logged in
  useEffect(() => {
    if (
      !isLoading &&
      !isLoggedIn &&
      !hasShownAuthMessage &&
      initialMessages.length > 0
    ) {
      setTimeout(() => {
        const spotifyMessage: MessageType = {
          id: Date.now().toString(),
          text: "Before we can get started, I need you to log into Spotify. Once you've done that, I'll be able to get started on your song removal.",
          isUser: false,
          timestamp: new Date(),
          showLoginButton: true,
        };
        setMessages((prevMessages) => [...prevMessages, spotifyMessage]);
        setHasShownAuthMessage(true);
      }, 1500);
    } else if (
      !isLoading &&
      isLoggedIn &&
      !hasShownAuthMessage &&
      initialMessages.length > 0
    ) {
      setTimeout(() => {
        const welcomeBackMessage: MessageType = {
          id: Date.now().toString(),
          text: "Oh no you're back! Sure hope it wasn't my fault... Let's get that annoying song out of your dome.",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, welcomeBackMessage]);
        setHasShownAuthMessage(true);
      }, 1500);
    }
  }, [isLoading, isLoggedIn, hasShownAuthMessage, initialMessages.length]);

  const handleSendMessage = () => {
    if (inputText.trim() === "") return;

    const newMessage: MessageType = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputText("");

    // Call the onSendMessage callback if provided
    if (onSendMessage) {
      onSendMessage(inputText.trim());
    }

    // Only respond if we're not showing auth messages
    if (hasShownAuthMessage) {
      setTimeout(() => {
        let responseText = "I'm processing your request...";

        if (isLoggedIn) {
          responseText =
            "Thanks! I'm analyzing your Spotify data to help with that song.";
        } else {
          responseText =
            "I'll need Spotify access to help with that song. Please log in first.";
        }

        const botResponse: MessageType = {
          id: (Date.now() + 1).toString(),
          text: responseText,
          isUser: false,
          timestamp: new Date(),
          showLoginButton: !isLoggedIn,
        };
        setMessages((prevMessages) => [...prevMessages, botResponse]);
      }, 1000);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ThemedView style={styles.chatContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View>
              <ChatMessage message={item} />
              {item.showLoginButton && !isLoggedIn && (
                <View style={styles.loginButtonContainer}>
                  <SpotifyLoginButton
                    onLoginSuccess={() => {
                      const successMessage: MessageType = {
                        id: Date.now().toString(),
                        text: "Great! You're now logged in with Spotify. Let's get to work on removing that song!",
                        isUser: false,
                        timestamp: new Date(),
                      };
                      setMessages((prevMessages) => [
                        ...prevMessages,
                        successMessage,
                      ]);
                    }}
                  />
                </View>
              )}
            </View>
          )}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#888"
            returnKeyType="send"
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
            disabled={inputText.trim() === ""}
          >
            <ThemedText style={styles.sendButtonText}>Send</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  chatContainer: {
    flex: 1,
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
  },
  messageList: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 16,
  },
  sendButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#007AFF",
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  sendButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  loginButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    paddingHorizontal: 16,
  },
});
