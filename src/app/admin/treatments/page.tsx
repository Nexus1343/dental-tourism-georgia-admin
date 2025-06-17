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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  Filter,
  Stethoscope
} from 'lucide-react'
import { Treatment, TreatmentCategory, TreatmentFilters } from '@/types/database'
import { toast } from 'sonner'

const TREATMENT_CATEGORIES: { value: TreatmentCategory; label: string }[] = [
  { value: 'preventive', label: 'Preventive' },
  { value: 'restorative', label: 'Restorative' },
  { value: 'cosmetic', label: 'Cosmetic' },
  { value: 'orthodontic', label: 'Orthodontic' },
  { value: 'surgical', label: 'Surgical' },
  { value: 'periodontal', label: 'Periodontal' },
  { value: 'endodontic', label: 'Endodontic' },
  { value: 'prosthodontic', label: 'Prosthodontic' },
  { value: 'pediatric', label: 'Pediatric' },
  { value: 'emergency', label: 'Emergency' },
]

export default function TreatmentsPage() {
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<TreatmentFilters>({
    page: 1,
    limit: 10,
    search: '',
    category: undefined,
    status: undefined,
    sort_by: 'created_at',
    sort_order: 'desc'
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  const fetchTreatments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString())
        }
      })

      const response = await fetch(`/api/admin/treatments?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch treatments')
      }

      setTreatments(data.treatments)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching treatments:', error)
      toast.error('Failed to load treatments')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTreatment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this treatment?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/treatments/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete treatment')
      }

      toast.success('Treatment deleted successfully')
      fetchTreatments()
    } catch (error) {
      console.error('Error deleting treatment:', error)
      toast.error('Failed to delete treatment')
    }
  }

  const updateFilters = (newFilters: Partial<TreatmentFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  const getCategoryBadgeColor = (category: TreatmentCategory) => {
    const colors = {
      preventive: 'bg-green-100 text-green-800',
      restorative: 'bg-blue-100 text-blue-800',
      cosmetic: 'bg-purple-100 text-purple-800',
      orthodontic: 'bg-indigo-100 text-indigo-800',
      surgical: 'bg-red-100 text-red-800',
      periodontal: 'bg-orange-100 text-orange-800',
      endodontic: 'bg-yellow-100 text-yellow-800',
      prosthodontic: 'bg-teal-100 text-teal-800',
      pediatric: 'bg-pink-100 text-pink-800',
      emergency: 'bg-red-100 text-red-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  useEffect(() => {
    fetchTreatments()
  }, [filters])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Stethoscope className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Treatments</h1>
        </div>
        <Link href="/admin/treatments/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Treatment
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search treatments..."
                  value={filters.search || ''}
                  onChange={(e) => updateFilters({ search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={filters.category || 'all'}
                onValueChange={(value) => updateFilters({ category: value === 'all' ? undefined : value as TreatmentCategory })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {TREATMENT_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => updateFilters({ status: value === 'all' ? undefined : value as 'active' | 'inactive' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select
                value={`${filters.sort_by}-${filters.sort_order}`}
                onValueChange={(value) => {
                  const [sort_by, sort_order] = value.split('-')
                  updateFilters({ sort_by, sort_order: sort_order as 'asc' | 'desc' })
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="category-asc">Category (A-Z)</SelectItem>
                  <SelectItem value="category-desc">Category (Z-A)</SelectItem>
                  <SelectItem value="created_at-desc">Newest First</SelectItem>
                  <SelectItem value="created_at-asc">Oldest First</SelectItem>
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
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Recovery Time</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading treatments...
                  </TableCell>
                </TableRow>
              ) : treatments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No treatments found
                  </TableCell>
                </TableRow>
              ) : (
                treatments.map((treatment) => (
                  <TableRow key={treatment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{treatment.name}</div>
                        <div className="text-sm text-muted-foreground">{treatment.slug}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryBadgeColor(treatment.category)}>
                        {TREATMENT_CATEGORIES.find(c => c.value === treatment.category)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={treatment.is_active ? 'default' : 'secondary'}>
                        {treatment.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {treatment.base_price ? 
                        `${treatment.base_price} ${treatment.currency || 'USD'}` : 
                        '-'
                      }
                    </TableCell>
                    <TableCell>
                      {treatment.duration_minutes ? `${treatment.duration_minutes} min` : '-'}
                    </TableCell>
                    <TableCell>
                      {treatment.recovery_time_days ? `${treatment.recovery_time_days} days` : '-'}
                    </TableCell>
                    <TableCell>
                      {new Date(treatment.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/admin/treatments/${treatment.id}`}>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                          </Link>
                          <Link href={`/admin/treatments/${treatment.id}/edit`}>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem
                            onClick={() => handleDeleteTreatment(treatment.id)}
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
            {pagination.total} treatments
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrevPage}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNextPage}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 