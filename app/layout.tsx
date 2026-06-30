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
  title: "Vanguard Graph",
  description: "Fraud coordination intelligence engine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav className="bg-black text-white px-6 py-4 flex gap-6">
          <a href="/" className="font-bold">Vanguard Graph</a>
          <a href="/" className="hover:underline">Dashboard</a>
          <a href="/merchants/new" className="hover:underline">New Merchant</a>
          <a href="/alerts" className="hover:underline">Alerts</a>
          <a href="/settings" className="hover:underline">Settings</a>
        </nav>
        {children}
      </body>
    </html>
  );
}