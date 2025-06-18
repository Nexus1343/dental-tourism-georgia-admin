'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { 
  ArrowLeft,
  Edit,
  Trash2,
  Stethoscope,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  Heart,
  AlertTriangle,
  Shield,
  FileText,
  DollarSign
} from 'lucide-react'
import { Treatment, TreatmentCategory } from '@/types/database'
import { toast } from 'sonner'

const TREATMENT_CATEGORIES: { value: TreatmentCategory; label: string }[] = [
  { value: 'preventive', label: 'Preventive' },
  { value: 'restorative', label: 'Restorative' },
  { value: 'cosmetic', label: 'Cosmetic' },
  { value: 'orthodontic', label: 'Orthodontic' },
  { value: 'surgical', label: 'Surgical' },
  { value: 'periodontal', label: 'Periodontal' },
  { value: 'endodontic', label: 'Endodontic' },
  { value: 'prosthodontic', label: 'Prosthodontic' },
  { value: 'pediatric', label: 'Pediatric' },
  { value: 'emergency', label: 'Emergency' },
]

export default function TreatmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [treatment, setTreatment] = useState<Treatment | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchTreatment = async () => {
    try {
      const response = await fetch(`/api/admin/treatments/${params.id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch treatment')
      }

      setTreatment(data)
    } catch (error) {
      console.error('Error fetching treatment:', error)
      toast.error('Failed to load treatment')
      router.push('/admin/treatments')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this treatment?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/treatments/${params.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete treatment')
      }

      toast.success('Treatment deleted successfully')
      router.push('/admin/treatments')
    } catch (error) {
      console.error('Error deleting treatment:', error)
      toast.error('Failed to delete treatment')
    }
  }

  const getCategoryBadgeColor = (category: TreatmentCategory) => {
    const colors = {
      preventive: 'bg-green-100 text-green-800',
      restorative: 'bg-blue-100 text-blue-800',
      cosmetic: 'bg-purple-100 text-purple-800',
      orthodontic: 'bg-indigo-100 text-indigo-800',
      surgical: 'bg-red-100 text-red-800',
      periodontal: 'bg-orange-100 text-orange-800',
      endodontic: 'bg-yellow-100 text-yellow-800',
      prosthodontic: 'bg-teal-100 text-teal-800',
      pediatric: 'bg-pink-100 text-pink-800',
      emergency: 'bg-red-100 text-red-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const ArrayDisplay = ({ 
    items, 
    title, 
    icon: Icon, 
    colorClass 
  }: { 
    items: string[], 
    title: string, 
    icon: any, 
    colorClass: string 
  }) => {
    if (!items || items.length === 0) return null

    return (
      <div className="space-y-3">
        <h4 className="font-medium flex items-center">
          <Icon className="h-4 w-4 mr-2" />
          {title}
        </h4>
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <Badge key={index} variant="secondary" className={colorClass}>
              {item}
            </Badge>
          ))}
        </div>
      </div>
    )
  }

  useEffect(() => {
    fetchTreatment()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!treatment) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Treatment not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/admin/treatments">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Stethoscope className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{treatment.name}</h1>
            <p className="text-muted-foreground">/{treatment.slug}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link href={`/admin/treatments/${treatment.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <div className="mt-1">
                    <Badge className={getCategoryBadgeColor(treatment.category)}>
                      {TREATMENT_CATEGORIES.find(c => c.value === treatment.category)?.label}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="mt-1">
                    <Badge variant={treatment.is_active ? 'default' : 'secondary'}>
                      {treatment.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>

              {treatment.description && (
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <p className="mt-1 text-sm text-muted-foreground">{treatment.description}</p>
                </div>
              )}

              {treatment.procedure_details && (
                <div>
                  <label className="text-sm font-medium">Procedure Details</label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    <p className="text-sm whitespace-pre-wrap">{treatment.procedure_details}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Treatment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Treatment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-sm text-muted-foreground">
                      {treatment.duration_minutes ? `${treatment.duration_minutes} minutes` : 'Not specified'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Recovery Time</p>
                    <p className="text-sm text-muted-foreground">
                      {treatment.recovery_time_days ? `${treatment.recovery_time_days} days` : 'Not specified'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Anesthesia</p>
                    <p className="text-sm text-muted-foreground">
                      {treatment.anesthesia_required ? 'Required' : 'Not required'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Base Price</p>
                    <p className="text-sm text-muted-foreground">
                      {treatment.base_price ? 
                        `${treatment.base_price} ${treatment.currency || 'USD'}` : 
                        'Not specified'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clinical Information */}
          <Card>
            <CardHeader>
              <CardTitle>Clinical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ArrayDisplay
                items={treatment.requirements}
                title="Requirements"
                icon={CheckCircle}
                colorClass="bg-blue-100 text-blue-800"
              />

              <ArrayDisplay
                items={treatment.contraindications}
                title="Contraindications"
                icon={XCircle}
                colorClass="bg-red-100 text-red-800"
              />

              <ArrayDisplay
                items={treatment.benefits}
                title="Benefits"
                icon={Heart}
                colorClass="bg-green-100 text-green-800"
              />

              <ArrayDisplay
                items={treatment.risks}
                title="Risks"
                icon={AlertTriangle}
                colorClass="bg-orange-100 text-orange-800"
              />
            </CardContent>
          </Card>

          {/* Aftercare Instructions */}
          {treatment.aftercare_instructions && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Aftercare Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{treatment.aftercare_instructions}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* SEO Information */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {treatment.seo_title && (
                <div>
                  <label className="text-sm font-medium">SEO Title</label>
                  <p className="mt-1 text-sm text-muted-foreground">{treatment.seo_title}</p>
                </div>
              )}

              {treatment.seo_description && (
                <div>
                  <label className="text-sm font-medium">SEO Description</label>
                  <p className="mt-1 text-sm text-muted-foreground">{treatment.seo_description}</p>
                </div>
              )}

              {treatment.seo_keywords && treatment.seo_keywords.length > 0 && (
                <div>
                  <label className="text-sm font-medium">SEO Keywords</label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {treatment.seo_keywords.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium">Created</label>
                <p className="text-sm text-muted-foreground">
                  {new Date(treatment.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Last Updated</label>
                <p className="text-sm text-muted-foreground">
                  {new Date(treatment.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Treatment ID</label>
                <p className="text-xs text-muted-foreground font-mono">{treatment.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 