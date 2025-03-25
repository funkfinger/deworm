import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/app/components/Header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "DeWorm - Earworm Cure App",
  description:
    "Cure songs stuck in your head with DeWorm's expert earworm replacement system",
  keywords: ["earworm", "music", "spotify", "stuck song", "catchy song"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Header />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
