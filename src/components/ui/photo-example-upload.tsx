'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload, X, Eye, ImageIcon, AlertCircle } from 'lucide-react'

import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ExamplePhoto {
  url: string
  path: string
  instructions?: string
}

interface PhotoExampleUploadProps {
  questionId?: string
  examplePhoto?: ExamplePhoto
  onExamplePhotoChange: (photo: ExamplePhoto | null) => void
  title?: string
  description?: string
}

export function PhotoExampleUpload({
  questionId,
  examplePhoto,
  onExamplePhotoChange,
  title = "Example Photo",
  description = "Upload an example photo to show users what kind of image they should take."
}: PhotoExampleUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Basic client-side validation
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, and WebP images are allowed')
      return
    }

    if (file.size > maxSize) {
      toast.error('Image must be smaller than 5MB')
      return
    }

    if (!questionId) {
      // For new questions, just create a preview URL
      const url = URL.createObjectURL(file)
      onExamplePhotoChange({
        url,
        path: '',
        instructions: examplePhoto?.instructions || ''
      })
      return
    }

    setUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('questionId', questionId)
      formData.append('uploadType', 'example-photo')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      
      if (!response.ok) {
        toast.error('Failed to upload example photo: ' + result.error)
        return
      }

      if (result.success && result.data) {
        onExamplePhotoChange({
          url: result.data.publicUrl,
          path: result.data.path,
          instructions: examplePhoto?.instructions || ''
        })
        toast.success('Example photo uploaded successfully')
      }
    } catch (error) {
      toast.error('Failed to upload example photo')
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
      // Reset file input
      if (e.target) {
        e.target.value = ''
      }
    }
  }

  const handleRemovePhoto = async () => {
    if (examplePhoto?.path && questionId) {
      try {
        const response = await fetch(`/api/upload?path=${encodeURIComponent(examplePhoto.path)}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) {
          console.error('Failed to delete file from storage')
        }
      } catch (error) {
        console.error('Failed to delete file:', error)
      }
    }

    // If it's a blob URL, revoke it
    if (examplePhoto?.url && examplePhoto.url.startsWith('blob:')) {
      URL.revokeObjectURL(examplePhoto.url)
    }

    onExamplePhotoChange(null)
    toast.success('Example photo removed')
  }

  const handleInstructionsChange = (instructions: string) => {
    if (examplePhoto) {
      onExamplePhotoChange({
        ...examplePhoto,
        instructions
      })
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          {title}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!examplePhoto ? (
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
              "border-gray-300 hover:border-gray-400"
            )}
          >
            <div className="space-y-4">
              <div className="flex justify-center">
                <Upload className="h-8 w-8 text-gray-400" />
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Upload Example Photo
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  JPG, PNG, or WebP up to 5MB
                </p>
              </div>
              
              <Button
                type="button"
                variant="outline"
                onClick={openFileDialog}
                disabled={uploading}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>{uploading ? 'Uploading...' : 'Browse Files'}</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Photo Preview */}
            <div className="relative group">
              <img
                src={examplePhoto.url}
                alt="Example photo"
                className="w-full h-48 object-cover rounded-lg border"
              />
              
              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setPreviewOpen(true)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleRemovePhoto}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <Label htmlFor="example-instructions">Photo Instructions</Label>
              <Textarea
                id="example-instructions"
                placeholder="Optional instructions to help users understand what this photo should show..."
                rows={3}
                value={examplePhoto.instructions || ''}
                onChange={(e) => handleInstructionsChange(e.target.value)}
              />
            </div>

            {/* Replace Photo Button */}
            <Button
              type="button"
              variant="outline"
              onClick={openFileDialog}
              disabled={uploading}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Replace Photo'}
            </Button>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Usage Note */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Usage Tip</p>
            <p>This example photo will be shown to users as a reference when they upload their own photos. Make sure it clearly demonstrates the desired angle, lighting, and positioning.</p>
          </div>
        </div>

        {/* Preview Modal */}
        {previewOpen && examplePhoto && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
            <div className="relative max-w-4xl max-h-full">
              <img
                src={examplePhoto.url}
                alt="Example photo preview"
                className="max-w-full max-h-full object-contain rounded"
              />
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPreviewOpen(false)}
                className="absolute top-4 right-4"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 