'use client'
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "./sidebar";
import Link from "next/link";
import {
  useQuery,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { SessionProvider } from "next-auth/react";
import { UserAccessProvider, useUserAccess } from "../contexts/UserAccessContext";
import FirstLogonGuard from './components/auth/FirstLogonGuard'
import DavidToolbar from "./toolbar";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Note: Metadata should be exported from a Server Component, not Client Component
// For client components, we'll handle the title in the Head component

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
          <div className="relative">
            <div className="absolute top-2 right-2">
              <DavidToolbar />
            </div>
              <h1 className="text-6xl text-red-800 pl-8 pt-4">The Theatre Royal, Bath</h1>
              <h2 className="text-4xl text-red-600 pl-16 pt-2"><Link href='/'>David Copperfield</Link></h2>
              <div className="flex cols w-full pt-2 pl-20">
                {/* <Sidebar /> */}
                {children}
              </div>
              </div>
        </FirstLogonGuard>
            </body>
          </html>
        </UserAccessProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
