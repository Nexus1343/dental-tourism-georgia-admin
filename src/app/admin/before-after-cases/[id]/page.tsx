'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  ImageIcon,
  Calendar,
  Hash,
  Stethoscope,
  FileText
} from 'lucide-react'
import { BeforeAfterCase, CaseDisplayStatus } from '@/types/database'
import { toast } from 'sonner'

const STATUS_OPTIONS: { value: CaseDisplayStatus; label: string; color: string }[] = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
  { value: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800' },
  { value: 'hidden', label: 'Hidden', color: 'bg-red-100 text-red-800' },
]

interface ViewCasePageProps {
  params: Promise<{ id: string }>
}

export default function ViewBeforeAfterCasePage({ params }: ViewCasePageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [case_, setCase] = useState<BeforeAfterCase | null>(null)

  useEffect(() => {
    fetchCase()
  }, [resolvedParams.id])

  const fetchCase = async () => {
    try {
      const response = await fetch(`/api/admin/before-after-cases/${resolvedParams.id}`)
      if (!response.ok) {
        throw new Error('Case not found')
      }
      
      const caseData = await response.json()
      setCase(caseData)
    } catch (error) {
      console.error('Error fetching case:', error)
      toast.error('Failed to load case')
      router.push('/admin/before-after-cases')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!case_) return
    
    if (!confirm(`Are you sure you want to delete "${case_.title}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/before-after-cases/${resolvedParams.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete case')
      }

      toast.success('Case deleted successfully')
      router.push('/admin/before-after-cases')
    } catch (error) {
      console.error('Error deleting case:', error)
      toast.error('Failed to delete case')
    }
  }

  const handleStatusChange = async (status: CaseDisplayStatus) => {
    if (!case_) return

    try {
      const response = await fetch(`/api/admin/before-after-cases/${resolvedParams.id}`, {
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

      const updatedCase = await response.json()
      setCase(updatedCase)
      toast.success('Status updated successfully')
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const getStatusBadge = (status: CaseDisplayStatus) => {
    const statusOption = STATUS_OPTIONS.find(opt => opt.value === status)
    return statusOption ? statusOption : STATUS_OPTIONS[1] // default to inactive
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          Loading case...
        </div>
      </div>
    )
  }

  if (!case_) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          Case not found
        </div>
      </div>
    )
  }

  const statusBadge = getStatusBadge(case_.status)

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Before & After Cases', href: '/admin/before-after-cases' },
          { label: case_.title }
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/admin/before-after-cases">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cases
            </Button>
          </Link>
          <div className="flex items-center space-x-3">
            <ImageIcon className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">{case_.title}</h1>
              <p className="text-muted-foreground">{case_.treatment_name}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={statusBadge.color}>
            {statusBadge.label}
          </Badge>
                     <Link href={`/admin/before-after-cases/${resolvedParams.id}/edit`}>
             <Button size="sm">
               <Edit className="h-4 w-4 mr-2" />
               Edit
             </Button>
           </Link>
          <Button size="sm" variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Images */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before Image */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Before</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={case_.before_image_url}
                    alt="Before"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </CardContent>
            </Card>

            {/* After Image */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">After</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={case_.after_image_url}
                    alt="After"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Treatment Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Treatment Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{case_.treatment_description}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Case Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Case Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Treatment</p>
                  <p className="text-sm text-muted-foreground">{case_.treatment_name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Display Order</p>
                  <p className="text-sm text-muted-foreground">{case_.display_order}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(case_.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(case_.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle>Status Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Status</span>
                <Badge className={statusBadge.color}>
                  {statusBadge.label}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Change status:</p>
                <div className="flex flex-col space-y-2">
                  {STATUS_OPTIONS.map(status => (
                    <Button
                      key={status.value}
                      variant={case_.status === status.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusChange(status.value)}
                      disabled={case_.status === status.value}
                      className="justify-start"
                    >
                      {status.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                           <Link href={`/admin/before-after-cases/${resolvedParams.id}/edit`}>
               <Button variant="outline" className="w-full justify-start">
                 <Edit className="h-4 w-4 mr-2" />
                 Edit Case
               </Button>
             </Link>
              <Button 
                variant="outline" 
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Case
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 