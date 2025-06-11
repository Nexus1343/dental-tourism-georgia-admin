'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, ArrowLeft, Edit, Trash2, RefreshCcw, Calendar, Mail, Phone, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { EditUserDialog } from '@/components/admin/users/EditUserDialog'
import { DeleteUserDialog } from '@/components/admin/users/DeleteUserDialog'
import type { User } from '@/types/database'

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

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Fetch user data
  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('User not found')
        } else {
          throw new Error('Failed to fetch user')
        }
        return
      }

      const result = await response.json()
      setUser(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [userId])

  const handleReactivate = async () => {
    if (!user) return
    
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${user.id}/reactivate`, {
        method: 'POST'
      })
      
      if (response.ok) {
        fetchUser() // Refresh user data
      }
    } catch (error) {
      console.error('Error reactivating user:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleUserUpdated = () => {
    fetchUser() // Refresh user data
  }

  const handleUserDeleted = () => {
    fetchUser() // Refresh user data
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
          <span className="ml-2">Loading user...</span>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
          <p className="text-muted-foreground mb-4">{error || 'The requested user could not be found.'}</p>
          <Button onClick={() => router.push('/admin/users')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
        </div>
      </div>
    )
  }

  const getUserDisplayName = () => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`
    }
    return 'No name set'
  }

  return (
    <div className="container mx-auto py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
        <Link href="/admin" className="hover:text-foreground">
          Admin
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/admin/users" className="hover:text-foreground">
          Users
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{getUserDisplayName()}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/admin/users')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
            <p className="text-muted-foreground">
              View and manage user information
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {user.status === 'inactive' ? (
            <Button 
              onClick={handleReactivate}
              disabled={actionLoading}
              className="gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Reactivate
            </Button>
          ) : (
            <Button 
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Deactivate
            </Button>
          )}
          <Button 
            onClick={() => setEditDialogOpen(true)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit User
          </Button>
        </div>
      </div>

      {/* User Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Basic user information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">
                  {getUserInitials(user)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{getUserDisplayName()}</h3>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
              
              {user.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{user.phone}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="capitalize">
                  {user.preferred_language === 'en' ? 'English' : 
                   user.preferred_language === 'ka' ? 'Georgian' : 
                   user.preferred_language === 'ru' ? 'Russian' : 
                   user.preferred_language}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role & Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Role & Status</CardTitle>
            <CardDescription>User permissions and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Role</label>
              <div className="text-lg font-semibold">{formatRole(user.role)}</div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <Badge variant={getStatusBadgeVariant(user.status)} className="text-sm">
                  {user.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Card */}
        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
            <CardDescription>Account timeline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created</span>
                </div>
                <div className="font-medium">{new Date(user.created_at).toLocaleDateString()}</div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Last Updated</span>
                </div>
                <div className="font-medium">{new Date(user.updated_at).toLocaleDateString()}</div>
              </div>
              
              {user.last_login_at && (
                <div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Last Login</span>
                  </div>
                  <div className="font-medium">{new Date(user.last_login_at).toLocaleDateString()}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit User Dialog */}
      <EditUserDialog
        user={user}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUserUpdated={handleUserUpdated}
      />

      {/* Delete User Dialog */}
      <DeleteUserDialog
        user={user}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onUserDeleted={handleUserDeleted}
      />
    </div>
  )
} 