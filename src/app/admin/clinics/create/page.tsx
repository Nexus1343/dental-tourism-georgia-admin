'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { CreateClinic } from '@/types/database'
import { toast } from 'sonner'

interface ClinicFormData {
  name: string
  slug: string
  status: 'active' | 'inactive' | 'pending_approval' | 'suspended'
  description: string
  address: string
  city: string
  country: string
  phone: string
  email: string
  website: string
  established_year: string
  license_number: string
  accreditations: string[]
  facilities: string[]
  languages_spoken: string[]
  seo_title: string
  seo_description: string
  seo_keywords: string[]
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'suspended', label: 'Suspended' }
]

const COUNTRIES = [
  'Georgia', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 
  'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Switzerland',
  'Israel', 'UAE', 'Saudi Arabia', 'Other'
]

const COMMON_FACILITIES = [
  'Digital X-Ray', 'CT Scanner', '3D Imaging', 'Laser Treatment', 'Sedation Services',
  'Surgery Suite', 'Recovery Room', 'Sterilization Room', 'Laboratory', 'Parking',
  'WiFi', 'Air Conditioning', 'Wheelchair Access', 'Emergency Services'
]

const COMMON_LANGUAGES = [
  'English', 'Georgian', 'Russian', 'German', 'French', 'Italian', 'Spanish',
  'Arabic', 'Hebrew', 'Turkish', 'Armenian'
]

export default function CreateClinicPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ClinicFormData>({
    name: '',
    slug: '',
    status: 'pending_approval',
    description: '',
    address: '',
    city: '',
    country: 'Georgia',
    phone: '',
    email: '',
    website: '',
    established_year: '',
    license_number: '',
    accreditations: [],
    facilities: [],
    languages_spoken: ['English'],
    seo_title: '',
    seo_description: '',
    seo_keywords: []
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Check if slug already exists
      const slugCheckResponse = await fetch(`/api/admin/clinics?check_slug=${formData.slug}`)
      if (slugCheckResponse.ok) {
        const slugData = await slugCheckResponse.json()
        if (slugData.exists) {
          toast.error('This slug already exists. Please choose a different one.')
          setLoading(false)
          return
        }
      }

      // Prepare the data
      const submitData: CreateClinic = {
        ...formData,
        established_year: formData.established_year ? parseInt(formData.established_year) : undefined,
        email: formData.email || undefined,
        website: formData.website || undefined
      }

      const response = await fetch('/api/admin/clinics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create clinic')
      }

      const newClinic = await response.json()
      toast.success('Clinic created successfully')
      router.push(`/admin/clinics/${newClinic.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create clinic')
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  const addArrayItem = (field: keyof Pick<ClinicFormData, 'accreditations' | 'facilities' | 'languages_spoken' | 'seo_keywords'>, value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }))
    }
  }

  const removeArrayItem = (field: keyof Pick<ClinicFormData, 'accreditations' | 'facilities' | 'languages_spoken' | 'seo_keywords'>, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
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
              Create New Clinic
            </h1>
            <p className="text-muted-foreground">
              Add a new dental clinic to the system
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Enter the clinic&apos;s basic details and identification information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Clinic Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Enter clinic name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug *</Label>
                    <Input
                      id="slug"
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="clinic-url-slug"
                      required
                    />
                    <p className="text-sm text-muted-foreground">Used in URLs. Auto-generated from name.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the clinic"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="established_year">Established Year</Label>
                    <Input
                      id="established_year"
                      type="number"
                      value={formData.established_year}
                      onChange={(e) => setFormData(prev => ({ ...prev, established_year: e.target.value }))}
                      placeholder="2020"
                      min="1800"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="license_number">License Number</Label>
                  <Input
                    id="license_number"
                    type="text"
                    value={formData.license_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
                    placeholder="Medical license number"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Add contact details and location information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="e.g., Tbilisi"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Full street address"
                    className="min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+995 32 2 XX XX XX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="contact@clinic.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://clinic.com"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
                <CardDescription>
                  Configure facilities, accreditations, and supported languages.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Facilities */}
                <div className="space-y-3">
                  <Label>Facilities</Label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_FACILITIES.map((facility) => (
                      <Button
                        key={facility}
                        type="button"
                        variant={formData.facilities.includes(facility) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          if (formData.facilities.includes(facility)) {
                            setFormData(prev => ({
                              ...prev,
                              facilities: prev.facilities.filter(f => f !== facility)
                            }))
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              facilities: [...prev.facilities, facility]
                            }))
                          }
                        }}
                      >
                        {facility}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Languages */}
                <div className="space-y-3">
                  <Label>Languages Spoken</Label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_LANGUAGES.map((language) => (
                      <Button
                        key={language}
                        type="button"
                        variant={formData.languages_spoken.includes(language) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          if (formData.languages_spoken.includes(language)) {
                            setFormData(prev => ({
                              ...prev,
                              languages_spoken: prev.languages_spoken.filter(l => l !== language)
                            }))
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              languages_spoken: [...prev.languages_spoken, language]
                            }))
                          }
                        }}
                      >
                        {language}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>
                  Optimize the clinic&apos;s page for search engines.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seo_title">SEO Title</Label>
                  <Input
                    id="seo_title"
                    type="text"
                    value={formData.seo_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                    placeholder="SEO title for search engines"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo_description">SEO Description</Label>
                  <Textarea
                    id="seo_description"
                    value={formData.seo_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                    placeholder="Brief description for search engines"
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-6">
          <Link href="/admin/clinics">
            <Button variant="outline" disabled={loading}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Clinic
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
} 