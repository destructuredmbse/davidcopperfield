import { useState, useCallback } from 'react';

interface UsePhotoSelectorOptions {
  /** Initial photo path */
  initialPhoto?: string;
  /** Callback when photo changes - useful for form integration */
  onPhotoChange?: (photo: string) => void;
}

export function usePhotoSelector({ 
  initialPhoto = '', 
  onPhotoChange 
}: UsePhotoSelectorOptions = {}) {
  const [photo, setPhoto] = useState<string>(initialPhoto);

  const handlePhotoChange = useCallback((newPhoto: string) => {
    setPhoto(newPhoto);
    onPhotoChange?.(newPhoto);
  }, [onPhotoChange]);

  const clearPhoto = useCallback(() => {
    handlePhotoChange('');
  }, [handlePhotoChange]);

  const hasPhoto = Boolean(photo);

  return {
    photo,
    handlePhotoChange,
    clearPhoto,
    hasPhoto
  };
}

export default usePhotoSelector;