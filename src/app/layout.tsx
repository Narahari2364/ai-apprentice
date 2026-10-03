import type { Metadata } from "next";
import Link from "next/link";
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
  title: "The AI Apprentice",
  description: "Capture, map and teach expert judgment with a voice agent.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <nav className="flex items-center gap-6 border-b border-slate-200 bg-white px-6 py-3">
          <Link href="/" className="text-lg font-bold">
            The AI Apprentice
          </Link>
          <Link href="/capture" className="text-slate-600 hover:text-slate-900">Capture</Link>
          <Link href="/map" className="text-slate-600 hover:text-slate-900">Map</Link>
          <Link href="/teach" className="text-slate-600 hover:text-slate-900">Teach</Link>
        </nav>
        <main className="flex-1 p-6">{children}</main>
      </body>
    </html>
  );
}
