'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CreateUserDialog } from '@/components/admin/users/CreateUserDialog'

export default function CreateUserPage() {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(true)

  const handleUserCreated = () => {
    router.push('/admin/users')
  }

  const handleDialogClose = () => {
    router.push('/admin/users')
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
        <span className="text-foreground">Create User</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
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
          <h1 className="text-3xl font-bold tracking-tight">Create New User</h1>
          <p className="text-muted-foreground">
            Add a new user to the system with the appropriate role and permissions.
          </p>
        </div>
      </div>

      {/* Create User Dialog */}
      <CreateUserDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onUserCreated={handleUserCreated}
      />
    </div>
  )
} 