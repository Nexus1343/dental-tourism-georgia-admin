'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

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
  ImageIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { BeforeAfterCase, BeforeAfterCaseFilters, CaseDisplayStatus } from '@/types/database'
import { toast } from 'sonner'

const STATUS_OPTIONS: { value: CaseDisplayStatus; label: string; color: string }[] = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
  { value: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800' },
  { value: 'hidden', label: 'Hidden', color: 'bg-red-100 text-red-800' },
]

export default function BeforeAfterCasesPage() {
  const [cases, setCases] = useState<BeforeAfterCase[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<BeforeAfterCaseFilters>({
    page: 1,
    limit: 10,
    search: '',
    status: undefined,
    treatment_name: '',
    sortBy: 'display_order',
    sortOrder: 'asc'
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  const fetchCases = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString())
        }
      })

      const response = await fetch(`/api/admin/before-after-cases?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch cases')
      }

      setCases(data.cases)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching cases:', error)
      toast.error('Failed to load cases')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCase = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/before-after-cases/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete case')
      }

      toast.success('Case deleted successfully')
      fetchCases()
    } catch (error) {
      console.error('Error deleting case:', error)
      toast.error('Failed to delete case')
    }
  }

  const handleStatusChange = async (id: string, status: CaseDisplayStatus) => {
    try {
      const response = await fetch(`/api/admin/before-after-cases/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update status')
      }

      toast.success('Status updated successfully')
      fetchCases()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const updateFilters = (newFilters: Partial<BeforeAfterCaseFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  const handleSort = (field: string) => {
    const sortOrder = filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc'
    setFilters(prev => ({ ...prev, sortBy: field, sortOrder, page: 1 }))
  }

  const getStatusBadge = (status: CaseDisplayStatus) => {
    const statusOption = STATUS_OPTIONS.find(opt => opt.value === status)
    return statusOption ? statusOption : STATUS_OPTIONS[1] // default to inactive
  }

  useEffect(() => {
    fetchCases()
  }, [filters])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ImageIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Before & After Cases</h1>
        </div>
        <Link href="/admin/before-after-cases/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Case
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
                  placeholder="Search cases..."
                  value={filters.search || ''}
                  onChange={(e) => updateFilters({ search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => updateFilters({ status: value === 'all' ? undefined : value as CaseDisplayStatus })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {STATUS_OPTIONS.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Treatment</label>
              <Input
                placeholder="Filter by treatment..."
                value={filters.treatment_name || ''}
                onChange={(e) => updateFilters({ treatment_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onValueChange={(value) => {
                  const [sortBy, sortOrder] = value.split('-')
                  updateFilters({ sortBy, sortOrder: sortOrder as 'asc' | 'desc' })
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="display_order-asc">Display Order (ASC)</SelectItem>
                  <SelectItem value="display_order-desc">Display Order (DESC)</SelectItem>
                  <SelectItem value="created_at-desc">Newest First</SelectItem>
                  <SelectItem value="created_at-asc">Oldest First</SelectItem>
                  <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                  <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cases Grid */}
      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">Loading cases...</div>
          </CardContent>
        </Card>
      ) : cases.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="text-muted-foreground">
                No cases found. 
              </div>
              <Link href="/admin/before-after-cases/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first case
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((case_) => {
            const statusBadge = getStatusBadge(case_.status)
            return (
              <Card key={case_.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  {/* Before/After Images */}
                  <div className="grid grid-cols-2 h-48">
                    {/* Before Image */}
                    <div className="relative bg-muted border-r">
                      {case_.before_image_url ? (
                        <Image
                          src={case_.before_image_url}
                          alt="Before"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center space-y-2">
                            <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">No before image</p>
                          </div>
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="text-xs">Before</Badge>
                      </div>
                    </div>
                    
                    {/* After Image */}
                    <div className="relative bg-muted">
                      {case_.after_image_url ? (
                        <Image
                          src={case_.after_image_url}
                          alt="After"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center space-y-2">
                            <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">No after image</p>
                          </div>
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="text-xs">After</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-3">
                    {/* Header with Status and Order */}
                    <div className="flex items-center justify-between">
                      <Badge className={statusBadge.color}>
                        {statusBadge.label}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        Order: {case_.display_order}
                      </div>
                    </div>

                    {/* Title and Treatment */}
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg leading-tight">
                        {case_.title}
                      </h3>
                      <p className="text-sm text-primary font-medium">
                        {case_.treatment_name}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {case_.treatment_description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="text-xs text-muted-foreground">
                        {new Date(case_.created_at).toLocaleDateString()}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-8 w-8 p-0"
                        >
                          <Link href={`/admin/before-after-cases/${case_.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-8 w-8 p-0"
                        >
                          <Link href={`/admin/before-after-cases/${case_.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {STATUS_OPTIONS.map(status => (
                              <DropdownMenuItem
                                key={status.value}
                                onClick={() => handleStatusChange(case_.id, status.value)}
                                disabled={case_.status === status.value}
                              >
                                Mark as {status.label}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuItem
                              onClick={() => handleDeleteCase(case_.id, case_.title)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && cases.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} cases
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
              disabled={!pagination.hasPrevPage}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
              disabled={!pagination.hasNextPage}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 