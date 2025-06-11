'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  X,
  Package,
  DollarSign,
  Calendar,
  MapPin,
  Car,
  Plane,
  Building2,
  Percent,
  Clock
} from 'lucide-react'
import { UpdateTreatmentPackage, Treatment, Clinic, TreatmentPackage } from '@/types/database'
import { toast } from 'sonner'
import Link from 'next/link'

export default function EditTreatmentPackagePage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [loadingTreatments, setLoadingTreatments] = useState(true)
  const [loadingClinics, setLoadingClinics] = useState(true)
  
  const [formData, setFormData] = useState<UpdateTreatmentPackage>({
    clinic_id: undefined,
    name: '',
    description: '',
    treatment_ids: [],
    total_base_price: 0,
    discount_percentage: 0,
    min_duration_days: undefined,
    max_duration_days: undefined,
    includes_accommodation: false,
    includes_transportation: false,
    includes_tourism: false,
    package_benefits: [],
    terms_and_conditions: '',
    is_active: true
  })

  // Form state for array inputs
  const [newBenefit, setNewBenefit] = useState('')

  const fetchPackage = async () => {
    try {
      const response = await fetch(`/api/admin/treatment-packages/${params.id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch treatment package')
      }

      // Populate form with existing data
      setFormData({
        clinic_id: data.clinic_id || undefined,
        name: data.name || '',
        description: data.description || '',
        treatment_ids: data.treatment_ids || [],
        total_base_price: data.total_base_price || 0,
        discount_percentage: data.discount_percentage || 0,
        min_duration_days: data.min_duration_days || undefined,
        max_duration_days: data.max_duration_days || undefined,
        includes_accommodation: data.includes_accommodation || false,
        includes_transportation: data.includes_transportation || false,
        includes_tourism: data.includes_tourism || false,
        package_benefits: data.package_benefits || [],
        terms_and_conditions: data.terms_and_conditions || '',
        is_active: data.is_active !== undefined ? data.is_active : true
      })
    } catch (error) {
      console.error('Error fetching treatment package:', error)
      toast.error('Failed to load treatment package')
      router.push('/admin/treatment-packages')
    } finally {
      setInitialLoading(false)
    }
  }

  const fetchTreatments = async () => {
    try {
      const response = await fetch('/api/admin/treatments?limit=1000&status=active')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch treatments')
      }
      
      setTreatments(data.treatments || [])
    } catch (error) {
      console.error('Error fetching treatments:', error)
      toast.error('Failed to load treatments')
    } finally {
      setLoadingTreatments(false)
    }
  }

  const fetchClinics = async () => {
    try {
      const response = await fetch('/api/admin/clinics?limit=1000&status=active')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch clinics')
      }
      
      setClinics(data.clinics || [])
    } catch (error) {
      console.error('Error fetching clinics:', error)
      toast.error('Failed to load clinics')
    } finally {
      setLoadingClinics(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/treatment-packages/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update treatment package')
      }

      toast.success('Treatment package updated successfully')
      router.push(`/admin/treatment-packages/${params.id}`)
    } catch (error) {
      console.error('Error updating treatment package:', error)
      toast.error('Failed to update treatment package')
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: keyof UpdateTreatmentPackage, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addBenefit = () => {
    if (newBenefit.trim()) {
      const currentBenefits = formData.package_benefits || []
      updateFormData('package_benefits', [...currentBenefits, newBenefit.trim()])
      setNewBenefit('')
    }
  }

  const removeBenefit = (index: number) => {
    const currentBenefits = formData.package_benefits || []
    updateFormData('package_benefits', currentBenefits.filter((_, i) => i !== index))
  }

  const toggleTreatment = useCallback((treatmentId: string) => {
    setFormData(prev => {
      const currentIds = prev.treatment_ids
      const isSelected = currentIds.includes(treatmentId)
      
      if (isSelected) {
        return { ...prev, treatment_ids: currentIds.filter(id => id !== treatmentId) }
      } else {
        return { ...prev, treatment_ids: [...currentIds, treatmentId] }
      }
    })
  }, [])

  const calculateFinalPrice = () => {
    const discount = formData.discount_percentage || 0
    return formData.total_base_price * (1 - discount / 100)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  useEffect(() => {
    fetchPackage()
    fetchTreatments()
    fetchClinics()
  }, [params.id])

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href={`/admin/treatment-packages/${params.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Package className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Edit Treatment Package</h1>
            <p className="text-muted-foreground">Update package information and settings</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Package Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="e.g., Complete Smile Makeover Package"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinic">Clinic</Label>
                <Select
                  value={formData.clinic_id || 'none'}
                  onValueChange={(value) => updateFormData('clinic_id', value === 'none' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select clinic (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No specific clinic</SelectItem>
                    {loadingClinics ? (
                      <SelectItem value="loading" disabled>Loading clinics...</SelectItem>
                    ) : (
                      clinics.map((clinic) => (
                        <SelectItem key={clinic.id} value={clinic.id}>
                          {clinic.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Describe what this package includes..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Treatment Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Treatment Selection</CardTitle>
            <p className="text-sm text-muted-foreground">
              Select the treatments included in this package
            </p>
          </CardHeader>
          <CardContent>
            {loadingTreatments ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {treatments.map((treatment) => (
                    <div
                      key={treatment.id}
                      className={`border rounded-lg p-4 transition-colors ${
                        formData.treatment_ids.includes(treatment.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={formData.treatment_ids.includes(treatment.id)}
                          onCheckedChange={() => toggleTreatment(treatment.id)}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{treatment.name}</h4>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {treatment.category}
                          </Badge>
                          {treatment.duration_minutes && (
                            <div className="flex items-center mt-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {treatment.duration_minutes} min
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {formData.treatment_ids.length > 0 && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Selected Treatments ({formData.treatment_ids.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.treatment_ids.map((treatmentId) => {
                        const treatment = treatments.find(t => t.id === treatmentId)
                        return treatment ? (
                          <Badge key={treatmentId} variant="default">
                            {treatment.name}
                            <button
                              type="button"
                              onClick={() => toggleTreatment(treatmentId)}
                              className="ml-2 hover:bg-destructive/20 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ) : (
                          <Badge key={treatmentId} variant="secondary">
                            Unknown Treatment
                            <button
                              type="button"
                              onClick={() => toggleTreatment(treatmentId)}
                              className="ml-2 hover:bg-destructive/20 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_base_price">Total Base Price *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="total_base_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.total_base_price}
                    onChange={(e) => updateFormData('total_base_price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_percentage">Discount Percentage</Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="discount_percentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.discount_percentage}
                    onChange={(e) => updateFormData('discount_percentage', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {formData.total_base_price > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Final Price:</span>
                  <div className="text-right">
                    {(formData.discount_percentage || 0) > 0 && (
                      <div className="text-sm text-muted-foreground line-through">
                        {formatPrice(formData.total_base_price)}
                      </div>
                    )}
                    <div className="text-lg font-semibold">
                      {formatPrice(calculateFinalPrice())}
                    </div>
                    {(formData.discount_percentage || 0) > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {formData.discount_percentage || 0}% OFF
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Duration */}
        <Card>
          <CardHeader>
            <CardTitle>Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_duration_days">Minimum Duration (days)</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="min_duration_days"
                    type="number"
                    min="1"
                    value={formData.min_duration_days || ''}
                    onChange={(e) => updateFormData('min_duration_days', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="e.g., 3"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_duration_days">Maximum Duration (days)</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="max_duration_days"
                    type="number"
                    min="1"
                    value={formData.max_duration_days || ''}
                    onChange={(e) => updateFormData('max_duration_days', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="e.g., 7"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inclusions */}
        <Card>
          <CardHeader>
            <CardTitle>Package Inclusions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includes_accommodation"
                  checked={formData.includes_accommodation}
                  onCheckedChange={(checked) => updateFormData('includes_accommodation', checked)}
                />
                <Label htmlFor="includes_accommodation" className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Accommodation
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includes_transportation"
                  checked={formData.includes_transportation}
                  onCheckedChange={(checked) => updateFormData('includes_transportation', checked)}
                />
                <Label htmlFor="includes_transportation" className="flex items-center">
                  <Car className="h-4 w-4 mr-2" />
                  Transportation
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includes_tourism"
                  checked={formData.includes_tourism}
                  onCheckedChange={(checked) => updateFormData('includes_tourism', checked)}
                />
                <Label htmlFor="includes_tourism" className="flex items-center">
                  <Plane className="h-4 w-4 mr-2" />
                  Tourism Activities
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Package Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Package Benefits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                placeholder="Add a package benefit..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
              />
              <Button type="button" onClick={addBenefit}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.package_benefits && formData.package_benefits.length > 0 && (
              <div className="space-y-2">
                <Label>Current Benefits</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.package_benefits.map((benefit, index) => (
                    <Badge key={index} variant="secondary">
                      {benefit}
                      <button
                        type="button"
                        onClick={() => removeBenefit(index)}
                        className="ml-2 hover:bg-destructive/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Terms and Conditions */}
        <Card>
          <CardHeader>
            <CardTitle>Terms and Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.terms_and_conditions}
              onChange={(e) => updateFormData('terms_and_conditions', e.target.value)}
              placeholder="Enter package terms and conditions..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => updateFormData('is_active', checked)}
              />
              <Label htmlFor="is_active">Package is active and available</Label>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Link href={`/admin/treatment-packages/${params.id}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading || formData.treatment_ids.length === 0}>
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Update Package
          </Button>
        </div>
      </form>
    </div>
  )
} 