'use client'

import Link from 'next/link'
import { MoreHorizontal, Edit, Trash2, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { EditUserDialog } from './EditUserDialog'
import { DeleteUserDialog } from './DeleteUserDialog'
import { useState } from 'react'
import type { User } from '@/types/database'

interface UserListProps {
  users: User[]
  loading: boolean
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
  onPageChange: (page: number) => void
  onUserUpdated: () => void
  onUserDeleted: () => void
}

function getUserInitials(user: User): string {
  const firstName = user.first_name || ''
  const lastName = user.last_name || ''
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }
  return user.email[0].toUpperCase()
}

function formatRole(role: string): string {
  return role.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'active':
      return 'default'
    case 'inactive':
      return 'secondary'
    case 'pending':
      return 'outline'
    case 'suspended':
      return 'destructive'
    default:
      return 'secondary'
  }
}

export function UserList({ 
  users, 
  loading, 
  pagination, 
  onPageChange, 
  onUserUpdated, 
  onUserDeleted 
}: UserListProps) {
  const [editUser, setEditUser] = useState<User | null>(null)
  const [deleteUser, setDeleteUser] = useState<User | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleReactivate = async (userId: string) => {
    setActionLoading(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}/reactivate`, {
        method: 'POST'
      })
      
      if (response.ok) {
        onUserUpdated()
      }
    } catch (error) {
      console.error('Error reactivating user:', error)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <LoadingSpinner />
          <span className="ml-2">Loading users...</span>
        </div>
      </Card>
    )
  }

  if (users.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <p>No users found</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getUserInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>
                  <div>
                    <Link 
                      href={`/admin/users/${user.id}`}
                      className="font-medium hover:text-primary hover:underline"
                    >
                      {user.first_name && user.last_name 
                        ? `${user.first_name} ${user.last_name}`
                        : 'No name set'
                      }
                    </Link>
                    <div className="text-sm text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">
                    {formatRole(user.role)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(user.status)}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditUser(user)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      {user.status === 'inactive' ? (
                        <DropdownMenuItem 
                          onClick={() => handleReactivate(user.id)}
                          disabled={actionLoading === user.id}
                        >
                          <RefreshCcw className="h-4 w-4 mr-2" />
                          Reactivate
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem 
                          onClick={() => setDeleteUser(user)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Deactivate
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of{' '}
            {pagination.totalCount} users
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Edit User Dialog */}
      {editUser && (
        <EditUserDialog
          user={editUser}
          open={!!editUser}
          onOpenChange={(open: boolean) => !open && setEditUser(null)}
          onUserUpdated={onUserUpdated}
        />
      )}

      {/* Delete User Dialog */}
      {deleteUser && (
        <DeleteUserDialog
          user={deleteUser}
          open={!!deleteUser}
          onOpenChange={(open: boolean) => !open && setDeleteUser(null)}
          onUserDeleted={onUserDeleted}
        />
      )}
    </div>
  )
} 