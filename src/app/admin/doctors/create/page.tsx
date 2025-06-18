'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, X, Upload, Plus, FileText, ExternalLink } from 'lucide-react'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  document_url?: string
}

interface Certification {
  name: string
  issuer: string
  year: number | null
  expiry?: string
  document_url?: string
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
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingEducationDoc, setUploadingEducationDoc] = useState<number | null>(null)
  const [uploadingCertificationDoc, setUploadingCertificationDoc] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const educationFileInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const certificationFileInputRefs = useRef<(HTMLInputElement | null)[]>([])
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
      education: [...formData.education, { degree: '', institution: '', year: null, location: '', document_url: '' }]
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
      certifications: [...formData.certifications, { name: '', issuer: '', year: null, expiry: '', document_url: '' }]
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

  const handleImageUpload = async (file: File) => {
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, or WebP)')
      return
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      alert('Please select an image smaller than 5MB')
      return
    }

    setUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('uploadType', 'doctor-profile')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        const imageUrl = result.data.publicUrl || result.data.url
        setFormData(prev => ({
          ...prev,
          profile_image_url: imageUrl
        }))
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const openFileSelector = () => {
    fileInputRef.current?.click()
  }

  const removeProfileImage = () => {
    setFormData(prev => ({
      ...prev,
      profile_image_url: ''
    }))
  }

  const getDoctorInitials = () => {
    if (!options?.users) return 'DR'
    
    const selectedUser = options.users.find(u => u.id === formData.user_id)
    if (!selectedUser) return 'DR'
    
    const { first_name, last_name } = selectedUser
    return `${first_name?.[0] || ''}${last_name?.[0] || ''}`.toUpperCase() || selectedUser.email[0].toUpperCase()
  }

  const handleEducationDocumentUpload = async (file: File, educationIndex: number) => {
    if (!file) return

    // Validate file type (allow documents and images)
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid document file (PDF, Word, or Image)')
      return
    }

    // Validate file size (10MB limit for documents)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      alert('Please select a file smaller than 10MB')
      return
    }

    setUploadingEducationDoc(educationIndex)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('uploadType', 'education-document')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      })

      if (!response.ok) {
        throw new Error('Failed to upload document')
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        const documentUrl = result.data.publicUrl || result.data.url
        updateEducation(educationIndex, 'document_url', documentUrl)
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload document. Please try again.')
    } finally {
      setUploadingEducationDoc(null)
    }
  }

  const handleCertificationDocumentUpload = async (file: File, certificationIndex: number) => {
    if (!file) return

    // Validate file type (allow documents and images) 
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid document file (PDF, Word, or Image)')
      return
    }

    // Validate file size (10MB limit for documents)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      alert('Please select a file smaller than 10MB')
      return
    }

    setUploadingCertificationDoc(certificationIndex)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('uploadType', 'certification-document')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      })

      if (!response.ok) {
        throw new Error('Failed to upload document')
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        const documentUrl = result.data.publicUrl || result.data.url
        updateCertification(certificationIndex, 'document_url', documentUrl)
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload document. Please try again.')
    } finally {
      setUploadingCertificationDoc(null)
    }
  }

  const handleEducationFileSelect = (e: React.ChangeEvent<HTMLInputElement>, educationIndex: number) => {
    const file = e.target.files?.[0]
    if (file) {
      handleEducationDocumentUpload(file, educationIndex)
    }
  }

  const handleCertificationFileSelect = (e: React.ChangeEvent<HTMLInputElement>, certificationIndex: number) => {
    const file = e.target.files?.[0]
    if (file) {
      handleCertificationDocumentUpload(file, certificationIndex)
    }
  }

  const openEducationFileSelector = (educationIndex: number) => {
    educationFileInputRefs.current[educationIndex]?.click()
  }

  const openCertificationFileSelector = (certificationIndex: number) => {
    certificationFileInputRefs.current[certificationIndex]?.click()
  }

  const removeEducationDocument = (educationIndex: number) => {
    updateEducation(educationIndex, 'document_url', '')
  }

  const removeCertificationDocument = (certificationIndex: number) => {    
    updateCertification(certificationIndex, 'document_url', '')
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
                {/* Profile Picture Upload */}
                <div className="space-y-4">
                  <Label>Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={formData.profile_image_url || undefined} />
                      <AvatarFallback className="text-lg">
                        {getDoctorInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={openFileSelector}
                        disabled={uploadingImage}
                        className="flex items-center gap-2"
                      >
                        {uploadingImage ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            Upload Photo
                          </>
                        )}
                      </Button>
                      {formData.profile_image_url && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={removeProfileImage}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                          Remove
                        </Button>
                      )}
                      <p className="text-xs text-muted-foreground">
                        JPEG, PNG, or WebP. Max 5MB.
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

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

                    {/* Document Upload Section */}
                    <div className="space-y-3 pt-2 border-t">
                      <Label>Supporting Document</Label>
                      <div className="flex items-center gap-3">
                        {edu.document_url ? (
                          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-md border border-green-200">
                            <FileText className="h-4 w-4" />
                            <span>Document uploaded</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(edu.document_url, '_blank')}
                              className="p-1 h-auto"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            No document uploaded
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openEducationFileSelector(index)}
                            disabled={uploadingEducationDoc === index}
                            className="flex items-center gap-2"
                          >
                            {uploadingEducationDoc === index ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4" />
                                {edu.document_url ? 'Replace' : 'Upload'}
                              </>
                            )}
                          </Button>
                          {edu.document_url && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeEducationDocument(index)}
                              className="flex items-center gap-2 text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Upload diploma, certificate, or transcript (PDF, Word, or Image. Max 10MB)
                      </p>
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

                    {/* Document Upload Section */}
                    <div className="space-y-3 pt-2 border-t">
                      <Label>Supporting Document</Label>
                      <div className="flex items-center gap-3">
                        {cert.document_url ? (
                          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-md border border-green-200">
                            <FileText className="h-4 w-4" />
                            <span>Document uploaded</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(cert.document_url, '_blank')}
                              className="p-1 h-auto"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            No document uploaded
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openCertificationFileSelector(index)}
                            disabled={uploadingCertificationDoc === index}
                            className="flex items-center gap-2"
                          >
                            {uploadingCertificationDoc === index ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4" />
                                {cert.document_url ? 'Replace' : 'Upload'}
                              </>
                            )}
                          </Button>
                          {cert.document_url && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeCertificationDocument(index)}
                              className="flex items-center gap-2 text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Upload certificate or license document (PDF, Word, or Image. Max 10MB)
                      </p>
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

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {/* Education Document Inputs */}
        {formData.education.map((_, index) => (
          <input
            key={`education-${index}`}
            ref={(el) => { educationFileInputRefs.current[index] = el }}
            type="file"
            accept="application/pdf,image/jpeg,image/jpg,image/png,image/webp,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => handleEducationFileSelect(e, index)}
            className="hidden"
          />
        ))}
        
        {/* Certification Document Inputs */}
        {formData.certifications.map((_, index) => (
          <input
            key={`certification-${index}`}
            ref={(el) => { certificationFileInputRefs.current[index] = el }}
            type="file"
            accept="application/pdf,image/jpeg,image/jpg,image/png,image/webp,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => handleCertificationFileSelect(e, index)}
            className="hidden"
          />
        ))}
      </form>
    </div>
  )
} 