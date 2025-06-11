'use client'

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Search,
  Filter,
  Plus,
  MoreVertical,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Calendar,
  Settings,
  Eye,
  Edit,
  Trash2,
  Building2,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  FileText,
  Image,
  Loader2
} from "lucide-react"
import { toast } from "sonner"
import { ClinicService } from "@/lib/database"
import { Clinic, CreateClinic } from "@/types/database"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

// Form validation schema
const createClinicSchema = z.object({
  name: z.string().min(1, "Clinic name is required").max(255, "Name too long"),
  slug: z.string().min(1, "Slug is required").max(255, "Slug too long").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  status: z.enum(["active", "inactive", "pending_approval", "suspended"]),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  website: z.string().url("Invalid URL format").optional().or(z.literal("")),
  established_year: z.number().min(1800).max(new Date().getFullYear()).optional(),
  license_number: z.string().optional(),
})

type CreateClinicForm = z.infer<typeof createClinicSchema>

// Default form values to prevent controlled/uncontrolled input issues
const getDefaultFormValues = (): CreateClinicForm => ({
  name: "",
  slug: "",
  status: "pending_approval",
  description: "",
  address: "",
  city: "",
  country: "Georgia",
  phone: "",
  email: "",
  website: "",
  license_number: "",
  established_year: undefined,
})

export default function ClinicsPage() {
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [cityFilter, setCityFilter] = useState<string>("all")
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null)
  const [loading, setLoading] = useState(true)
  const [createLoading, setCreateLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    pending: 0,
    totalTemplateAssignments: 0
  })

  // Form for creating clinics
  const form = useForm<CreateClinicForm>({
    resolver: zodResolver(createClinicSchema),
    defaultValues: getDefaultFormValues(),
    mode: "onChange"
  })

  // Form for editing clinics
  const editForm = useForm<CreateClinicForm>({
    resolver: zodResolver(createClinicSchema),
    defaultValues: getDefaultFormValues(),
    mode: "onChange"
  })

  // Load clinics on component mount
  useEffect(() => {
    loadClinics()
    loadStats()
  }, [])

  const loadClinics = async () => {
    try {
      setLoading(true)
      const response = await ClinicService.getAll()
      setClinics(response.data)
      setFilteredClinics(response.data)
    } catch (error) {
      console.error('Failed to load clinics:', error)
      toast.error('Failed to load clinics')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statistics = await ClinicService.getStatistics()
      setStats(statistics)
    } catch (error) {
      console.error('Failed to load statistics:', error)
    }
  }

  // Filter and search logic
  useEffect(() => {
    const filtered = clinics.filter(clinic => {
      const matchesSearch = 
        clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (clinic.description && clinic.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (clinic.city && clinic.city.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = statusFilter === "all" || clinic.status === statusFilter
      const matchesCity = cityFilter === "all" || clinic.city === cityFilter

      return matchesSearch && matchesStatus && matchesCity
    })

    setFilteredClinics(filtered)
  }, [searchTerm, statusFilter, cityFilter, clinics])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200'
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'suspended': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-3 w-3" />
      case 'inactive': return <XCircle className="h-3 w-3" />
      case 'pending_approval': return <Clock className="h-3 w-3" />
      case 'suspended': return <XCircle className="h-3 w-3" />
      default: return null
    }
  }

  const allCities = [...new Set(clinics.map(clinic => clinic.city).filter((city): city is string => Boolean(city)))]

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
  }

  // Handle name change and auto-generate slug
  const handleNameChange = (name: string) => {
    form.setValue('name', name)
    if (name) {
      const slug = generateSlug(name)
      form.setValue('slug', slug)
    }
  }

  // Handle name change and auto-generate slug for edit form
  const handleEditNameChange = (name: string) => {
    editForm.setValue('name', name)
    if (name) {
      const slug = generateSlug(name)
      editForm.setValue('slug', slug)
    }
  }

  // Submit form
  const onSubmit = async (data: CreateClinicForm) => {
    try {
      setCreateLoading(true)
      
      console.log('Form data submitted:', data)
      
      // Check if slug already exists
      const slugExists = await ClinicService.checkSlugExists(data.slug)
      if (slugExists) {
        form.setError('slug', { message: 'This slug already exists. Please choose a different one.' })
        return
      }

      // Convert form data to CreateClinic format
      const clinicData: CreateClinic = {
        ...data,
        email: data.email || undefined,
        website: data.website || undefined,
        established_year: data.established_year || undefined,
        accreditations: [],
        facilities: [],
        languages_spoken: [],
        images: [],
        seo_keywords: [],
      }

      console.log('Sending clinic data to API:', clinicData)
      
      const result = await ClinicService.create(clinicData)
      console.log('Clinic created successfully:', result)
      
      toast.success('Clinic created successfully!')
      
      // Reset form and close dialog
      form.reset(getDefaultFormValues())
      setShowCreateDialog(false)
      
      // Reload data
      loadClinics()
      loadStats()
    } catch (error: any) {
      console.error('Detailed error creating clinic:', {
        error,
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        stack: error?.stack
      })
      
      let errorMessage = 'Failed to create clinic'
      
      if (error?.message) {
        errorMessage = error.message
      } else if (error?.details) {
        errorMessage = error.details
      } else if (error?.hint) {
        errorMessage = error.hint
      }
      
      toast.error(errorMessage)
    } finally {
      setCreateLoading(false)
    }
  }

  // Submit edit form
  const onEditSubmit = async (data: CreateClinicForm) => {
    if (!editingClinic) return

    try {
      setEditLoading(true)
      
      console.log('Edit form data submitted:', data)
      
      // Check if slug already exists (excluding current clinic)
      const slugExists = await ClinicService.checkSlugExists(data.slug, editingClinic.id)
      if (slugExists) {
        editForm.setError('slug', { message: 'This slug already exists. Please choose a different one.' })
        return
      }

      // Convert form data to update format
      const updateData: Partial<CreateClinic> = {
        ...data,
        email: data.email || undefined,
        website: data.website || undefined,
        established_year: data.established_year || undefined,
      }

      console.log('Sending update data to API:', updateData)
      
      const result = await ClinicService.update(editingClinic.id, updateData)
      console.log('Clinic updated successfully:', result)
      
      toast.success('Clinic updated successfully!')
      
      // Reset form and close dialog
      editForm.reset(getDefaultFormValues())
      setShowEditDialog(false)
      setEditingClinic(null)
      
      // Reload data
      loadClinics()
      loadStats()
    } catch (error: any) {
      console.error('Detailed error updating clinic:', {
        error,
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        stack: error?.stack
      })
      
      let errorMessage = 'Failed to update clinic'
      
      if (error?.message) {
        errorMessage = error.message
      } else if (error?.details) {
        errorMessage = error.details
      } else if (error?.hint) {
        errorMessage = error.hint
      }
      
      toast.error(errorMessage)
    } finally {
      setEditLoading(false)
    }
  }

  const handleViewClinic = (clinic: Clinic) => {
    setSelectedClinic(clinic)
    setShowDetailDialog(true)
  }

  const handleEditClinic = (clinic: Clinic) => {
    setEditingClinic(clinic)
    
    // Pre-populate the edit form with clinic data
    editForm.reset({
      name: clinic.name,
      slug: clinic.slug,
      status: clinic.status,
      description: clinic.description || "",
      address: clinic.address || "",
      city: clinic.city || "",
      country: clinic.country,
      phone: clinic.phone || "",
      email: clinic.email || "",
      website: clinic.website || "",
      license_number: clinic.license_number || "",
      established_year: clinic.established_year,
    })
    
    setShowEditDialog(true)
  }

  const handleDeleteClinic = async (clinic: Clinic) => {
    if (confirm('Are you sure you want to delete this clinic? This action cannot be undone.')) {
      try {
        await ClinicService.delete(clinic.id)
        toast.success('Clinic deleted successfully')
        loadClinics()
        loadStats()
      } catch (error) {
        console.error('Failed to delete clinic:', error)
        toast.error('Failed to delete clinic')
      }
    }
  }

  const handleAssignTemplates = (clinic: Clinic) => {
    // TODO: Navigate to template assignment page
    console.log('Assign templates to clinic:', clinic.id)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clinics</h1>
          <p className="text-gray-600 mt-1">
            Manage dental clinics and their questionnaire template assignments
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Clinic
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Clinics</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{stats.active}</div>
                <div className="text-sm text-gray-600">Active Clinics</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{stats.totalTemplateAssignments}</div>
                <div className="text-sm text-gray-600">Template Assignments</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold">{stats.inactive}</div>
                <div className="text-sm text-gray-600">Inactive Clinics</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search clinics by name, city, or specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {allCities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clinics Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClinics.map((clinic) => (
            <Card key={clinic.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{clinic.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`${getStatusColor(clinic.status)} text-xs`}>
                        {getStatusIcon(clinic.status)}
                        <span className="ml-1 capitalize">{clinic.status}</span>
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewClinic(clinic)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditClinic(clinic)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Clinic
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAssignTemplates(clinic)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Assign Templates
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteClinic(clinic)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                {clinic.description && (
                  <CardDescription className="mb-4 line-clamp-2">
                    {clinic.description}
                  </CardDescription>
                )}
                
                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  {clinic.city && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{clinic.city}, {clinic.country}</span>
                    </div>
                  )}
                  {clinic.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{clinic.phone}</span>
                    </div>
                  )}
                  {clinic.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{clinic.email}</span>
                    </div>
                  )}
                </div>

                {/* Facilities */}
                {clinic.facilities && clinic.facilities.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {clinic.facilities.slice(0, 2).map((facility) => (
                        <Badge key={facility} variant="outline" className="text-xs">
                          {facility}
                        </Badge>
                      ))}
                      {clinic.facilities.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{clinic.facilities.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Created Date */}
                <div className="text-xs text-gray-500">
                  Created: {new Date(clinic.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredClinics.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No clinics found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search terms or filters.</p>
          <Button onClick={() => {
            setSearchTerm("")
            setStatusFilter("all")
            setCityFilter("all")
          }}>
            Clear Filters
          </Button>
        </div>
      )}

      {/* Clinic Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {selectedClinic?.name}
            </DialogTitle>
            <DialogDescription>
              Detailed clinic information and template assignments
            </DialogDescription>
          </DialogHeader>
          
          {selectedClinic && (
            <div className="space-y-6">
              {/* Clinic Info */}
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-3">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    {selectedClinic.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{selectedClinic.email}</span>
                      </div>
                    )}
                    {selectedClinic.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{selectedClinic.phone}</span>
                      </div>
                    )}
                    {selectedClinic.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <a href={selectedClinic.website} target="_blank" rel="noopener noreferrer" 
                           className="text-blue-600 hover:underline">
                          {selectedClinic.website}
                        </a>
                      </div>
                    )}
                    {selectedClinic.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <div>{selectedClinic.address}</div>
                          {selectedClinic.city && (
                            <div>{selectedClinic.city}, {selectedClinic.country}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Clinic Details</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium">Status:</span>
                      <Badge className={`ml-2 ${getStatusColor(selectedClinic.status)}`}>
                        {getStatusIcon(selectedClinic.status)}
                        <span className="ml-1 capitalize">{selectedClinic.status}</span>
                      </Badge>
                    </div>
                    {selectedClinic.facilities && selectedClinic.facilities.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">Facilities:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedClinic.facilities.map((facility) => (
                            <Badge key={facility} variant="outline" className="text-xs">
                              {facility}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedClinic.languages_spoken && selectedClinic.languages_spoken.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">Languages:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedClinic.languages_spoken.map((language) => (
                            <Badge key={language} variant="outline" className="text-xs">
                              {language}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="text-sm">
                      <span className="font-medium">Created:</span>
                      <span className="ml-2">{new Date(selectedClinic.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Close
            </Button>
            <Button onClick={() => selectedClinic && handleAssignTemplates(selectedClinic)}>
              <FileText className="mr-2 h-4 w-4" />
              Manage Templates
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Clinic Dialog */}
      <Dialog 
        open={showCreateDialog} 
        onOpenChange={(open) => {
          if (!open) {
            form.reset(getDefaultFormValues())
          }
          setShowCreateDialog(open)
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Clinic</DialogTitle>
            <DialogDescription>
              Create a new dental clinic profile.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Basic Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clinic Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter clinic name"
                          {...field}
                          onChange={(e) => handleNameChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Slug *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="clinic-url-slug"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Used in URLs. Auto-generated from name.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description of the clinic"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Georgia">Georgia</SelectItem>
                          <SelectItem value="Turkey">Turkey</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Tbilisi"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Full street address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Contact Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+995 32 2 XX XX XX"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="contact@clinic.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://clinic.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Additional Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending_approval">Pending Approval</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="established_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Established Year</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="2020"
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value ? parseInt(e.target.value) : undefined
                            field.onChange(value)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="license_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Medical license number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    form.reset(getDefaultFormValues())
                    setShowCreateDialog(false)
                  }}
                  disabled={createLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createLoading}>
                  {createLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Clinic
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Clinic Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Clinic</DialogTitle>
            <DialogDescription>
              Update clinic information. Changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clinic Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter clinic name"
                          {...field}
                          onChange={(e) => handleEditNameChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Slug *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="clinic-url-slug"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This will be used in the clinic&apos;s URL
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description of the clinic"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={editForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Georgia">Georgia</SelectItem>
                          <SelectItem value="Turkey">Turkey</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Tbilisi"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Full street address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Contact Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={editForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+995 32 2 XX XX XX"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="contact@clinic.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://clinic.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Additional Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending_approval">Pending Approval</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="established_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Established Year</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="2020"
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value ? parseInt(e.target.value) : undefined
                            field.onChange(value)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="license_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Medical license number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    editForm.reset(getDefaultFormValues())
                    setShowEditDialog(false)
                    setEditingClinic(null)
                  }}
                  disabled={editLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={editLoading}>
                  {editLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Clinic
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 