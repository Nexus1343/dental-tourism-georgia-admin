import { supabase } from './supabase'

export interface UploadResult {
  data: {
    path: string
    fullPath: string
    publicUrl: string
  } | null
  error: Error | null
}

export class StorageService {
  private static readonly BUCKET_NAME = 'uploads'
  private static readonly EXAMPLE_PHOTOS_PATH = 'question-examples'

  /**
   * Upload a file to Supabase storage
   */
  static async uploadFile(
    file: File, 
    path: string, 
    options?: { upsert?: boolean }
  ): Promise<UploadResult> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: options?.upsert || false,
        })

      if (error) {
        return { data: null, error }
      }

      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(data.path)

      return {
        data: {
          path: data.path,
          fullPath: data.fullPath,
          publicUrl: urlData.publicUrl
        },
        error: null
      }
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Upload failed') 
      }
    }
  }

  /**
   * Upload an example photo for a question
   */
  static async uploadQuestionExamplePhoto(
    questionId: string,
    file: File,
    photoType?: string
  ): Promise<UploadResult> {
    const fileExtension = file.name.split('.').pop()
    const fileName = photoType 
      ? `${questionId}-${photoType}-example.${fileExtension}`
      : `${questionId}-example.${fileExtension}`
    
    const filePath = `${this.EXAMPLE_PHOTOS_PATH}/${fileName}`
    
    return this.uploadFile(file, filePath, { upsert: true })
  }

  /**
   * Delete a file from storage
   */
  static async deleteFile(path: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([path])

      return { error }
    } catch (error) {
      return { 
        error: error instanceof Error ? error : new Error('Delete failed') 
      }
    }
  }

  /**
   * Delete all example photos for a question
   */
  static async deleteQuestionExamplePhotos(questionId: string): Promise<{ error: Error | null }> {
    try {
      // List all files that start with the question ID
      const { data: files, error: listError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(this.EXAMPLE_PHOTOS_PATH, {
          search: questionId
        })

      if (listError) {
        return { error: listError }
      }

      if (!files || files.length === 0) {
        return { error: null }
      }

      // Delete all matching files
      const filePaths = files
        .filter(file => file.name.startsWith(questionId))
        .map(file => `${this.EXAMPLE_PHOTOS_PATH}/${file.name}`)

      if (filePaths.length > 0) {
        const { error } = await supabase.storage
          .from(this.BUCKET_NAME)
          .remove(filePaths)

        return { error }
      }

      return { error: null }
    } catch (error) {
      return { 
        error: error instanceof Error ? error : new Error('Delete failed') 
      }
    }
  }

  /**
   * Get public URL for a file
   */
  static getPublicUrl(path: string): string {
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(path)
    
    return data.publicUrl
  }

  /**
   * Validate image file
   */
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Only JPEG, PNG, and WebP images are allowed'
      }
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Image must be smaller than 5MB'
      }
    }

    return { valid: true }
  }
} 