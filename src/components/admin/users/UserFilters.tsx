'use client'

import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import type { UserFilters as UserFiltersType } from '@/types/database'

interface UserFiltersProps {
  filters: UserFiltersType
  onFiltersChange: (filters: Partial<UserFiltersType>) => void
}

export function UserFilters({ filters, onFiltersChange }: UserFiltersProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={filters.search || ''}
                onChange={(e) => onFiltersChange({ search: e.target.value || undefined })}
                className="pl-10"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="w-full sm:w-48">
            <Select
              value={filters.role || 'all'}
              onValueChange={(value) => onFiltersChange({ role: value === 'all' ? undefined : value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="clinic_admin">Clinic Admin</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="marketing_team">Marketing Team</SelectItem>
                <SelectItem value="operations_team">Operations Team</SelectItem>
                <SelectItem value="patient">Patient</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-48">
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => onFiltersChange({ status: value === 'all' ? undefined : value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 