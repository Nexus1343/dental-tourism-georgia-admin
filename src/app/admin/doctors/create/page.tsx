'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, X, Upload, Plus } from 'lucide-react'
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

interface FormOptions {
  users: Array<{
    id: string
    first_name: string | null
    last_name: string | null
    email: string
    phone: string | null
    role: string
    status: string
  }>
  clinics: Array<{
    id: string
    name: string
    city: string | null
    country: string | null
    status: string
  }>
  specializations: Array<{
    value: string
    label: string
  }>
  statusOptions: Array<{
    value: string
    label: string
  }>
  languages: Array<{
    code: string
    name: string
  }>
  titles: string[]
}

interface Education {
  degree: string
  institution: string
  year: number | null
  location?: string
}

interface Certification {
  name: string
  issuer: string
  year: number | null
  expiry?: string
}

interface Achievement {
  title: string
  year: number | null
  description?: string
}

interface Publication {
  title: string
  journal: string
  year: number | null
  url?: string
}

export default function CreateDoctorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState<FormOptions | null>(null)
  const [formData, setFormData] = useState({
    user_id: '',
    clinic_id: '',
    status: 'active',
    title: '',
    specializations: [] as string[],
    license_number: '',
    years_of_experience: '',
    education: [] as Education[],
    certifications: [] as Certification[],
    languages: ['en'],
    bio: '',
    consultation_fee: '',
    profile_image_url: '',
    gallery_images: [] as string[],
    achievements: [] as Achievement[],
    publications: [] as Publication[],
    seo_title: '',
    seo_description: ''
  })

  // Fetch form options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch('/api/admin/doctors/options')
        if (response.ok) {
          const data = await response.json()
          setOptions(data)
        }
      } catch (error) {
        console.error('Failed to fetch options:', error)
      }
    }
    fetchOptions()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Prepare the data
      const submitData = {
        ...formData,
        years_of_experience: formData.years_of_experience ? parseInt(formData.years_of_experience) : null,
        consultation_fee: formData.consultation_fee ? parseFloat(formData.consultation_fee) : null,
        user_id: formData.user_id && formData.user_id !== 'none' ? formData.user_id : null,
        clinic_id: formData.clinic_id && formData.clinic_id !== 'none' ? formData.clinic_id : null
      }

      const response = await fetch('/api/admin/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create doctor')
      }

      const doctor = await response.json()
      router.push(`/admin/doctors/${doctor.id}`)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create doctor')
    } finally {
      setLoading(false)
    }
  }

  const addSpecialization = (specValue: string) => {
    if (!formData.specializations.includes(specValue)) {
      setFormData({
        ...formData,
        specializations: [...formData.specializations, specValue]
      })
    }
  }

  const removeSpecialization = (spec: string) => {
    setFormData({
      ...formData,
      specializations: formData.specializations.filter(s => s !== spec)
    })
  }

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { degree: '', institution: '', year: null, location: '' }]
    })
  }

  const removeEducation = (index: number) => {
    const newEducation = formData.education.filter((_, i) => i !== index)
    setFormData({ ...formData, education: newEducation })
  }

  const updateEducation = (index: number, field: keyof Education, value: any) => {
    const newEducation = [...formData.education]
    newEducation[index] = { ...newEducation[index], [field]: value }
    setFormData({ ...formData, education: newEducation })
  }

  const addCertification = () => {
    setFormData({
      ...formData,
      certifications: [...formData.certifications, { name: '', issuer: '', year: null, expiry: '' }]
    })
  }

  const removeCertification = (index: number) => {
    const newCertifications = formData.certifications.filter((_, i) => i !== index)
    setFormData({ ...formData, certifications: newCertifications })
  }

  const updateCertification = (index: number, field: keyof Certification, value: any) => {
    const newCertifications = [...formData.certifications]
    newCertifications[index] = { ...newCertifications[index], [field]: value }
    setFormData({ ...formData, certifications: newCertifications })
  }

  const getSpecializationLabel = (value: string) => {
    const spec = options?.specializations.find(s => s.value === value)
    return spec ? spec.label : value
  }

  if (!options) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/doctors">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Doctors
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Doctor</h1>
          <p className="text-muted-foreground">
            Add a new doctor to the platform
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="professional">Professional</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Essential details about the doctor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="user_id">Link to User Account</Label>
                    <Select value={formData.user_id} onValueChange={(value) => setFormData({...formData, user_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No user account</SelectItem>
                        {options.users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {[user.first_name, user.last_name].filter(Boolean).join(' ') || user.email} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clinic_id">Clinic</Label>
                    <Select value={formData.clinic_id} onValueChange={(value) => setFormData({...formData, clinic_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a clinic (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No clinic assigned</SelectItem>
                        {options.clinics.map((clinic) => (
                          <SelectItem key={clinic.id} value={clinic.id}>
                            {clinic.name} {clinic.city && clinic.country && `(${clinic.city}, ${clinic.country})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Select value={formData.title} onValueChange={(value) => setFormData({...formData, title: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select title" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.titles.map((title) => (
                          <SelectItem key={title} value={title}>
                            {title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {options.statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="license_number">License Number</Label>
                    <Input
                      id="license_number"
                      value={formData.license_number}
                      onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                      placeholder="Medical license number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="years_of_experience">Years of Experience</Label>
                    <Input
                      id="years_of_experience"
                      type="number"
                      min="0"
                      max="50"
                      value={formData.years_of_experience}
                      onChange={(e) => setFormData({...formData, years_of_experience: e.target.value})}
                      placeholder="Years of experience"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Specializations *</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.specializations.map((spec) => (
                      <Badge key={spec} variant="default" className="flex items-center gap-1">
                        {getSpecializationLabel(spec)}
                        <button
                          type="button"
                          onClick={() => removeSpecialization(spec)}
                          className="ml-1 hover:bg-red-500 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Select onValueChange={addSpecialization}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.specializations
                        .filter(spec => !formData.specializations.includes(spec.value))
                        .map((spec) => (
                          <SelectItem key={spec.value} value={spec.value}>
                            {spec.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="consultation_fee">Consultation Fee (USD)</Label>
                  <Input
                    id="consultation_fee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.consultation_fee}
                    onChange={(e) => setFormData({...formData, consultation_fee: e.target.value})}
                    placeholder="Consultation fee in USD"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="professional" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Education</CardTitle>
                <CardDescription>
                  Academic qualifications and degrees
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.education.map((edu, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Education #{index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeEducation(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Degree</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                          placeholder="e.g., DDS, DMD, PhD"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Institution</Label>
                        <Input
                          value={edu.institution}
                          onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                          placeholder="University or school name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Year</Label>
                        <Input
                          type="number"
                          min="1950"
                          max="2030"
                          value={edu.year || ''}
                          onChange={(e) => updateEducation(index, 'year', e.target.value ? parseInt(e.target.value) : null)}
                          placeholder="Graduation year"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input
                          value={edu.location || ''}
                          onChange={(e) => updateEducation(index, 'location', e.target.value)}
                          placeholder="City, Country"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addEducation}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Education
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Certifications</CardTitle>
                <CardDescription>
                  Professional certifications and licenses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.certifications.map((cert, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Certification #{index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCertification(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Certification Name</Label>
                        <Input
                          value={cert.name}
                          onChange={(e) => updateCertification(index, 'name', e.target.value)}
                          placeholder="Certification name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Issuing Organization</Label>
                        <Input
                          value={cert.issuer}
                          onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                          placeholder="Issuing organization"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Year Obtained</Label>
                        <Input
                          type="number"
                          min="1950"
                          max="2030"
                          value={cert.year || ''}
                          onChange={(e) => updateCertification(index, 'year', e.target.value ? parseInt(e.target.value) : null)}
                          placeholder="Year obtained"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Expiry Date</Label>
                        <Input
                          type="date"
                          value={cert.expiry || ''}
                          onChange={(e) => updateCertification(index, 'expiry', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addCertification}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Certification
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Biography & Content</CardTitle>
                <CardDescription>
                  Detailed information about the doctor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="bio">Biography</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Doctor's biography, background, and expertise..."
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>
                  Search engine optimization settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="seo_title">SEO Title</Label>
                  <Input
                    id="seo_title"
                    value={formData.seo_title}
                    onChange={(e) => setFormData({...formData, seo_title: e.target.value})}
                    placeholder="SEO title for search engines"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo_description">SEO Description</Label>
                  <Textarea
                    id="seo_description"
                    value={formData.seo_description}
                    onChange={(e) => setFormData({...formData, seo_description: e.target.value})}
                    placeholder="SEO description for search engines"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="flex items-center justify-end gap-4">
          <Link href="/admin/doctors">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={loading || !formData.title || formData.specializations.length === 0}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Doctor
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
} 