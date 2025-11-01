import { useState } from 'react';
import { OrphanedImage } from '../utils/orphanedImages';

export interface UseOrphanedImagesReturn {
  orphanedImages: {
    cast: OrphanedImage[];
    staff: OrphanedImage[];
  };
  isLoading: boolean;
  error: string | null;
  scanForOrphanedImages: (castImageNames: string[], staffImageNames: string[]) => Promise<void>;
  deleteOrphanedImages: (imagesToDelete: OrphanedImage[]) => Promise<number>;
}

/**
 * Hook for managing orphaned images
 */
export function useOrphanedImages(): UseOrphanedImagesReturn {
  const [orphanedImages, setOrphanedImages] = useState<{
    cast: OrphanedImage[];
    staff: OrphanedImage[];
  }>({ cast: [], staff: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scanForOrphanedImages = async (castImageNames: string[], staffImageNames: string[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/orphaned-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'scan',
          castImageNames,
          staffImageNames,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setOrphanedImages(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteOrphanedImages = async (imagesToDelete: OrphanedImage[]): Promise<number> => {
    try {
      const response = await fetch('/api/orphaned-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          imagesToDelete,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.deletedCount;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  return {
    orphanedImages,
    isLoading,
    error,
    scanForOrphanedImages,
    deleteOrphanedImages,
  };
}