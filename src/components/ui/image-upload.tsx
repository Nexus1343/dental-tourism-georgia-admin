'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Upload, 
  X, 
  Star, 
  Image as ImageIcon,
  Loader2,
  AlertCircle
} from 'lucide-react'
import Image from 'next/image'

interface ImageData {
  id: string
  url: string
  filename: string
  size: number
  isFeatured?: boolean
}

interface ImageUploadProps {
  images: ImageData[]
  onImagesChange: (images: ImageData[]) => void
  featuredImageUrl?: string
  onFeaturedImageChange: (url: string) => void
  maxImages?: number
  className?: string
}

export function ImageUpload({ 
  images, 
  onImagesChange, 
  featuredImageUrl,
  onFeaturedImageChange,
  maxImages = 10,
  className 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = useCallback(async (files: FileList) => {
    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`)
      return
    }

    setUploading(true)
    setError(null)

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image file`)
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is too large. Maximum size is 5MB`)
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('path', `blog-images/${Date.now()}-${file.name}`)
        formData.append('uploadType', 'blog-image')

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Failed to upload ${file.name}`)
        }

        const result = await response.json()
        
        return {
          id: crypto.randomUUID(),
          url: result.data.publicUrl || result.data.path,
          filename: file.name,
          size: file.size
        }
      })

      const uploadedImages = await Promise.all(uploadPromises)
      const newImages = [...images, ...uploadedImages]
      
      onImagesChange(newImages)

      // If this is the first image and no featured image is set, make it featured
      if (images.length === 0 && !featuredImageUrl && uploadedImages.length > 0) {
        onFeaturedImageChange(uploadedImages[0].url)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload images')
    } finally {
      setUploading(false)
    }
  }, [images, maxImages, onImagesChange, featuredImageUrl, onFeaturedImageChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const removeImage = useCallback(async (imageToRemove: ImageData) => {
    try {
      // Delete from storage
      await fetch(`/api/upload?path=${encodeURIComponent(imageToRemove.url)}`, {
        method: 'DELETE'
      })
    } catch (err) {
      console.warn('Failed to delete image from storage:', err)
    }

    const newImages = images.filter(img => img.id !== imageToRemove.id)
    onImagesChange(newImages)

    // If the removed image was featured, clear featured image
    if (featuredImageUrl === imageToRemove.url) {
      onFeaturedImageChange('')
    }
  }, [images, onImagesChange, featuredImageUrl, onFeaturedImageChange])

  const setFeaturedImage = useCallback((image: ImageData) => {
    onFeaturedImageChange(image.url)
  }, [onFeaturedImageChange])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors"
      >
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Drop images here or click to upload</p>
            <p className="text-xs text-muted-foreground">
              Supports: JPG, PNG, GIF, WebP (max 5MB each, {maxImages} images total)
            </p>
          </div>
          <Input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            className="hidden"
            id="image-upload"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('image-upload')?.click()}
            disabled={uploading || images.length >= maxImages}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <ImageIcon className="mr-2 h-4 w-4" />
                Select Images
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError(null)}
            className="ml-auto h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              Uploaded Images ({images.length}/{maxImages})
            </h4>
            {featuredImageUrl && (
              <Badge variant="secondary" className="text-xs">
                ⭐ Featured image set
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <Card key={image.id} className="overflow-hidden">
                <CardContent className="p-2">
                  <div className="relative aspect-square mb-2">
                    <Image
                      src={image.url}
                      alt={image.filename}
                      fill
                      className="object-cover rounded"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                    <div className="absolute top-1 right-1 flex gap-1">
                      {featuredImageUrl === image.url && (
                        <Badge variant="default" className="text-xs px-1 py-0">
                          <Star className="h-3 w-3" />
                        </Badge>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeImage(image)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-medium truncate" title={image.filename}>
                      {image.filename}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(image.size)}
                    </p>
                    
                    <div className="flex gap-1">
                      {featuredImageUrl !== image.url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setFeaturedImage(image)}
                          className="text-xs h-6 px-2"
                        >
                          <Star className="h-3 w-3 mr-1" />
                          Set Featured
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 