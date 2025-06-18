'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, X, Plus } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
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

export default function EditClinicPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formData, setFormData] = useState<ClinicFormData>({
    name: '',
    slug: '',
    status: 'active',
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
    languages_spoken: [],
    seo_title: '',
    seo_description: '',
    seo_keywords: []
  })

  const clinicId = params.id as string

  // Fetch clinic data
  useEffect(() => {
    const fetchClinic = async () => {
      try {
        setInitialLoading(true)
        const response = await fetch(`/api/admin/clinics/${clinicId}`)

        if (response.ok) {
          const clinic = await response.json()
          
          // Pre-fill form with existing data
          setFormData({
            name: clinic.name || '',
            slug: clinic.slug || '',
            status: clinic.status || 'active',
            description: clinic.description || '',
            address: clinic.address || '',
            city: clinic.city || '',
            country: clinic.country || 'Georgia',
            phone: clinic.phone || '',
            email: clinic.email || '',
            website: clinic.website || '',
            established_year: clinic.established_year?.toString() || '',
            license_number: clinic.license_number || '',
            accreditations: clinic.accreditations || [],
            facilities: clinic.facilities || [],
            languages_spoken: clinic.languages_spoken || [],
            seo_title: clinic.seo_title || '',
            seo_description: clinic.seo_description || '',
            seo_keywords: clinic.seo_keywords || []
          })
        } else if (response.status === 404) {
          throw new Error('Clinic not found')
        } else {
          throw new Error('Failed to fetch clinic')
        }
      } catch (error) {
        console.error('Failed to fetch clinic:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to load clinic data')
        router.push('/admin/clinics')
      } finally {
        setInitialLoading(false)
      }
    }
    
    fetchClinic()
  }, [clinicId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Prepare the data
      const submitData: CreateClinic = {
        ...formData,
        established_year: formData.established_year ? parseInt(formData.established_year) : undefined
      }

      const response = await fetch(`/api/admin/clinics/${clinicId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update clinic')
      }

      toast.success('Clinic updated successfully')
      router.push(`/admin/clinics/${clinicId}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update clinic')
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
    if (value.trim() && !formData[field].includes(value.trim())) {
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

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/admin/clinics/${clinicId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Clinic
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Clinic</h1>
            <p className="text-muted-foreground">
              Update clinic information and profile
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/clinics/${clinicId}`}>
            <Button variant="outline">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </Link>
          <Button onClick={handleSubmit} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="contact">Contact & Location</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Essential details about the clinic
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Clinic Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the clinic's services and specialties"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(option => (
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
                      min="1800"
                      max={new Date().getFullYear()}
                      value={formData.established_year}
                      onChange={(e) => setFormData(prev => ({ ...prev, established_year: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="license_number">License Number</Label>
                  <Input
                    id="license_number"
                    value={formData.license_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
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
                  How patients can reach the clinic
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
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
                    placeholder="https://example.com"
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold">Location</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Select
                        value={formData.country}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map(country => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            {/* Facilities */}
            <Card>
              <CardHeader>
                <CardTitle>Facilities</CardTitle>
                <CardDescription>
                  Equipment and services available at the clinic
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {formData.facilities.map((facility, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {facility}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeArrayItem('facilities', index)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Select onValueChange={(value) => addArrayItem('facilities', value)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Add facility" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_FACILITIES
                        .filter(facility => !formData.facilities.includes(facility))
                        .map(facility => (
                          <SelectItem key={facility} value={facility}>
                            {facility}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Languages */}
            <Card>
              <CardHeader>
                <CardTitle>Languages Spoken</CardTitle>
                <CardDescription>
                  Languages that staff members can communicate in
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {formData.languages_spoken.map((language, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {language}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeArrayItem('languages_spoken', index)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Select onValueChange={(value) => addArrayItem('languages_spoken', value)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Add language" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_LANGUAGES
                        .filter(language => !formData.languages_spoken.includes(language))
                        .map(language => (
                          <SelectItem key={language} value={language}>
                            {language}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Accreditations */}
            <Card>
              <CardHeader>
                <CardTitle>Accreditations</CardTitle>
                <CardDescription>
                  Professional certifications and accreditations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {formData.accreditations.map((accreditation, index) => (
                    <Badge key={index} variant="default" className="flex items-center gap-1">
                      {accreditation}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeArrayItem('accreditations', index)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter accreditation name"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addArrayItem('accreditations', e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement
                      if (input.value) {
                        addArrayItem('accreditations', input.value)
                        input.value = ''
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SEO Information</CardTitle>
                <CardDescription>
                  Search engine optimization settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seo_title">SEO Title</Label>
                  <Input
                    id="seo_title"
                    value={formData.seo_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                    placeholder="Title for search engines"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo_description">SEO Description</Label>
                  <Textarea
                    id="seo_description"
                    rows={3}
                    value={formData.seo_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                    placeholder="Meta description for search engines"
                  />
                </div>

                <div className="space-y-2">
                  <Label>SEO Keywords</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.seo_keywords.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {keyword}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeArrayItem('seo_keywords', index)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter SEO keyword"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addArrayItem('seo_keywords', e.currentTarget.value)
                          e.currentTarget.value = ''
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement
                        if (input.value) {
                          addArrayItem('seo_keywords', input.value)
                          input.value = ''
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
} 