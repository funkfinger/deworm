import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import ChatMessage from "./ChatMessage";
import SpotifyLoginButton from "../spotify/SpotifyLoginButton";
import SongSearchAutocomplete from "../spotify/SongSearchAutocomplete";
import SelectedSong from "../spotify/SelectedSong";
import { useSpotifyAuth } from "@/utils/auth/SpotifyAuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { searchTracks, SpotifyTrack } from "@/utils/auth/spotify";
import { debounce } from "lodash";

export type MessageType = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  showLoginButton?: boolean;
  selectedTrack?: SpotifyTrack;
};

interface ChatBotProps {
  initialMessages?: MessageType[];
  onSendMessage?: (message: string) => void;
}

export default function ChatBot({
  initialMessages = [],
  onSendMessage,
}: ChatBotProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { isLoggedIn, isLoading, authData } = useSpotifyAuth();
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [hasShownAuthMessage, setHasShownAuthMessage] = useState(false);
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
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

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!isLoggedIn || !authData?.accessToken || query.length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      const results = await searchTracks(query, authData.accessToken);
      setSearchResults(results);
      setIsSearching(false);
    }, 500),
    [isLoggedIn, authData]
  );

  // Handle input change
  const handleInputChange = (text: string) => {
    setInputText(text);

    if (isLoggedIn && text.length >= 2) {
      setShowAutocomplete(true);
      debouncedSearch(text);
    } else {
      setShowAutocomplete(false);
      setSearchResults([]);
    }
  };

  // Handle track selection
  const handleSelectTrack = (track: SpotifyTrack) => {
    setSelectedTrack(track);
    setInputText(
      `I want to remove "${track.name}" by ${track.artists[0].name} from my head`
    );
    setShowAutocomplete(false);
  };

  const handleSendMessage = () => {
    if (inputText.trim() === "") return;

    const newMessage: MessageType = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
      selectedTrack: selectedTrack || undefined,
    };

    setMessages([...messages, newMessage]);
    setInputText("");
    setSelectedTrack(null);

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
          testID="chat-message-list"
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View>
              <ChatMessage message={item} />
              {item.selectedTrack && (
                <SelectedSong track={item.selectedTrack} />
              )}
              {item.showLoginButton && !isLoggedIn && (
                <View style={styles.loginButtonWrapper}>
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
                </View>
              )}
            </View>
          )}
          contentContainerStyle={[styles.messageList, { paddingBottom: 120 }]} // Add extra padding at the bottom
          showsVerticalScrollIndicator={false}
        />

        <SafeAreaView
          style={[
            styles.inputContainerWrapper,
            { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 },
            isDark ? styles.inputContainerWrapperDark : {},
          ]}
        >
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              testID="chat-input"
              style={[styles.input, isDark ? styles.inputDark : {}]}
              value={inputText}
              onChangeText={handleInputChange}
              placeholder="Type a message..."
              placeholderTextColor={isDark ? "#888" : "#888"}
              returnKeyType="send"
              onSubmitEditing={handleSendMessage}
            />
            <TouchableOpacity
              style={styles.sendButton}
              testID="send-button"
              onPress={handleSendMessage}
              disabled={inputText.trim() === ""}
            >
              <ThemedText style={styles.sendButtonText}>Send</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Song search autocomplete */}
          <SongSearchAutocomplete
            tracks={searchResults}
            isLoading={isSearching}
            onSelectTrack={handleSelectTrack}
            visible={showAutocomplete && isLoggedIn}
          />
        </SafeAreaView>
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
    paddingBottom: 30, // Extra padding at the bottom for login button
  },
  inputContainerWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  inputContainerWrapperDark: {
    backgroundColor: "#1c1c1e",
    borderTopColor: "#38383A",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 16,
    color: "#000",
  },
  inputDark: {
    backgroundColor: "#2c2c2e",
    color: "#fff",
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
  loginButtonWrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 15,
    paddingVertical: 15,
    zIndex: 10,
    position: "relative",
    backgroundColor: "rgba(0, 122, 255, 0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 122, 255, 0.1)",
  },
  loginButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    paddingHorizontal: 16,
    paddingTop: 5,
    paddingBottom: 5,
    zIndex: 20,
    position: "relative",
  },
});
