'use client'

import { useSession } from 'next-auth/react'
import FirstLogon from './FirstLogon'
import { ReactNode } from 'react'

interface FirstLogonGuardProps {
  children: ReactNode
}

export default function FirstLogonGuard({ children }: FirstLogonGuardProps) {
  const { data: session, status } = useSession()

  // Show loading while session is being fetched
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, let NextAuth handle the redirect
  if (status === 'unauthenticated') {
    return <>{children}</>
  }

  // If authenticated but first logon is true, show FirstLogon component
  if (session?.user?.first_logon) {
    return <FirstLogon />
  }

  // Normal authenticated user - show the app
  return <>{children}</>
}

export { FirstLogon }