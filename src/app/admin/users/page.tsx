import { UserManagementDashboard } from '@/components/admin/users/UserManagementDashboard'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'User Management | Admin Dashboard',
  description: 'Manage users, roles, and permissions in the dental tourism admin panel.',
}

export default function AdminUsersPage() {
  return (
    <div className="container mx-auto py-6">
      <UserManagementDashboard />
    </div>
  )
} 