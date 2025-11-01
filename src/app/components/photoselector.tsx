import { useState } from 'react';
import OrphanedImageSelector from './saved/OrphanedImageSelector';

interface PhotoSelectorProps {
  /** Current photo path */
  currentPhoto?: string;
  /** Callback when photo changes */
  handlePhotoChange: (photo: string) => void;
  /** Whether this is for cast (true) or staff (false) */
  isForCast: boolean;
  /** Optional label for the section */
  label?: string;
}

export default function PhotoSelector({
  currentPhoto,
  handlePhotoChange,
  isForCast,
  label = "Photo"
}: PhotoSelectorProps) {
  const handleImageSelect = (imagePath: string) => {
    handlePhotoChange(imagePath);
  };

  const handleRemovePhoto = () => {
    handlePhotoChange('');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="font-medium text-gray-900">
        {label}
      </div>

      {/* Current Photo Display */}
      {currentPhoto && (
        <div className="flex items-start gap-4">
          <div className="relative">
            <img
              src={currentPhoto}
              alt="Current photo"
              className="w-24 h-24 object-cover rounded-lg border border-gray-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBzdHJva2U9IiNjY2MiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0iI2Y5ZjlmOSIvPgo8L3N2Zz4K';
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-sm text-gray-600">
              Current: {currentPhoto.split('/').pop()}
            </div>
            <button
              onClick={handleRemovePhoto}
              className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 w-fit"
            >
              Remove Photo
            </button>
          </div>
        </div>
      )}

      {/* Photo Selection Options */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-3">
          {/* Select from Orphaned Images */}
          <OrphanedImageSelector
            isForCast={isForCast}
            currentImage={currentPhoto}
            onImageSelect={handleImageSelect}
            trigger={
              <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                Select from Available Images
              </button>
            }
          />

          {/* Upload New Image */}
          <label className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer">
            Upload New Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Create a temporary URL for preview
                  const tempUrl = URL.createObjectURL(file);
                  handlePhotoChange(tempUrl);
                  
                  // Here you would typically upload the file to your server
                  // and then update with the actual server path
                  console.log('File selected for upload:', file.name);
                  
                  // TODO: Implement actual file upload logic
                  // For now, we'll use the temporary URL
                }
              }}
            />
          </label>
        </div>

        {/* Help Text */}
        <div className="text-sm text-gray-500">
          <p>
            <strong>Select from Available Images:</strong> Choose from unused images already in the {isForCast ? 'cast' : 'staff'} directory.
          </p>
          <p className="mt-1">
            <strong>Upload New Image:</strong> Add a new image file (will be uploaded to the server).
          </p>
        </div>
      </div>
    </div>
  )
}