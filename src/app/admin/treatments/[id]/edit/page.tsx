'use client'

import { useState, useEffect } from 'react'
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
  Stethoscope,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Heart
} from 'lucide-react'
import { TreatmentCategory, Treatment, UpdateTreatment } from '@/types/database'
import { toast } from 'sonner'
import Link from 'next/link'

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

export default function EditTreatmentPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formData, setFormData] = useState<UpdateTreatment>({
    name: '',
    category: 'preventive',
    description: '',
    procedure_details: '',
    duration_minutes: undefined,
    recovery_time_days: undefined,
    anesthesia_required: false,
    requirements: [],
    contraindications: [],
    benefits: [],
    risks: [],
    aftercare_instructions: '',
    images: [],
    seo_title: '',
    seo_description: '',
    seo_keywords: [],
    is_active: true
  })

  // Form state for array inputs
  const [newRequirement, setNewRequirement] = useState('')
  const [newContraindication, setNewContraindication] = useState('')
  const [newBenefit, setNewBenefit] = useState('')
  const [newRisk, setNewRisk] = useState('')
  const [newKeyword, setNewKeyword] = useState('')

  const fetchTreatment = async () => {
    try {
      const response = await fetch(`/api/admin/treatments/${params.id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch treatment')
      }

      // Populate form with existing data
      setFormData({
        name: data.name || '',
        category: data.category,
        description: data.description || '',
        procedure_details: data.procedure_details || '',
        duration_minutes: data.duration_minutes,
        recovery_time_days: data.recovery_time_days,
        anesthesia_required: data.anesthesia_required || false,
        requirements: data.requirements || [],
        contraindications: data.contraindications || [],
        benefits: data.benefits || [],
        risks: data.risks || [],
        aftercare_instructions: data.aftercare_instructions || '',
        images: data.images || [],
        base_price: data.base_price,
        currency: data.currency || 'USD',
        seo_title: data.seo_title || '',
        seo_description: data.seo_description || '',
        seo_keywords: data.seo_keywords || [],
        is_active: data.is_active
      })
    } catch (error) {
      console.error('Error fetching treatment:', error)
      toast.error('Failed to load treatment')
      router.push('/admin/treatments')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/treatments/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update treatment')
      }

      toast.success('Treatment updated successfully')
      router.push(`/admin/treatments/${params.id}`)
    } catch (error) {
      console.error('Error updating treatment:', error)
      toast.error('Failed to update treatment')
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: keyof UpdateTreatment, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addToArray = (field: keyof UpdateTreatment, value: string, setter: (value: string) => void) => {
    if (value.trim()) {
      const currentArray = formData[field] as string[] || []
      updateFormData(field, [...currentArray, value.trim()])
      setter('')
    }
  }

  const removeFromArray = (field: keyof UpdateTreatment, index: number) => {
    const currentArray = formData[field] as string[] || []
    updateFormData(field, currentArray.filter((_, i) => i !== index))
  }

  const ArrayInput = ({ 
    field, 
    label, 
    placeholder, 
    icon: Icon, 
    value, 
    setValue,
    colorClass 
  }: {
    field: keyof UpdateTreatment
    label: string
    placeholder: string
    icon: any
    value: string
    setValue: (value: string) => void
    colorClass: string
  }) => {
    const items = (formData[field] as string[]) || []
    
    return (
      <div className="space-y-3">
        <Label className="flex items-center">
          <Icon className="h-4 w-4 mr-2" />
          {label}
        </Label>
        <div className="flex space-x-2">
          <Input
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addToArray(field, value, setValue)
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addToArray(field, value, setValue)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <Badge key={index} variant="secondary" className={colorClass}>
              {item}
              <button
                type="button"
                onClick={() => removeFromArray(field, index)}
                className="ml-2 h-3 w-3 rounded-full hover:bg-black/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>
    )
  }

  useEffect(() => {
    fetchTreatment()
  }, [params.id])

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href={`/admin/treatments/${params.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Stethoscope className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Edit Treatment</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 form-container">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Treatment Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Dental Implant"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => updateFormData('category', value as TreatmentCategory)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TREATMENT_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the treatment..."
                value={formData.description || ''}
                onChange={(e) => updateFormData('description', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="procedure_details">Procedure Details</Label>
              <Textarea
                id="procedure_details"
                placeholder="Detailed information about the procedure..."
                value={formData.procedure_details || ''}
                onChange={(e) => updateFormData('procedure_details', e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Treatment Details */}
        <Card>
          <CardHeader>
            <CardTitle>Treatment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration_minutes" className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Duration (minutes)
                </Label>
                <Input
                  id="duration_minutes"
                  type="number"
                  placeholder="e.g., 60"
                  value={formData.duration_minutes || ''}
                  onChange={(e) => updateFormData('duration_minutes', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recovery_time_days" className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Recovery Time (days)
                </Label>
                <Input
                  id="recovery_time_days"
                  type="number"
                  placeholder="e.g., 7"
                  value={formData.recovery_time_days || ''}
                  onChange={(e) => updateFormData('recovery_time_days', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="base_price">Base Price</Label>
                <Input
                  id="base_price"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 1500.00"
                  value={formData.base_price || ''}
                  onChange={(e) => updateFormData('base_price', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency || 'USD'}
                  onValueChange={(value) => updateFormData('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="GEL">GEL - Georgian Lari</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="anesthesia_required"
                checked={formData.anesthesia_required}
                onCheckedChange={(checked) => updateFormData('anesthesia_required', checked)}
              />
              <Label htmlFor="anesthesia_required">Anesthesia Required</Label>
            </div>
          </CardContent>
        </Card>

        {/* Clinical Information */}
        <Card>
          <CardHeader>
            <CardTitle>Clinical Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ArrayInput
              field="requirements"
              label="Requirements"
              placeholder="Add a requirement..."
              icon={CheckCircle}
              value={newRequirement}
              setValue={setNewRequirement}
              colorClass="bg-blue-100 text-blue-800"
            />

            <ArrayInput
              field="contraindications"
              label="Contraindications"
              placeholder="Add a contraindication..."
              icon={XCircle}
              value={newContraindication}
              setValue={setNewContraindication}
              colorClass="bg-red-100 text-red-800"
            />

            <ArrayInput
              field="benefits"
              label="Benefits"
              placeholder="Add a benefit..."
              icon={Heart}
              value={newBenefit}
              setValue={setNewBenefit}
              colorClass="bg-green-100 text-green-800"
            />

            <ArrayInput
              field="risks"
              label="Risks"
              placeholder="Add a risk..."
              icon={AlertTriangle}
              value={newRisk}
              setValue={setNewRisk}
              colorClass="bg-orange-100 text-orange-800"
            />
          </CardContent>
        </Card>

        {/* Aftercare */}
        <Card>
          <CardHeader>
            <CardTitle>Aftercare Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Detailed aftercare instructions for patients..."
              value={formData.aftercare_instructions || ''}
              onChange={(e) => updateFormData('aftercare_instructions', e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>

        {/* SEO Settings */}
        <Card>
          <CardHeader>
            <CardTitle>SEO Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seo_title">SEO Title</Label>
              <Input
                id="seo_title"
                placeholder="SEO optimized title..."
                value={formData.seo_title || ''}
                onChange={(e) => updateFormData('seo_title', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo_description">SEO Description</Label>
              <Textarea
                id="seo_description"
                placeholder="SEO meta description..."
                value={formData.seo_description || ''}
                onChange={(e) => updateFormData('seo_description', e.target.value)}
                rows={3}
              />
            </div>

            <ArrayInput
              field="seo_keywords"
              label="SEO Keywords"
              placeholder="Add a keyword..."
              icon={Plus}
              value={newKeyword}
              setValue={setNewKeyword}
              colorClass="bg-purple-100 text-purple-800"
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
              <Label htmlFor="is_active">Active (visible to users)</Label>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <Link href={`/admin/treatments/${params.id}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
} 