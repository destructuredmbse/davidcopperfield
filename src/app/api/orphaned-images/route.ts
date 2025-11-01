import { NextRequest, NextResponse } from 'next/server';
import { getOrphanedImages, getAllOrphanedImages, deleteOrphanedImages } from '../../lib/orphanedImagesServer';

export async function POST(request: NextRequest) {
  try {
    const { action, castImageNames, staffImageNames, imagesToDelete, imageType } = await request.json();

    switch (action) {
      case 'scan': {
        if (!castImageNames || !staffImageNames) {
          return NextResponse.json(
            { error: 'Missing castImageNames or staffImageNames' },
            { status: 400 }
          );
        }

        const result = await getAllOrphanedImages(castImageNames, staffImageNames);
        return NextResponse.json(result);
      }

      case 'delete': {
        if (!imagesToDelete || !Array.isArray(imagesToDelete)) {
          return NextResponse.json(
            { error: 'Missing or invalid imagesToDelete array' },
            { status: 400 }
          );
        }

        const deletedCount = await deleteOrphanedImages(imagesToDelete);
        return NextResponse.json({ deletedCount });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "scan" or "delete"' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in orphaned images API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}