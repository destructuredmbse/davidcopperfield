import fs from 'fs';
import path from 'path';
import { OrphanedImage } from '../utils/orphanedImages';

const CAST_IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'cast');
const STAFF_IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'staff');

export async function getOrphanedImages(imageNames: string[], imageType: 'cast' | 'staff'): Promise<OrphanedImage[]> {
  const imageDir = imageType === 'cast' ? CAST_IMAGES_DIR : STAFF_IMAGES_DIR;
  
  try {
    // Check if directory exists
    if (!fs.existsSync(imageDir)) {
      return [];
    }

    // Read all files in the directory
    const files = fs.readdirSync(imageDir);
    
    // Filter for image files and check if they're orphaned
    const orphanedImages: OrphanedImage[] = [];
    
    for (const file of files) {
      // Only process image files
      if (!/\.(jpg|jpeg|png|gif|webp)$/i.test(file)) {
        continue;
      }
      
      // Check if the image is not in the list of used images
      if (!imageNames.includes(file)) {
        const filePath = path.join(imageDir, file);
        const stats = fs.statSync(filePath);
        
        orphanedImages.push({
          name: file,
          path: filePath,
          size: stats.size,
          type: imageType
        });
      }
    }
    
    return orphanedImages;
  } catch (error) {
    console.error(`Error scanning ${imageType} images:`, error);
    return [];
  }
}

export async function getAllOrphanedImages(castImageNames: string[], staffImageNames: string[]): Promise<{
  cast: OrphanedImage[];
  staff: OrphanedImage[];
}> {
  const [castOrphaned, staffOrphaned] = await Promise.all([
    getOrphanedImages(castImageNames, 'cast'),
    getOrphanedImages(staffImageNames, 'staff')
  ]);
  
  return {
    cast: castOrphaned,
    staff: staffOrphaned
  };
}

export async function deleteOrphanedImages(imagesToDelete: OrphanedImage[]): Promise<number> {
  let deletedCount = 0;
  
  for (const image of imagesToDelete) {
    try {
      if (fs.existsSync(image.path)) {
        fs.unlinkSync(image.path);
        deletedCount++;
        console.log(`Deleted orphaned image: ${image.path}`);
      }
    } catch (error) {
      console.error(`Error deleting image ${image.path}:`, error);
    }
  }
  
  return deletedCount;
}