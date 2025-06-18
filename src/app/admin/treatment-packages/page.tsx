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
  Package,

  Calendar,
  MapPin,
  Car,
  Plane
} from 'lucide-react'
import { TreatmentPackage, TreatmentPackageFilters } from '@/types/database'
import { toast } from 'sonner'

export default function TreatmentPackagesPage() {
  const [packages, setPackages] = useState<TreatmentPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<TreatmentPackageFilters>({
    page: 1,
    limit: 10,
    search: '',
    status: undefined,
    includes_accommodation: undefined,
    includes_transportation: undefined,
    includes_tourism: undefined,
    min_price: undefined,
    max_price: undefined,
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

  const fetchPackages = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString())
        }
      })

      const response = await fetch(`/api/admin/treatment-packages?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch treatment packages')
      }

      setPackages(data.packages)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching treatment packages:', error)
      toast.error('Failed to load treatment packages')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePackage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this treatment package?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/treatment-packages/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete treatment package')
      }

      toast.success('Treatment package deleted successfully')
      fetchPackages()
    } catch (error) {
      console.error('Error deleting treatment package:', error)
      toast.error('Failed to delete treatment package')
    }
  }

  const updateFilters = (newFilters: Partial<TreatmentPackageFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  const calculateFinalPrice = (basePrice: number, discountPercentage?: number) => {
    const discount = discountPercentage || 0
    return basePrice * (1 - discount / 100)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  useEffect(() => {
    fetchPackages()
  }, [filters])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Treatment Packages</h1>
        </div>
        <Link href="/admin/treatment-packages/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Package
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
                  placeholder="Search packages..."
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
              <label className="text-sm font-medium">Min Price</label>
              <Input
                type="number"
                placeholder="$0"
                value={filters.min_price || ''}
                onChange={(e) => updateFilters({ min_price: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Max Price</label>
              <Input
                type="number"
                placeholder="$999,999"
                value={filters.max_price || ''}
                onChange={(e) => updateFilters({ max_price: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Includes Accommodation</label>
              <Select
                value={filters.includes_accommodation?.toString() || 'all'}
                onValueChange={(value) => updateFilters({ includes_accommodation: value === 'all' ? undefined : value === 'true' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Includes Transportation</label>
              <Select
                value={filters.includes_transportation?.toString() || 'all'}
                onValueChange={(value) => updateFilters({ includes_transportation: value === 'all' ? undefined : value === 'true' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Includes Tourism</label>
              <Select
                value={filters.includes_tourism?.toString() || 'all'}
                onValueChange={(value) => updateFilters({ includes_tourism: value === 'all' ? undefined : value === 'true' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package Name</TableHead>
                    <TableHead>Treatments</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Includes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No treatment packages found
                      </TableCell>
                    </TableRow>
                  ) : (
                    packages.map((pkg) => {
                      const finalPrice = calculateFinalPrice(pkg.total_base_price, pkg.discount_percentage)
                      const hasDiscount = pkg.discount_percentage && pkg.discount_percentage > 0

                      return (
                        <TableRow key={pkg.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{pkg.name}</div>
                              {pkg.description && (
                                <div className="text-sm text-muted-foreground line-clamp-1">
                                  {pkg.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {pkg.treatment_ids.length} treatment{pkg.treatment_ids.length !== 1 ? 's' : ''}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                {hasDiscount && (
                                  <span className="text-sm text-muted-foreground line-through">
                                    {formatPrice(pkg.total_base_price)}
                                  </span>
                                )}
                                <span className="font-medium">
                                  {formatPrice(finalPrice)}
                                </span>
                              </div>
                              {hasDiscount && (
                                <Badge variant="destructive" className="text-xs">
                                  {pkg.discount_percentage}% OFF
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {pkg.min_duration_days || pkg.max_duration_days ? (
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {pkg.min_duration_days === pkg.max_duration_days
                                    ? `${pkg.min_duration_days} days`
                                    : `${pkg.min_duration_days || '?'}-${pkg.max_duration_days || '?'} days`
                                  }
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {pkg.includes_accommodation && (
                                <Badge variant="outline" className="text-xs">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  Hotel
                                </Badge>
                              )}
                              {pkg.includes_transportation && (
                                <Badge variant="outline" className="text-xs">
                                  <Car className="h-3 w-3 mr-1" />
                                  Transport
                                </Badge>
                              )}
                              {pkg.includes_tourism && (
                                <Badge variant="outline" className="text-xs">
                                  <Plane className="h-3 w-3 mr-1" />
                                  Tourism
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={pkg.is_active ? 'default' : 'secondary'}>
                              {pkg.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/treatment-packages/${pkg.id}`}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/treatment-packages/${pkg.id}/edit`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeletePackage(pkg.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} packages
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
          )}
        </CardContent>
      </Card>
    </div>
  )
} 