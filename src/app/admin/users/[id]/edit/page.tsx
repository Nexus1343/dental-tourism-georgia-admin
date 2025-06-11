'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { EditUserDialog } from '@/components/admin/users/EditUserDialog'
import type { User } from '@/types/database'

export default function EditUserPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(true)

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

  const handleUserUpdated = () => {
    router.push(`/admin/users/${userId}`)
  }

  const handleDialogClose = () => {
    router.push(`/admin/users/${userId}`)
  }

  const getUserDisplayName = () => {
    if (!user) return 'Loading...'
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`
    }
    return 'No name set'
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
        <Link href={`/admin/users/${userId}`} className="hover:text-foreground">
          {getUserDisplayName()}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Edit</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.push(`/admin/users/${userId}`)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to User Details
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
          <p className="text-muted-foreground">
            Update user information and permissions for {getUserDisplayName()}.
          </p>
        </div>
      </div>

      {/* Edit User Dialog */}
      <EditUserDialog
        user={user}
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  )
} 