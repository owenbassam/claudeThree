import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StreakCounter } from "@/components/StreakCounter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Socratic AI Tutor - The Endless Climb",
  description: "An AI that questions you, not the other way around. Like Sisyphus, you'll never reach the top—but every correct answer pushes you higher. Fail, and the boulder rolls back down.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="sisyphus" />
        <div className="boulder" />
        <StreakCounter />
        {children}
      </body>
    </html>
  );
}
