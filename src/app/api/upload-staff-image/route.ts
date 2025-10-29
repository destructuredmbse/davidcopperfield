import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Validate filename pattern
    const filename = file.name
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')
    const nameParts = nameWithoutExt.split('_')
    
    if (nameParts.length < 2) {
      return NextResponse.json({ 
        error: 'Filename must follow the pattern: firstname_lastname.png' 
      }, { status: 400 })
    }

    // Check for valid characters
    const validPattern = /^[a-zA-Z_-]+$/
    if (!validPattern.test(nameWithoutExt)) {
      return NextResponse.json({ 
        error: 'Filename can only contain letters, hyphens, and underscores' 
      }, { status: 400 })
    }

    // Ensure the upload directory exists
    const uploadDir = join(process.cwd(), 'public', 'images', 'staff')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate the file path
    const filePath = join(uploadDir, filename)

    // Write the file
    await writeFile(filePath, buffer)

    return NextResponse.json({ 
      message: 'File uploaded successfully',
      filename: filename,
      path: `/images/staff/${filename}`
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' }, 
      { status: 500 }
    )
  }
}