import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import CookieConsent from './components/CookieConsent';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'DeWorm - Earworm Cure App',
  description:
    'DeWorm helps you get rid of those annoying songs stuck in your head by playing a more catchy replacement song.',
  keywords: ['earworm', 'stuck song', 'music', 'Spotify', 'cure'],
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
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
