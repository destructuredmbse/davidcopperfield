'use client'

import ImageUpload from './ImageUpload'

interface StaffImageUploadProps {
  onUploadComplete?: (filename: string) => void
}

export default function StaffImageUpload({ onUploadComplete }: StaffImageUploadProps) {
  return (
    <ImageUpload 
      uploadType="staff" 
      onUploadComplete={onUploadComplete}
    />
  )
}