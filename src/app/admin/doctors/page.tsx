'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, MoreHorizontal, Edit, Eye, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'

interface Doctor {
  id: string
  title: string
  specializations: string[]
  status: 'active' | 'inactive' | 'on_leave' | 'suspended'
  license_number: string | null
  years_of_experience: number | null
  consultation_fee: number | null
  profile_image_url: string | null
  created_at: string
  updated_at: string
  users: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string
    phone: string | null
  } | null
  clinics: {
    id: string
    name: string
    city: string | null
    country: string | null
  } | null
}

interface DoctorsResponse {
  doctors: Doctor[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter })
      })

      const response = await fetch(`/api/admin/doctors?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch doctors')
      }

      const data: DoctorsResponse = await response.json()
      setDoctors(data.doctors)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => {
    fetchDoctors()
  }, [fetchDoctors])

  const handleDelete = async (doctorId: string) => {
    if (!confirm('Are you sure you want to delete this doctor?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/doctors/${doctorId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete doctor')
      }

      // Refresh the list
      fetchDoctors()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete doctor')
    }
  }

  const getStatusBadge = (status: Doctor['status']) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      on_leave: 'outline',
      suspended: 'destructive'
    } as const

    const labels = {
      active: 'Active',
      inactive: 'Inactive',
      on_leave: 'On Leave',
      suspended: 'Suspended'
    }

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    )
  }

  const getDoctorName = (doctor: Doctor) => {
    if (!doctor.users) return 'N/A'
    const { first_name, last_name } = doctor.users
    return [first_name, last_name].filter(Boolean).join(' ') || doctor.users.email
  }

  const getDoctorInitials = (doctor: Doctor) => {
    if (!doctor.users) return 'NA'
    const { first_name, last_name } = doctor.users
    return `${first_name?.[0] || ''}${last_name?.[0] || ''}`.toUpperCase() || doctor.users.email[0].toUpperCase()
  }

  const getSpecializationLabel = (value: string) => {
    const specializationLabels: Record<string, string> = {
      'general_dentist': 'General Dentistry',
      'orthodontist': 'Orthodontics',
      'oral_surgeon': 'Oral Surgery',
      'endodontist': 'Endodontics',
      'periodontist': 'Periodontics',
      'prosthodontist': 'Prosthodontics',
      'pediatric_dentist': 'Pediatric Dentistry',
      'oral_pathologist': 'Oral Pathology',
      'implantologist': 'Dental Implants',
      'cosmetic_dentist': 'Cosmetic Dentistry'
    }
    return specializationLabels[value] || value
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Doctors</h1>
          <p className="text-muted-foreground">
            Manage doctors and their profiles in the platform
          </p>
        </div>
        <Link href="/admin/doctors/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Doctor
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Search and filter doctors by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search doctors..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Doctors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Doctors ({pagination.total})</CardTitle>
          <CardDescription>
            A list of all doctors in the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 h-32 flex items-center justify-center">
              {error}
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center text-muted-foreground h-32 flex items-center justify-center">
              No doctors found. 
              <Link href="/admin/doctors/create" className="ml-2 text-primary hover:underline">
                Add the first doctor
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Specializations</TableHead>
                  <TableHead>Clinic</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={doctor.profile_image_url || undefined} />
                          <AvatarFallback>{getDoctorInitials(doctor)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {doctor.title} {getDoctorName(doctor)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {doctor.users?.email}
                          </div>
                          {doctor.license_number && (
                            <div className="text-xs text-muted-foreground">
                              License: {doctor.license_number}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {doctor.specializations.slice(0, 2).map((spec, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {getSpecializationLabel(spec)}
                          </Badge>
                        ))}
                        {doctor.specializations.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{doctor.specializations.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {doctor.clinics ? (
                        <div>
                          <div className="font-medium">{doctor.clinics.name}</div>
                          {doctor.clinics.city && doctor.clinics.country && (
                            <div className="text-sm text-muted-foreground">
                              {doctor.clinics.city}, {doctor.clinics.country}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(doctor.status)}
                    </TableCell>
                    <TableCell>
                      {doctor.years_of_experience ? (
                        `${doctor.years_of_experience} years`
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {doctor.consultation_fee ? (
                        `$${doctor.consultation_fee}`
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/doctors/${doctor.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/doctors/${doctor.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(doctor.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {!loading && !error && doctors.length > 0 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} doctors
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.hasPrevPage}
                >
                  Previous
                </Button>
                <div className="text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 