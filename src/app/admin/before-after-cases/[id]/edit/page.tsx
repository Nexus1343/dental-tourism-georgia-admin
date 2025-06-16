'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { ArrowLeft, Upload, ImageIcon } from 'lucide-react'
import { BeforeAfterCase, UpdateBeforeAfterCase, CaseDisplayStatus } from '@/types/database'
import { toast } from 'sonner'

const STATUS_OPTIONS: { value: CaseDisplayStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'hidden', label: 'Hidden' },
]

interface EditCasePageProps {
  params: Promise<{ id: string }>
}

export default function EditBeforeAfterCasePage({ params }: EditCasePageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [originalCase, setOriginalCase] = useState<BeforeAfterCase | null>(null)
  const [formData, setFormData] = useState<UpdateBeforeAfterCase>({
    title: '',
    treatment_name: '',
    treatment_description: '',
    before_image_url: '',
    after_image_url: '',
    status: 'active',
    display_order: undefined
  })

  useEffect(() => {
    fetchCase()
  }, [resolvedParams.id])

  const fetchCase = async () => {
    try {
      const response = await fetch(`/api/admin/before-after-cases/${resolvedParams.id}`)
      if (!response.ok) {
        throw new Error('Case not found')
      }
      
      const case_ = await response.json()
      setOriginalCase(case_)
      setFormData({
        title: case_.title,
        treatment_name: case_.treatment_name,
        treatment_description: case_.treatment_description,
        before_image_url: case_.before_image_url,
        after_image_url: case_.after_image_url,
        status: case_.status,
        display_order: case_.display_order
      })
    } catch (error) {
      console.error('Error fetching case:', error)
      toast.error('Failed to load case')
      router.push('/admin/before-after-cases')
    } finally {
      setFetchLoading(false)
    }
  }

  const handleInputChange = (field: keyof UpdateBeforeAfterCase, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageUpload = async (file: File, type: 'before' | 'after') => {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error(`${file.name} is not an image file`)
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error(`${file.name} is too large. Maximum size is 5MB`)
      }

      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('path', `before-after-cases/${type}-${Date.now()}-${file.name}`)
      uploadFormData.append('uploadType', 'before-after-image')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to upload ${type} image`)
      }

      const result = await response.json()
      const imageUrl = result.data.publicUrl || result.data.path
      
      if (type === 'before') {
        handleInputChange('before_image_url', imageUrl)
      } else {
        handleInputChange('after_image_url', imageUrl)
      }
      
      toast.success(`${type} image uploaded successfully`)
    } catch (error) {
      console.error(`Error uploading ${type} image:`, error)
      toast.error(error instanceof Error ? error.message : `Failed to upload ${type} image`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.title || !formData.treatment_name || !formData.treatment_description || 
        !formData.before_image_url || !formData.after_image_url) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/before-after-cases/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update case')
      }

      toast.success('Case updated successfully')
      router.push('/admin/before-after-cases')
    } catch (error) {
      console.error('Error updating case:', error)
      toast.error('Failed to update case')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          Loading case...
        </div>
      </div>
    )
  }

  if (!originalCase) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          Case not found
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Before & After Cases', href: '/admin/before-after-cases' },
          { label: originalCase.title, href: `/admin/before-after-cases/${resolvedParams.id}` },
          { label: 'Edit' }
        ]}
      />

      {/* Header */}
      <div className="flex items-center space-x-3">
        <Link href="/admin/before-after-cases">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cases
          </Button>
        </Link>
        <div className="flex items-center space-x-3">
          <ImageIcon className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Edit Case</h1>
            <p className="text-muted-foreground">Update "{originalCase.title}"</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Case Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter case title..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatment_name">Treatment Name *</Label>
                <Input
                  id="treatment_name"
                  value={formData.treatment_name}
                  onChange={(e) => handleInputChange('treatment_name', e.target.value)}
                  placeholder="e.g., Dental Implants, Teeth Whitening..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatment_description">Treatment Description *</Label>
                <Textarea
                  id="treatment_description"
                  value={formData.treatment_description}
                  onChange={(e) => handleInputChange('treatment_description', e.target.value)}
                  placeholder="Describe the treatment, procedure, and results..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order || ''}
                  onChange={(e) => handleInputChange('display_order', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Enter display order"
                  min="0"
                />
                <p className="text-sm text-muted-foreground">
                  Lower numbers appear first.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: CaseDisplayStatus) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Created: {new Date(originalCase.created_at).toLocaleString()}</p>
                  <p>Updated: {new Date(originalCase.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Image Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Before Image */}
          <Card>
            <CardHeader>
              <CardTitle>Before Image *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  {formData.before_image_url ? (
                    <div className="space-y-2">
                      <div className="relative w-48 h-48 mx-auto">
                        <Image
                          src={formData.before_image_url}
                          alt="Before"
                          fill
                          className="object-cover rounded"
                          sizes="192px"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">Before image</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click below to upload before image</p>
                      <p className="text-xs text-muted-foreground">JPG, PNG, GIF, WebP (max 5MB)</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file, 'before')
                  }}
                  className="hidden"
                  id="before-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('before-upload')?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New Before Image
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* After Image */}
          <Card>
            <CardHeader>
              <CardTitle>After Image *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  {formData.after_image_url ? (
                    <div className="space-y-2">
                      <div className="relative w-48 h-48 mx-auto">
                        <Image
                          src={formData.after_image_url}
                          alt="After"
                          fill
                          className="object-cover rounded"
                          sizes="192px"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">After image</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click below to upload after image</p>
                      <p className="text-xs text-muted-foreground">JPG, PNG, GIF, WebP (max 5MB)</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file, 'after')
                  }}
                  className="hidden"
                  id="after-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('after-upload')?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New After Image
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Link href="/admin/before-after-cases">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Case'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
} 