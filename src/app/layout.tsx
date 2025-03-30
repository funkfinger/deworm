import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CookieConsent from "./components/CookieConsent";
import { SessionProvider } from "next-auth/react";
import Header from "./components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
    <html lang="en" data-theme="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
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
