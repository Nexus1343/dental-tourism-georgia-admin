'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, Calendar, Globe, Building2, Star, FileText, Users, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import Link from 'next/link'
import { Clinic } from '@/types/database'
import { toast } from 'sonner'

export default function ClinicDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const clinicId = params.id as string

  useEffect(() => {
    const fetchClinic = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/clinics/${clinicId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Clinic not found')
          }
          throw new Error('Failed to fetch clinic')
        }

        const data = await response.json()
        setClinic(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchClinic()
  }, [clinicId])

  const handleDelete = async () => {
    try {
      setDeleteLoading(true)
      const response = await fetch(`/api/admin/clinics/${clinicId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete clinic')
      }

      toast.success('Clinic deleted successfully')
      router.push('/admin/clinics')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete clinic')
    } finally {
      setDeleteLoading(false)
      setShowDeleteDialog(false)
    }
  }

  const getStatusBadge = (status: Clinic['status']) => {
    const variants = {
      active: 'default',
      inactive: 'secondary', 
      pending_approval: 'outline',
      suspended: 'destructive'
    } as const

    const labels = {
      active: 'Active',
      inactive: 'Inactive',
      pending_approval: 'Pending Approval',
      suspended: 'Suspended'
    }

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !clinic) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/clinics">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Clinics
            </Button>
          </Link>
        </div>
        <div className="text-center text-red-500 h-32 flex items-center justify-center">
          {error || 'Clinic not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/clinics">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Clinics
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {clinic.name}
            </h1>
            <p className="text-muted-foreground">
              Clinic Details and Information
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/clinics/${clinic.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Link href={`/admin/clinics/${clinic.id}/assignments`}>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Templates
            </Button>
          </Link>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <div>
                    <h2 className="text-2xl font-bold">{clinic.name}</h2>
                    <p className="text-muted-foreground">{clinic.slug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(clinic.status)}
                    {clinic.license_number && (
                      <Badge variant="outline">
                        License: {clinic.license_number}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Description */}
              {clinic.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{clinic.description}</p>
                </div>
              )}

              {/* Contact Info */}
              <div>
                <h4 className="font-semibold mb-2">Contact Information</h4>
                <div className="space-y-2">
                  {clinic.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{clinic.email}</span>
                    </div>
                  )}
                  {clinic.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{clinic.phone}</span>
                    </div>
                  )}
                  {clinic.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={clinic.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {clinic.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              <div>
                <h4 className="font-semibold mb-2">Location</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {[clinic.address, clinic.city, clinic.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Facilities */}
              {clinic.facilities && clinic.facilities.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Facilities</h4>
                  <div className="flex flex-wrap gap-2">
                    {clinic.facilities.map((facility, index) => (
                      <Badge key={index} variant="secondary">
                        {facility}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages Spoken */}
              {clinic.languages_spoken && clinic.languages_spoken.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Languages Spoken</h4>
                  <div className="flex flex-wrap gap-2">
                    {clinic.languages_spoken.map((language, index) => (
                      <Badge key={index} variant="outline">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Accreditations */}
          {clinic.accreditations && clinic.accreditations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Accreditations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {clinic.accreditations.map((accreditation, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>{accreditation}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {clinic.established_year && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Established</span>
                  <span className="font-medium">{clinic.established_year}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Country</span>
                <span className="font-medium">{clinic.country}</span>
              </div>
              {clinic.city && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">City</span>
                  <span className="font-medium">{clinic.city}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm text-muted-foreground">Created</span>
                <p className="font-medium">{formatDate(clinic.created_at)}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <p className="font-medium">{formatDate(clinic.updated_at)}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Clinic ID</span>
                <p className="font-mono text-xs">{clinic.id}</p>
              </div>
            </CardContent>
          </Card>

          {/* SEO Information */}
          {(clinic.seo_title || clinic.seo_description || clinic.seo_keywords) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  SEO Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {clinic.seo_title && (
                  <div>
                    <span className="text-sm text-muted-foreground">SEO Title</span>
                    <p className="text-sm">{clinic.seo_title}</p>
                  </div>
                )}
                {clinic.seo_description && (
                  <div>
                    <span className="text-sm text-muted-foreground">SEO Description</span>
                    <p className="text-sm">{clinic.seo_description}</p>
                  </div>
                )}
                {clinic.seo_keywords && clinic.seo_keywords.length > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground">SEO Keywords</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {clinic.seo_keywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Clinic</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{clinic?.name}&quot;? This action cannot be undone and will permanently remove all clinic data, including any associated templates and submissions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Clinic
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 