'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, Calendar, DollarSign, Award, BookOpen, Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

interface Doctor {
  id: string
  title: string
  specializations: string[]
  status: 'active' | 'inactive' | 'on_leave' | 'suspended'
  license_number: string | null
  years_of_experience: number | null
  education: Array<{
    degree: string
    institution: string
    year: number | null
    location?: string
  }>
  certifications: Array<{
    name: string
    issuer: string
    year: number | null
    expiry?: string
  }>
  languages: string[]
  bio: string | null
  consultation_fee: number | null
  profile_image_url: string | null
  gallery_images: string[]
  achievements: Array<{
    title: string
    year: number | null
    description?: string
  }>
  publications: Array<{
    title: string
    journal: string
    year: number | null
    url?: string
  }>
  availability_schedule: any
  seo_title: string | null
  seo_description: string | null
  created_at: string
  updated_at: string
  users: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string
    phone: string | null
    preferred_language: string | null
  } | null
  clinics: {
    id: string
    name: string
    slug: string
    city: string | null
    country: string | null
    address: string | null
    phone: string | null
    email: string | null
  } | null
}

export default function DoctorDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const doctorId = params.id as string

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/doctors/${doctorId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Doctor not found')
          }
          throw new Error('Failed to fetch doctor')
        }

        const data = await response.json()
        setDoctor(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchDoctor()
  }, [doctorId])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this doctor?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/doctors/${doctorId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete doctor')
      }

      router.push('/admin/doctors')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete doctor')
    }
  }

  const getStatusBadge = (status: Doctor['status']) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      on_leave: 'outline',
      suspended: 'destructive'
    } as const

    const labels = {
      active: 'Active',
      inactive: 'Inactive',
      on_leave: 'On Leave',
      suspended: 'Suspended'
    }

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    )
  }

  const getDoctorName = (doctor: Doctor) => {
    if (!doctor.users) return 'N/A'
    const { first_name, last_name } = doctor.users
    return [first_name, last_name].filter(Boolean).join(' ') || doctor.users.email
  }

  const getDoctorInitials = (doctor: Doctor) => {
    if (!doctor.users) return 'NA'
    const { first_name, last_name } = doctor.users
    return `${first_name?.[0] || ''}${last_name?.[0] || ''}`.toUpperCase() || doctor.users.email[0].toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !doctor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/doctors">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Doctors
            </Button>
          </Link>
        </div>
        <div className="text-center text-red-500 h-32 flex items-center justify-center">
          {error || 'Doctor not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/doctors">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Doctors
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {doctor.title} {getDoctorName(doctor)}
            </h1>
            <p className="text-muted-foreground">
              Doctor Details and Profile Information
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/doctors/${doctor.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
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
                <Avatar className="h-20 w-20">
                  <AvatarImage src={doctor.profile_image_url || undefined} />
                  <AvatarFallback className="text-lg">{getDoctorInitials(doctor)}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {doctor.title} {getDoctorName(doctor)}
                    </h2>
                    <p className="text-muted-foreground">{doctor.users?.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(doctor.status)}
                    {doctor.license_number && (
                      <Badge variant="outline">
                        License: {doctor.license_number}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Specializations */}
              <div>
                <h4 className="font-semibold mb-2">Specializations</h4>
                <div className="flex flex-wrap gap-2">
                  {doctor.specializations.map((spec, index) => (
                    <Badge key={index} variant="secondary">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Bio */}
              {doctor.bio && (
                <div>
                  <h4 className="font-semibold mb-2">Biography</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{doctor.bio}</p>
                </div>
              )}

              {/* Contact Info */}
              <div>
                <h4 className="font-semibold mb-2">Contact Information</h4>
                <div className="space-y-2">
                  {doctor.users?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{doctor.users.email}</span>
                    </div>
                  )}
                  {doctor.users?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{doctor.users.phone}</span>
                    </div>
                  )}
                  {doctor.clinics && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {doctor.clinics.name}
                        {doctor.clinics.city && doctor.clinics.country && 
                          `, ${doctor.clinics.city}, ${doctor.clinics.country}`
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          {doctor.education && doctor.education.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {doctor.education.map((edu, index) => (
                    <div key={index} className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{edu.degree}</h4>
                        <p className="text-muted-foreground">{edu.institution}</p>
                        {edu.location && (
                          <p className="text-sm text-muted-foreground">{edu.location}</p>
                        )}
                      </div>
                      {edu.year && (
                        <Badge variant="outline">{edu.year}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Certifications */}
          {doctor.certifications && doctor.certifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {doctor.certifications.map((cert, index) => (
                    <div key={index} className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{cert.name}</h4>
                        <p className="text-muted-foreground">{cert.issuer}</p>
                      </div>
                      <div className="text-right">
                        {cert.year && (
                          <Badge variant="outline">{cert.year}</Badge>
                        )}
                        {cert.expiry && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Expires: {new Date(cert.expiry).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {doctor.years_of_experience && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Experience</span>
                  </div>
                  <span className="font-medium">{doctor.years_of_experience} years</span>
                </div>
              )}

              {doctor.consultation_fee && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Consultation Fee</span>
                  </div>
                  <span className="font-medium">${doctor.consultation_fee}</span>
                </div>
              )}

              {doctor.languages && doctor.languages.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Languages className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Languages</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {doctor.languages.map((lang, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {lang.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Info */}
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <span className="text-muted-foreground">Created:</span>
                <br />
                {new Date(doctor.created_at).toLocaleDateString()}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Last Updated:</span>
                <br />
                {new Date(doctor.updated_at).toLocaleDateString()}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Doctor ID:</span>
                <br />
                <code className="text-xs bg-muted px-1 py-0.5 rounded">{doctor.id}</code>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 