'use client'
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "./sidebar";
import {
  useQuery,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { SessionProvider } from "next-auth/react";
import { UserAccessProvider } from "../contexts/UserAccessContext";
import FirstLogonGuard from './components/auth/FirstLogonGuard'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const metadata: Metadata = {
  title: "DC Management App",
  description: "Created by Paul King",
};

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <UserAccessProvider>
          <html lang="en">
            <body
              className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
        <FirstLogonGuard>
              <h1 className="text-6xl text-red-800 pl-8 pt-4">The Theatre Royal, Bath</h1>
              <h2 className="text-4xl text-red-600 pl-8 pt-2"><a href='/'>David Copperfield</a></h2>
              <div className="flex cols w-full pt-2">
                <Sidebar />
                {children}
              </div>
        </FirstLogonGuard>
            </body>
          </html>
        </UserAccessProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
