import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to the chat screen
  return <Redirect href="/(tabs)/chat" />;
}
