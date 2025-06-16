'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Star, ArrowLeft, MessageSquare } from 'lucide-react'
import { Treatment, PatientReview, UpdatePatientReview } from '@/types/database'
import { toast } from 'sonner'
import Link from 'next/link'
import { PatientPhotoUpload } from '@/components/PatientPhotoUpload'

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 
  'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Switzerland',
  'Israel', 'UAE', 'Saudi Arabia', 'Other'
]

export default function EditPatientReviewPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [formData, setFormData] = useState<UpdatePatientReview>({
    patient_name: '',
    patient_country: '',
    review_text: '',
    rating: 5,
    is_verified: false,
    is_active: true
  })

  useEffect(() => {
    if (params.id) {
      fetchReview()
      fetchTreatments()
    }
  }, [params.id])

  const fetchReview = async () => {
    try {
      const response = await fetch(`/api/admin/patient-reviews/${params.id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch review')
      }

      setFormData({
        patient_name: data.patient_name,
        patient_country: data.patient_country,
        review_text: data.review_text,
        treatment_id: data.treatment_id,
        rating: data.rating,
        is_verified: data.is_verified,
        is_active: data.is_active,
        patient_photo_url: data.patient_photo_url
      })
    } catch (error) {
      console.error('Error fetching review:', error)
      toast.error('Failed to load review')
    } finally {
      setInitialLoading(false)
    }
  }

  const fetchTreatments = async () => {
    try {
      const response = await fetch('/api/admin/treatments?limit=100')
      const data = await response.json()
      
      if (response.ok) {
        setTreatments(data.treatments || [])
      }
    } catch (error) {
      console.error('Error fetching treatments:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/patient-reviews/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update review')
      }

      toast.success('Review updated successfully')
      router.push('/admin/patient-reviews')
    } catch (error) {
      console.error('Error updating review:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update review')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof UpdatePatientReview, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const renderStarRating = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleInputChange('rating', star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 ${
                star <= (formData.rating || 0)
                  ? 'text-yellow-400 fill-yellow-400' 
                  : 'text-gray-300 hover:text-yellow-400'
              } transition-colors`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          ({formData.rating || 0} star{formData.rating !== 1 ? 's' : ''})
        </span>
      </div>
    )
  }

  if (initialLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Link href="/admin/patient-reviews">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <MessageSquare className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Link href="/admin/patient-reviews">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <MessageSquare className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Edit Patient Review</h1>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Review Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Patient Name */}
              <div className="space-y-2">
                <Label htmlFor="patient_name">Patient Name *</Label>
                <Input
                  id="patient_name"
                  value={formData.patient_name || ''}
                  onChange={(e) => handleInputChange('patient_name', e.target.value)}
                  placeholder="Enter patient name"
                  required
                />
              </div>

              {/* Patient Country */}
              <div className="space-y-2">
                <Label htmlFor="patient_country">Country *</Label>
                <Select
                  value={formData.patient_country || ''}
                  onValueChange={(value) => handleInputChange('patient_country', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Treatment */}
            <div className="space-y-2">
              <Label htmlFor="treatment_id">Treatment (Optional)</Label>
              <Select
                value={formData.treatment_id || 'none'}
                onValueChange={(value) => handleInputChange('treatment_id', value === 'none' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select treatment (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">General Review (No specific treatment)</SelectItem>
                  {treatments.map((treatment) => (
                    <SelectItem key={treatment.id} value={treatment.id}>
                      {treatment.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label>Rating *</Label>
              {renderStarRating()}
            </div>

            {/* Review Text */}
            <div className="space-y-2">
              <Label htmlFor="review_text">Review Text *</Label>
              <Textarea
                id="review_text"
                value={formData.review_text || ''}
                onChange={(e) => handleInputChange('review_text', e.target.value)}
                placeholder="Enter the patient's review..."
                rows={5}
                required
              />
              <p className="text-sm text-muted-foreground">
                {(formData.review_text || '').length} characters
              </p>
            </div>

            {/* Patient Photo */}
            <div className="space-y-2">
              <Label>Patient Photo (Optional)</Label>
              <PatientPhotoUpload
                value={formData.patient_photo_url}
                onChange={(url) => handleInputChange('patient_photo_url', url)}
                disabled={loading}
              />
            </div>

            {/* Status Checkboxes */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_verified"
                  checked={formData.is_verified || false}
                  onCheckedChange={(checked) => handleInputChange('is_verified', checked)}
                />
                <Label htmlFor="is_verified">Verified Review</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active || false}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Link href="/admin/patient-reviews">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Review'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 