'use client'

import React, { useState, useEffect } from 'react'
import { Avatar } from '@base-ui-components/react/avatar'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline'

interface SafeAvatarProps {
  src: string
  width?: string | number
  height?: string | number
  className?: string
  fallbackIcon?: 'person' | 'people'
  alt?: string
}

export default function SafeAvatar({ 
  src, 
  width = "48", 
  height = "48", 
  className = "size-full object-cover object-top scale-150",
  fallbackIcon = 'person',
  alt = "Avatar"
}: SafeAvatarProps) {
  const [imageExists, setImageExists] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    let isCancelled = false

    const checkImage = async () => {
      try {
        // Create a new image element to test if the image loads
        const img = new Image()
        
        const loadPromise = new Promise<boolean>((resolve) => {
          img.onload = () => resolve(true)
          img.onerror = () => resolve(false)
        })
        
        // Set the src to start loading
        img.src = src
        
        const exists = await loadPromise
        
        if (!isCancelled) {
          setImageExists(exists)
          setIsChecking(false)
        }
      } catch (error) {
        if (!isCancelled) {
          setImageExists(false)
          setIsChecking(false)
        }
      }
    }

    checkImage()

    return () => {
      isCancelled = true
    }
  }, [src])

  const FallbackIcon = fallbackIcon === 'people' ? PeopleOutlineIcon : PersonOutlineOutlinedIcon
  const iconSize = fallbackIcon === 'people' ? 60 : 50

  return (
    <Avatar.Root className="inline-flex size-16 items-center justify-center overflow-hidden rounded-full bg-gray-100 align-middle text-base font-medium text-black select-none">
      {imageExists === true && (
        <Avatar.Image
          src={src}
          width={width}
          height={height}
          className={className}
          alt={alt}
        />
      )}
      <Avatar.Fallback>
        <FallbackIcon sx={{ fontSize: iconSize }} className='text-red-800'/>
      </Avatar.Fallback>
    </Avatar.Root>
  )
}