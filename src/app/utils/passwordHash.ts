// Utility for password hashing using Web Crypto API
// This is async because Web Crypto API doesn't have sync methods

export async function hashPassword(password: string): Promise<string> {
  // Hash the password using Web Crypto API (Edge Runtime compatible)
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = new Uint8Array(hashBuffer)
  
  // Convert to base64url format
  const pwHash = btoa(String.fromCharCode(...hashArray))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
    
  return pwHash
}

// For compatibility with environments that support Node.js crypto
export function hashPasswordSync(password: string): string {
  if (typeof window !== 'undefined') {
    throw new Error('Synchronous hashing not available in browser environment')
  }
  
  try {
    // This will only work in Node.js environments, not Edge Runtime
    const crypto = require('crypto')
    return crypto.createHash('sha256').update(password).digest('base64url')
  } catch (error) {
    throw new Error('Synchronous hashing not available in this environment')
  }
}