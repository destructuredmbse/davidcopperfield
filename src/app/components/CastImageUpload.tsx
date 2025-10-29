'use client'

import ImageUpload from './ImageUpload'

interface CastImageUploadProps {
  onUploadComplete?: (filename: string) => void
}

export default function CastImageUpload({ onUploadComplete }: CastImageUploadProps) {
  return (
    <ImageUpload 
      uploadType="cast" 
      onUploadComplete={onUploadComplete}
    />
  )
}