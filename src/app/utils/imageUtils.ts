'use client'

import { useState, useEffect } from 'react'

interface UseImageLoadProps {
  src: string
  fallback?: string
}

export function useImageLoad({ src, fallback }: UseImageLoadProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!src) {
      setIsLoading(false)
      setHasError(true)
      return
    }

    const img = new Image()
    
    const handleLoad = () => {
      setImageSrc(src)
      setIsLoading(false)
      setHasError(false)
    }
    
    const handleError = () => {
      setImageSrc(fallback || null)
      setIsLoading(false)
      setHasError(true)
    }

    img.addEventListener('load', handleLoad)
    img.addEventListener('error', handleError)
    
    // Start loading the image
    img.src = src

    return () => {
      img.removeEventListener('load', handleLoad)
      img.removeEventListener('error', handleError)
    }
  }, [src, fallback])

  return { imageSrc, isLoading, hasError }
}

// Alternative approach: Check if image exists without loading it
export async function checkImageExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

// More comprehensive image preloader
export function preloadImage(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    
    img.src = src
  })
}