'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Star, Edit, MessageSquare, CheckCircle, XCircle } from 'lucide-react'
import { PatientReview } from '@/types/database'
import { toast } from 'sonner'

export default function PatientReviewViewPage() {
  const params = useParams()
  const [review, setReview] = useState<PatientReview | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchReview = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/patient-reviews/${params.id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch review')
      }

      setReview(data)
    } catch (error) {
      console.error('Error fetching review:', error)
      toast.error('Failed to load review')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    if (params.id) {
      fetchReview()
    }
  }, [params.id, fetchReview])

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-lg font-medium">({rating}/5)</span>
      </div>
    )
  }

  if (loading) {
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

  if (!review) {
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
          <h1 className="text-2xl font-bold">Review Not Found</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/admin/patient-reviews">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <MessageSquare className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Patient Review</h1>
        </div>
        <Link href={`/admin/patient-reviews/${review.id}/edit`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Review
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Review Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Review Details</span>
                {renderStars(review.rating)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Patient Review</h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {review.review_text}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Treatment Information */}
          {review.treatments && (
            <Card>
              <CardHeader>
                <CardTitle>Treatment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">Treatment</h4>
                    <Badge variant="outline" className="mt-1">
                      {review.treatments.name}
                    </Badge>
                  </div>
                  {review.treatments.description && (
                    <div>
                      <h4 className="font-medium text-gray-900">Description</h4>
                      <p className="text-gray-600 text-sm mt-1">
                        {review.treatments.description}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Name</h4>
                <p className="text-gray-600">{review.patient_name}</p>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium text-gray-900">Country</h4>
                <Badge variant="outline" className="mt-1">
                  {review.patient_country}
                </Badge>
              </div>

              {review.patient_photo_url && (
                <>
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Patient Photo</h4>
                    <Image
                      src={review.patient_photo_url}
                      alt={`Photo of ${review.patient_name}`}
                      width={128}
                      height={128}
                      className="object-cover rounded-lg border"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Review Status */}
          <Card>
            <CardHeader>
              <CardTitle>Review Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Active Status</span>
                <div className="flex items-center space-x-2">
                  {review.is_active ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <Badge variant={review.is_active ? 'default' : 'secondary'}>
                    {review.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Verification</span>
                <div className="flex items-center space-x-2">
                  {review.is_verified ? (
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-600" />
                  )}
                  <Badge variant={review.is_verified ? 'default' : 'outline'}>
                    {review.is_verified ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle>Timestamps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Created</h4>
                <p className="text-gray-600 text-sm">
                  {new Date(review.created_at).toLocaleString()}
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium text-gray-900">Last Updated</h4>
                <p className="text-gray-600 text-sm">
                  {new Date(review.updated_at).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 