'use client'

import { useState, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'

interface ImageUploadProps {
  uploadType: 'staff' | 'cast'
  onUploadComplete?: (filename: string) => void
}

export default function ImageUpload({ uploadType, onUploadComplete }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('uploadType', uploadType)
      
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }
      
      return response.json()
    },
    onSuccess: (data) => {
      setUploadStatus('success')
      setSuccessMessage(`Image uploaded successfully as ${data.filename}`)
      setErrorMessage('')
      if (onUploadComplete) {
        onUploadComplete(data.filename)
      }
      // Reset form
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    onError: (error: Error) => {
      setUploadStatus('error')
      setErrorMessage(error.message)
      setSuccessMessage('')
    },
    onMutate: () => {
      setUploadStatus('uploading')
      setErrorMessage('')
      setSuccessMessage('')
    }
  })

  const validateFileName = (filename: string): string | null => {
    // Remove file extension for validation
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')
    
    // Check if filename follows firstname_lastname or firstname_middle_lastname pattern
    const nameParts = nameWithoutExt.split('_')
    if (nameParts.length < 2) {
      return 'Filename must follow the pattern: firstname_lastname.png (e.g., john_smith.png)'
    }
    
    // Check for valid characters (letters, hyphens, underscores)
    const validPattern = /^[a-zA-Z_-]+$/
    if (!validPattern.test(nameWithoutExt)) {
      return 'Filename can only contain letters, hyphens, and underscores'
    }
    
    return null
  }

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file'
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return 'File size must be less than 5MB'
    }
    
    // Validate filename
    return validateFileName(file.name)
  }

  const handleFileSelect = (file: File) => {
    const validation = validateFile(file)
    if (validation) {
      setUploadStatus('error')
      setErrorMessage(validation)
      return
    }
    
    uploadMutation.mutate(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const getDisplayConfig = () => {
    switch (uploadType) {
      case 'staff':
        return {
          title: 'Upload Staff Image',
          directory: 'public/images/staff/',
          description: 'staff members'
        }
      case 'cast':
        return {
          title: 'Upload Cast/Actor Image',
          directory: 'public/images/cast/',
          description: 'cast members and actors'
        }
      default:
        return {
          title: 'Upload Image',
          directory: 'public/images/',
          description: 'people'
        }
    }
  }

  const config = getDisplayConfig()

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{config.title}</h3>
      
      {/* Instructions */}
      <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
        <h4 className="font-medium text-blue-900 mb-2">Image Upload Instructions:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Name your image: <code className="bg-blue-100 px-1 rounded">firstname_lastname.png</code></li>
          <li>• Use hyphens between multiple names: <code className="bg-blue-100 px-1 rounded">mary-jane_smith-jones.png</code></li>
          <li>• File must be an image (PNG, JPG, JPEG, GIF, WebP)</li>
          <li>• Maximum file size: 5MB</li>
          <li>• Images will be stored in <code className="bg-blue-100 px-1 rounded">{config.directory}</code></li>
          <li>• This upload is for {config.description}</li>
        </ul>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : uploadStatus === 'error'
            ? 'border-red-300 bg-red-50'
            : uploadStatus === 'success'
            ? 'border-green-300 bg-green-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploadStatus === 'uploading'}
        />
        
        <div className="space-y-4">
          {uploadStatus === 'uploading' ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-blue-600 font-medium">Uploading image...</p>
            </>
          ) : (
            <>
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG, GIF, WebP up to 5MB</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {errorMessage && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          <p className="text-sm">{successMessage}</p>
        </div>
      )}

      {/* Example filenames */}
      <div className="mt-6 p-3 bg-gray-50 rounded">
        <h5 className="text-sm font-medium text-gray-700 mb-2">Example filenames:</h5>
        <div className="text-xs text-gray-600 space-y-1">
          <div><code className="bg-white px-1 rounded">john_smith.png</code> ✓</div>
          <div><code className="bg-white px-1 rounded">mary-jane_williams.png</code> ✓</div>
          <div><code className="bg-white px-1 rounded">anne_smith-jones.png</code> ✓</div>
          <div><code className="bg-white px-1 rounded">john smith.png</code> ✗ (spaces not allowed)</div>
          <div><code className="bg-white px-1 rounded">johnsmith.png</code> ✗ (needs underscore between names)</div>
        </div>
      </div>
    </div>
  )
}