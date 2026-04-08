import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MetaKill — Remove Image Metadata Online, Free & Private",
  description:
    "Strip EXIF data, GPS coordinates, camera info, and all hidden metadata from your images instantly. No uploads, no server — everything runs in your browser.",
  keywords: [
    "remove image metadata",
    "strip EXIF data",
    "remove GPS from photo",
    "image metadata remover",
    "EXIF cleaner",
    "online EXIF remover",
    "photo privacy tool",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <Analytics />
        {children}
      </body>
    </html>
  );
}
