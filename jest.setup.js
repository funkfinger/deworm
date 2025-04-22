// Mock React Native components
jest.mock("react-native", () => {
  const RN = jest.requireActual("react-native");

  RN.StyleSheet = {
    create: (styles) => styles,
    hairlineWidth: 1,
    absoluteFill: {},
    flatten: jest.fn(),
  };

  RN.Dimensions = {
    get: jest.fn().mockReturnValue({
      width: 375,
      height: 812,
      scale: 2,
      fontScale: 1,
    }),
  };

  RN.Platform = {
    OS: "ios",
    select: jest.fn((obj) => obj.ios),
  };

  RN.PixelRatio = {
    get: jest.fn(() => 2),
    getFontScale: jest.fn(() => 1),
    getPixelSizeForLayoutSize: jest.fn((size) => size * 2),
    roundToNearestPixel: jest.fn((size) => size),
  };

  RN.Button = ({ onPress, title, testID }) => ({
    type: "Button",
    props: { onPress, title, testID },
  });

  return RN;
});

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock expo-auth-session
jest.mock("expo-auth-session", () => ({
  makeRedirectUri: jest.fn(() => "https://redirect.uri"),
  useAuthRequest: jest.fn(() => [null, null, jest.fn()]),
  exchangeCodeAsync: jest.fn(() =>
    Promise.resolve({ accessToken: "test-token" })
  ),
}));

// Mock expo-web-browser
jest.mock("expo-web-browser", () => ({
  maybeCompleteAuthSession: jest.fn(),
  dismissAuthSession: jest.fn(),
}));

// Mock react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }) => children,
}));

// Mock useColorScheme
jest.mock("@/hooks/useColorScheme", () => ({
  useColorScheme: () => "light",
}));
