'use client'

import { useState } from 'react'
import { useSession, signOut, signIn } from 'next-auth/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { performUpdate } from '../../database/queries'

interface FirstLogonProps {
  onComplete?: () => void
}

export default function FirstLogon({ onComplete }: FirstLogonProps) {
  const { data: session, update } = useSession()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()

  // Mutation to update user password and first_logon status
  const updateUserMutation = useMutation({
    mutationFn: (query: string) => performUpdate(query),
    onSuccess: async () => {
      try {
        // First invalidate queries
        await queryClient.invalidateQueries({ queryKey: ['users'] })
        
        // Sign the user back in with their new password to refresh the session
        const signInResult = await signIn('credentials', {
          username: session?.user?.username,
          password: newPassword,
          redirect: false
        })
        
        if (signInResult?.error) {
          console.error('Auto sign-in failed:', signInResult.error)
          // If auto sign-in fails, sign out and redirect to home page
          await signOut({ callbackUrl: '/' })
        } else {
          // Successfully signed in with new password - session will automatically update
          if (onComplete) {
            onComplete()
          }
        }
      } catch (error) {
        console.error('Error during post-password-change sign-in:', error)
        // Fallback: sign out and let user manually sign in
        await signOut({ callbackUrl: '/' })
      }
    },
    onError: (error) => {
      setError('Failed to update password. Please try again.')
      console.error('Password update error:', error)
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (newPassword === 'copperfield' || newPassword.length < 9) {
      setError("Password must be at least 9 characters long; it can't be 'copperfield'!")
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      // Hash the new password using Web Crypto API (same as auth.ts)
      const { hashPassword } = await import('../../utils/passwordHash')
      const pwHash = await hashPassword(newPassword)

      // Create update query
      const updateQuery = `
        update person filter .id = <uuid>"${session?.user?.id}"
        set {
          pwHash := <str>"${pwHash}",
          first_logon := <bool>false
        }
      `

      await updateUserMutation.mutateAsync(updateQuery)
    } catch (error) {
      setError('An error occurred while updating your password')
      console.error('Password hashing error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-4xl text-red-800 text-center font-bold">Welcome!</h1>
          <h2 className="mt-6 text-center text-2xl font-extrabold text-gray-900">
            First Time Setup
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hi {session?.user?.first_name}! Please set a new password for your account.
          </p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Security Notice:</strong> You must change your password before using the system.
                This ensures your account security and completes your account setup.
              </p>
            </div>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password *
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="Enter your new password (min 6 characters)"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="Confirm your new password"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading || updateUserMutation.isPending}
              className="flex-1 group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-800 hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading || updateUserMutation.isPending ? 'Updating...' : 'Set New Password'}
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="flex-1 group relative flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Sign Out
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            <p><strong>Account Details:</strong></p>
            <p>Username: {session?.user?.username}</p>
            <p>Email: {session?.user?.email || 'Not set'}</p>
            <p>Role: {session?.user?._role || 'Not assigned'}</p>
            <p>Access: {session?.user?.rba?.join(', ') || 'None'}</p>
          </div>
        </form>
      </div>
    </div>
  )
}