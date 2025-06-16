import { NextRequest, NextResponse } from 'next/server'
import { StorageService } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const path = formData.get('path') as string
    const questionId = formData.get('questionId') as string
    const uploadType = formData.get('uploadType') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file based on upload type
    let validation
    if (uploadType === 'education-document' || uploadType === 'certification-document' || uploadType === 'doctor-profile' || uploadType === 'patient-photo') {
      if (uploadType === 'doctor-profile' || uploadType === 'patient-photo') {
        validation = StorageService.validateImageFile(file)
      } else {
        validation = StorageService.validateDocumentFile(file)
      }
    } else {
      // Default to image validation for backwards compatibility
      validation = StorageService.validateImageFile(file)
    }
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    let result
    
    if (uploadType === 'example-photo' && questionId) {
      // Upload example photo for a question
      result = await StorageService.uploadQuestionExamplePhoto(questionId, file)
    } else if (path) {
      // Upload to specific path
      result = await StorageService.uploadFile(file, path, { upsert: true })
    } else {
      // General upload
      const timestamp = new Date().getTime()
      const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const defaultPath = `uploads/${filename}`
      result = await StorageService.uploadFile(file, defaultPath)
    }

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data
    })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    const questionId = searchParams.get('questionId')

    if (questionId) {
      // Delete all example photos for a question
      const result = await StorageService.deleteQuestionExamplePhotos(questionId)
      if (result.error) {
        return NextResponse.json(
          { error: result.error.message },
          { status: 500 }
        )
      }
    } else if (path) {
      // Delete specific file
      const result = await StorageService.deleteFile(path)
      if (result.error) {
        return NextResponse.json(
          { error: result.error.message },
          { status: 500 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Path or questionId is required' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true
    })

  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
} 