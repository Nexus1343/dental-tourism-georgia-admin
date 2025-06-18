'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  Filter,
  Star,
  MessageSquare,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { PatientReview, PatientReviewFilters } from '@/types/database'
import { toast } from 'sonner'

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 
  'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Switzerland',
  'Israel', 'UAE', 'Saudi Arabia', 'Other'
]

export default function PatientReviewsPage() {
  const [reviews, setReviews] = useState<PatientReview[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [reviewToDelete, setReviewToDelete] = useState<PatientReview | null>(null)
  const [filters, setFilters] = useState<PatientReviewFilters>({
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString())
        }
      })

      const response = await fetch(`/api/admin/patient-reviews?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reviews')
      }

      setReviews(data.data)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (review: PatientReview) => {
    setReviewToDelete(review)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return

    setDeleteLoading(true)
    try {
      const response = await fetch(`/api/admin/patient-reviews/${reviewToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete review')
      }

      toast.success('Review deleted successfully')
      setShowDeleteDialog(false)
      setReviewToDelete(null)
      fetchReviews()
    } catch (error) {
      console.error('Error deleting review:', error)
      toast.error('Failed to delete review')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false)
    setReviewToDelete(null)
  }

  const toggleReviewStatus = async (id: string, field: 'is_active' | 'is_verified', value: boolean) => {
    try {
      const review = reviews.find(r => r.id === id)
      if (!review) return

      const response = await fetch(`/api/admin/patient-reviews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...review,
          [field]: value
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update review')
      }

      toast.success(`Review ${field === 'is_active' ? 'status' : 'verification'} updated`)
      fetchReviews()
    } catch (error) {
      console.error('Error updating review:', error)
      toast.error('Failed to update review')
    }
  }

  const updateFilters = (newFilters: Partial<PatientReviewFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">({rating})</span>
      </div>
    )
  }

  useEffect(() => {
    fetchReviews()
  }, [filters])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Patient Reviews</h1>
        </div>
        <Link href="/admin/patient-reviews/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Review
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reviews..."
                  value={filters.search || ''}
                  onChange={(e) => updateFilters({ search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Country</label>
              <Select
                value={filters.country || 'all'}
                onValueChange={(value) => updateFilters({ country: value === 'all' ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <Select
                value={filters.rating?.toString() || 'all'}
                onValueChange={(value) => updateFilters({ rating: value === 'all' ? undefined : parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <SelectItem key={rating} value={rating.toString()}>
                      {rating} Star{rating !== 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Treatment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading reviews...
                  </TableCell>
                </TableRow>
              ) : reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No reviews found
                  </TableCell>
                </TableRow>
              ) : (
                reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {review.patient_photo_url ? (
                          <img
                            src={review.patient_photo_url}
                            alt={review.patient_name}
                            className="w-10 h-10 rounded-full object-cover border"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-sm font-medium">
                              {review.patient_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="font-medium">{review.patient_name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{review.patient_country}</Badge>
                    </TableCell>
                    <TableCell>
                      {renderStars(review.rating)}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">{review.review_text}</div>
                    </TableCell>
                    <TableCell>
                      {review.treatments ? (
                        <Badge variant="outline">{review.treatments.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground">General</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={review.is_active ? 'default' : 'secondary'}>
                        {review.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(review.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/admin/patient-reviews/${review.id}`}>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                          </Link>
                          <Link href={`/admin/patient-reviews/${review.id}/edit`}>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(review)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} reviews
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {reviewToDelete && (
            <div className="mt-2 p-3 bg-gray-50 rounded-md">
              <div className="text-sm font-medium text-gray-900">
                {reviewToDelete.patient_name} from {reviewToDelete.patient_country}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                &quot;{reviewToDelete.review_text.length > 100 
                  ? reviewToDelete.review_text.substring(0, 100) + '...' 
                  : reviewToDelete.review_text}&quot;
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Delete Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 