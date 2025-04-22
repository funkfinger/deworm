import "dotenv/config";

export default {
  expo: {
    name: "deworm-chatbot",
    slug: "deworm-chatbot",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "deworm",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.funkfinger.deworm",
      infoPlist: {
        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: ["deworm"],
          },
        ],
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.funkfinger.deworm",
    },
    web: {
      bundler: "metro",
      favicon: "./assets/images/favicon.png",
    },
    extra: {
      SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
      SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
      eas: {
        projectId: "your-project-id",
      },
    },
  },
};
