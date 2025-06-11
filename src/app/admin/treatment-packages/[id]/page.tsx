'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  DollarSign,
  Calendar,
  MapPin,
  Car,
  Plane,
  Building2,
  Stethoscope,
  Clock,
  CheckCircle,
  Gift
} from 'lucide-react'
import { TreatmentPackageWithDetails } from '@/types/database'
import { toast } from 'sonner'

export default function TreatmentPackageDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [packageData, setPackageData] = useState<TreatmentPackageWithDetails | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchPackage = async () => {
    try {
      const response = await fetch(`/api/admin/treatment-packages/${params.id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch treatment package')
      }

      setPackageData(data)
    } catch (error) {
      console.error('Error fetching treatment package:', error)
      toast.error('Failed to load treatment package')
      router.push('/admin/treatment-packages')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this treatment package?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/treatment-packages/${params.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete treatment package')
      }

      toast.success('Treatment package deleted successfully')
      router.push('/admin/treatment-packages')
    } catch (error) {
      console.error('Error deleting treatment package:', error)
      toast.error('Failed to delete treatment package')
    }
  }

  const calculateFinalPrice = () => {
    if (!packageData) return 0
    const discount = packageData.discount_percentage || 0
    return packageData.total_base_price * (1 - discount / 100)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  useEffect(() => {
    fetchPackage()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!packageData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Treatment package not found</p>
      </div>
    )
  }

  const finalPrice = calculateFinalPrice()
  const hasDiscount = packageData.discount_percentage && packageData.discount_percentage > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/admin/treatment-packages">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Package className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{packageData.name}</h1>
            <p className="text-muted-foreground">Treatment Package Details</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link href={`/admin/treatment-packages/${packageData.id}/edit`}>
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
                  <label className="text-sm font-medium">Status</label>
                  <div className="mt-1">
                    <Badge variant={packageData.is_active ? 'default' : 'secondary'}>
                      {packageData.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                {packageData.clinic && (
                  <div>
                    <label className="text-sm font-medium">Clinic</label>
                    <div className="mt-1 flex items-center">
                      <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{packageData.clinic.name}</span>
                    </div>
                  </div>
                )}
              </div>

              {packageData.description && (
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <p className="mt-1 text-sm text-muted-foreground">{packageData.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Included Treatments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Stethoscope className="h-5 w-5 mr-2" />
                Included Treatments ({packageData.treatment_ids.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {packageData.treatment_ids.map((treatmentId, index) => (
                  <div key={treatmentId} className="flex items-center p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">Treatment {index + 1}</div>
                      <div className="text-sm text-muted-foreground">ID: {treatmentId}</div>
                    </div>
                    <Link href={`/admin/treatments/${treatmentId}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Package Benefits */}
          {packageData.package_benefits && packageData.package_benefits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="h-5 w-5 mr-2" />
                  Package Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {packageData.package_benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Terms and Conditions */}
          {packageData.terms_and_conditions && (
            <Card>
              <CardHeader>
                <CardTitle>Terms and Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{packageData.terms_and_conditions}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Base Price:</span>
                  <span className={hasDiscount ? 'line-through text-muted-foreground' : 'font-medium'}>
                    {formatPrice(packageData.total_base_price)}
                  </span>
                </div>
                
                {hasDiscount && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Discount:</span>
                      <Badge variant="destructive" className="text-xs">
                        {packageData.discount_percentage}% OFF
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-medium">Final Price:</span>
                      <span className="font-bold text-lg">{formatPrice(finalPrice)}</span>
                    </div>
                  </>
                )}
                
                {!hasDiscount && (
                  <div className="flex justify-between">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold text-lg">{formatPrice(finalPrice)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Duration */}
          {(packageData.min_duration_days || packageData.max_duration_days) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Duration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {packageData.min_duration_days === packageData.max_duration_days
                      ? `${packageData.min_duration_days}`
                      : `${packageData.min_duration_days || '?'}-${packageData.max_duration_days || '?'}`
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {packageData.min_duration_days === packageData.max_duration_days ? 'day' : 'days'}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Inclusions */}
          <Card>
            <CardHeader>
              <CardTitle>Package Inclusions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">Accommodation</span>
                </div>
                <Badge variant={packageData.includes_accommodation ? 'default' : 'secondary'}>
                  {packageData.includes_accommodation ? 'Included' : 'Not Included'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Car className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">Transportation</span>
                </div>
                <Badge variant={packageData.includes_transportation ? 'default' : 'secondary'}>
                  {packageData.includes_transportation ? 'Included' : 'Not Included'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Plane className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">Tourism Activities</span>
                </div>
                <Badge variant={packageData.includes_tourism ? 'default' : 'secondary'}>
                  {packageData.includes_tourism ? 'Included' : 'Not Included'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Package Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Created</label>
                <p className="text-sm">{formatDate(packageData.created_at)}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Last Updated</label>
                <p className="text-sm">{formatDate(packageData.updated_at)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 