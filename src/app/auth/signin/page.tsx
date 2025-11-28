'use client'

import { signIn, getSession } from "next-auth/react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

/**
 * Sign In Page Component
 * 
 * Provides a user authentication interface for the David Copperfield production
 * management system. Handles credential-based authentication using NextAuth.js v5
 * and includes error handling for various authentication scenarios.
 * 
 * @component
 * @returns {JSX.Element} The signin form with theatre branding
 * 
 * Features:
 * - Credentials-based authentication (username/password)
 * - URL-based error message display
 * - Callback URL redirection after successful login
 * - Loading states and form validation
 * - Responsive design with Theatre Royal Bath branding
 * 
 * @example
 * // Accessed via routing
 * // /auth/signin - Standard signin
 * // /auth/signin?callbackUrl=/admin - Redirect to admin after login
 * // /auth/signin?error=Invalid credentials - Display error message
 * 
 * @see {@link https://next-auth.js.org/getting-started/client} NextAuth Client API
 */
export default function SignIn() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const urlError = searchParams.get('error')

  /**
   * Handles form submission for user authentication
   * 
   * Processes login credentials through NextAuth.js credentials provider,
   * manages loading states, and handles both successful and failed authentication
   * attempts with appropriate user feedback.
   * 
   * @param {React.FormEvent} e - Form submission event
   * @returns {Promise<void>} Completes when authentication process finishes
   * 
   * Flow:
   * 1. Prevents default form submission
   * 2. Sets loading state and clears previous errors
   * 3. Attempts authentication via NextAuth signIn
   * 4. On success: redirects to callback URL or home page
   * 5. On failure: displays error message to user
   * 6. Always resets loading state when complete
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Attempt credentials-based authentication
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false, // Handle redirect manually
      })

      if (result?.error) {
        setError('Invalid credentials')
      } else {
        // Success - redirect to callback URL or home page
        router.push(callbackUrl)
      }
    } catch (error) {
      setError('An error occurred during sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-6xl text-red-800 text-center font-bold">The Theatre Royal, Bath</h1>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            David Copperfield
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {(error || urlError) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error || urlError}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Enter your username"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-800 hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}