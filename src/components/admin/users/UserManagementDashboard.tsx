'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserList } from './UserList'
import { CreateUserDialog } from './CreateUserDialog'
import { UserFilters } from './UserFilters'
import type { User, UserFilters as UserFiltersType, PaginatedResponse } from '@/types/database'

export function UserManagementDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0
  })
  const [filters, setFilters] = useState<UserFiltersType>({
    page: 1,
    pageSize: 20
  })
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      if (filters.role) queryParams.append('role', filters.role)
      if (filters.status) queryParams.append('status', filters.status)
      if (filters.search) queryParams.append('search', filters.search)
      queryParams.append('page', filters.page?.toString() || '1')
      queryParams.append('pageSize', filters.pageSize?.toString() || '20')

      const response = await fetch(`/api/admin/users?${queryParams}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const result: PaginatedResponse<User> = await response.json()
      
      setUsers(result.data)
      setPagination({
        page: result.page,
        pageSize: result.limit,
        totalCount: result.count,
        totalPages: result.totalPages
      })
    } catch (error) {
      console.error('Error fetching users:', error)
      // TODO: Show error toast
    } finally {
      setLoading(false)
    }
  }

  // Load users on component mount and when filters change
  useEffect(() => {
    fetchUsers()
  }, [filters])

  const handleFiltersChange = (newFilters: Partial<UserFiltersType>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleUserCreated = () => {
    setCreateDialogOpen(false)
    fetchUsers() // Refresh the list
  }

  const handleUserUpdated = () => {
    fetchUsers() // Refresh the list
  }

  const handleUserDeleted = () => {
    fetchUsers() // Refresh the list
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and permissions
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.totalCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.status === 'inactive').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <UserFilters 
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {/* Users List */}
      <UserList
        users={users}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onUserUpdated={handleUserUpdated}
        onUserDeleted={handleUserDeleted}
      />

      {/* Create User Dialog */}
      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onUserCreated={handleUserCreated}
      />
    </div>
  )
} 