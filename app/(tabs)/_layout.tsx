import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { ChatProvider } from "@/components/chat/ChatProvider";

export default function TabLayout() {
  return (
    <ChatProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: "none" }, // Hide the tab bar completely
        }}
      >
        <Tabs.Screen
          name="chat"
          options={{
            title: "De Worm",
          }}
        />
      </Tabs>
    </ChatProvider>
  );
}
