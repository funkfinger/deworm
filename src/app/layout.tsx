import type { Metadata } from "next";
import { Patrick_Hand } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import CookieConsent from "./components/CookieConsent";
import Header from "./components/Header";

const patrickHand = Patrick_Hand({
  weight: "400",
  variable: "--font-patrick-hand",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DeWorm - Earworm Cure App",
  description:
    "DeWorm helps you get rid of those annoying songs stuck in your head by playing a more catchy replacement song.",
  keywords: ["earworm", "stuck song", "music", "Spotify", "cure"],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="retro">
      <body
        className={`${patrickHand.variable} font-patrick-hand antialiased min-h-screen bg-base-100`}
      >
        <SessionProvider>
          <div className="container mx-auto px-4 py-2 flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">{children}</main>
            <footer className="text-center pb-4 pt-8 opacity-70 text-sm">
              &copy; {new Date().getFullYear()} DeWorm - Your Earworm Cure
            </footer>
          </div>
          <CookieConsent />
        </SessionProvider>
      </body>
    </html>
  );
}
