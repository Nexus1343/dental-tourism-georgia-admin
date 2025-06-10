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
  Image
} from "lucide-react"

interface Clinic {
  id: string
  name: string
  description: string
  email: string
  phone: string
  website: string
  address: {
    street: string
    city: string
    country: string
    postal_code: string
  }
  specialties: string[]
  status: 'active' | 'inactive' | 'pending'
  created_at: string
  updated_at: string
  // Template assignment info
  assigned_templates: number
  active_templates: number
  pending_assignments: number
  last_assignment: string
  // Stats
  total_responses: number
  completion_rate: number
  avg_rating: number
}

// Mock clinic data - In real app, this would come from Supabase
const mockClinics: Clinic[] = [
  {
    id: "1",
    name: "Smile Perfect Dental Clinic",
    description: "Leading cosmetic and restorative dentistry clinic in Tbilisi specializing in dental tourism.",
    email: "info@smileperfect.ge",
    phone: "+995 32 2 15 25 35",
    website: "https://smileperfect.ge",
    address: {
      street: "12 Rustaveli Avenue",
      city: "Tbilisi",
      country: "Georgia",
      postal_code: "0108"
    },
    specialties: ["Cosmetic Dentistry", "Dental Implants", "Orthodontics", "Veneers"],
    status: "active",
    created_at: "2024-01-15T09:00:00Z",
    updated_at: "2024-12-15T14:30:00Z",
    assigned_templates: 5,
    active_templates: 4,
    pending_assignments: 1,
    last_assignment: "2024-12-10T10:00:00Z",
    total_responses: 247,
    completion_rate: 89,
    avg_rating: 4.8
  },
  {
    id: "2", 
    name: "Georgian Dental Care",
    description: "Comprehensive dental services with modern technology and international standards.",
    email: "contact@georgiandental.com",
    phone: "+995 32 2 25 35 45",
    website: "https://georgiandental.com",
    address: {
      street: "45 Chavchavadze Avenue",
      city: "Tbilisi",
      country: "Georgia", 
      postal_code: "0179"
    },
    specialties: ["General Dentistry", "Oral Surgery", "Periodontics", "Endodontics"],
    status: "active",
    created_at: "2024-02-20T11:30:00Z",
    updated_at: "2024-12-14T16:45:00Z",
    assigned_templates: 3,
    active_templates: 3,
    pending_assignments: 0,
    last_assignment: "2024-12-05T14:20:00Z",
    total_responses: 156,
    completion_rate: 92,
    avg_rating: 4.6
  },
  {
    id: "3",
    name: "Batumi Dental Excellence",
    description: "Premium dental clinic serving international patients with luxury amenities.",
    email: "hello@batumidental.ge",
    phone: "+995 422 25 15 85",
    website: "https://batumidental.ge",
    address: {
      street: "8 Baratashvili Street", 
      city: "Batumi",
      country: "Georgia",
      postal_code: "6010"
    },
    specialties: ["Dental Tourism", "Cosmetic Dentistry", "Implantology", "Prosthodontics"],
    status: "active",
    created_at: "2024-03-10T13:45:00Z",
    updated_at: "2024-12-12T09:15:00Z",
    assigned_templates: 7,
    active_templates: 6,
    pending_assignments: 2,
    last_assignment: "2024-12-08T11:30:00Z",
    total_responses: 198,
    completion_rate: 85,
    avg_rating: 4.9
  },
  {
    id: "4",
    name: "Kutaisi Modern Dentistry",
    description: "State-of-the-art dental facility offering comprehensive oral healthcare solutions.",
    email: "info@kutaisidental.ge",
    phone: "+995 431 24 15 75",
    website: "https://kutaisidental.ge",
    address: {
      street: "22 King David the Builder Avenue",
      city: "Kutaisi", 
      country: "Georgia",
      postal_code: "4600"
    },
    specialties: ["Family Dentistry", "Pediatric Dentistry", "Orthodontics", "Oral Surgery"],
    status: "pending",
    created_at: "2024-11-25T08:20:00Z",
    updated_at: "2024-12-01T12:10:00Z",
    assigned_templates: 0,
    active_templates: 0,
    pending_assignments: 0,
    last_assignment: "",
    total_responses: 0,
    completion_rate: 0,
    avg_rating: 0
  },
  {
    id: "5",
    name: "European Dental Center",
    description: "International dental clinic with European standards and multilingual staff.",
    email: "contact@europeandental.ge",
    phone: "+995 32 2 35 45 55",
    website: "https://europeandental.ge",
    address: {
      street: "67 Pekini Avenue",
      city: "Tbilisi",
      country: "Georgia",
      postal_code: "0160"
    },
    specialties: ["Digital Dentistry", "Dental Implants", "Cosmetic Surgery", "Rehabilitation"],
    status: "inactive",
    created_at: "2024-01-08T10:15:00Z", 
    updated_at: "2024-10-20T15:30:00Z",
    assigned_templates: 2,
    active_templates: 0,
    pending_assignments: 0,
    last_assignment: "2024-08-15T09:45:00Z",
    total_responses: 89,
    completion_rate: 78,
    avg_rating: 4.3
  }
]

export default function ClinicsPage() {
  const [clinics, setClinics] = useState<Clinic[]>(mockClinics)
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>(mockClinics)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [cityFilter, setCityFilter] = useState<string>("all")
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all")
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Filter and search logic
  useEffect(() => {
    const filtered = clinics.filter(clinic => {
      const matchesSearch = 
        clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchTerm.toLowerCase())
        )

      const matchesStatus = statusFilter === "all" || clinic.status === statusFilter
      const matchesCity = cityFilter === "all" || clinic.address.city === cityFilter
      const matchesSpecialty = specialtyFilter === "all" || 
        clinic.specialties.some(specialty => specialty === specialtyFilter)

      return matchesSearch && matchesStatus && matchesCity && matchesSpecialty
    })

    setFilteredClinics(filtered)
  }, [searchTerm, statusFilter, cityFilter, specialtyFilter, clinics])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-3 w-3" />
      case 'inactive': return <XCircle className="h-3 w-3" />
      case 'pending': return <Clock className="h-3 w-3" />
      default: return null
    }
  }

  const allCities = [...new Set(clinics.map(clinic => clinic.address.city))]
  const allSpecialties = [...new Set(clinics.flatMap(clinic => clinic.specialties))]

  const handleViewClinic = (clinic: Clinic) => {
    setSelectedClinic(clinic)
    setShowDetailDialog(true)
  }

  const handleEditClinic = (clinic: Clinic) => {
    // TODO: Navigate to edit page
    console.log('Edit clinic:', clinic.id)
  }

  const handleDeleteClinic = (clinic: Clinic) => {
    // TODO: Show delete confirmation
    console.log('Delete clinic:', clinic.id)
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
                <div className="text-2xl font-bold">{clinics.length}</div>
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
                <div className="text-2xl font-bold">
                  {clinics.filter(c => c.status === 'active').length}
                </div>
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
                <div className="text-2xl font-bold">
                  {clinics.reduce((sum, c) => sum + c.assigned_templates, 0)}
                </div>
                <div className="text-sm text-gray-600">Template Assignments</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(clinics.reduce((sum, c) => sum + c.completion_rate, 0) / clinics.filter(c => c.completion_rate > 0).length) || 0}%
                </div>
                <div className="text-sm text-gray-600">Avg Completion</div>
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
                  <SelectItem value="pending">Pending</SelectItem>
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

              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  {allSpecialties.map(specialty => (
                    <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clinic Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                    {clinic.avg_rating > 0 && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{clinic.avg_rating}</span>
                      </div>
                    )}
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
              <CardDescription className="mb-4 line-clamp-2">
                {clinic.description}
              </CardDescription>
              
              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{clinic.address.city}, {clinic.address.country}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{clinic.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{clinic.email}</span>
                </div>
              </div>

              {/* Specialties */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {clinic.specialties.slice(0, 2).map((specialty) => (
                    <Badge key={specialty} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                  {clinic.specialties.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{clinic.specialties.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Template Assignment Stats */}
              <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">{clinic.assigned_templates}</div>
                  <div className="text-xs text-gray-600">Templates</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">{clinic.total_responses}</div>
                  <div className="text-xs text-gray-600">Responses</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-purple-600">{clinic.completion_rate}%</div>
                  <div className="text-xs text-gray-600">Complete</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClinics.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No clinics found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search terms or filters.</p>
          <Button onClick={() => {
            setSearchTerm("")
            setStatusFilter("all")
            setCityFilter("all") 
            setSpecialtyFilter("all")
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
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{selectedClinic.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{selectedClinic.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <a href={selectedClinic.website} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-600 hover:underline">
                        {selectedClinic.website}
                      </a>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <div>{selectedClinic.address.street}</div>
                        <div>{selectedClinic.address.city}, {selectedClinic.address.country}</div>
                        <div>{selectedClinic.address.postal_code}</div>
                      </div>
                    </div>
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
                    <div>
                      <span className="text-sm font-medium">Specialties:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedClinic.specialties.map((specialty) => (
                          <Badge key={specialty} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Created:</span>
                      <span className="ml-2">{new Date(selectedClinic.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Assignment Stats */}
              <div>
                <h4 className="font-medium mb-3">Template Assignments</h4>
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedClinic.assigned_templates}</div>
                      <div className="text-sm text-gray-600">Assigned Templates</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedClinic.active_templates}</div>
                      <div className="text-sm text-gray-600">Active Templates</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">{selectedClinic.pending_assignments}</div>
                      <div className="text-sm text-gray-600">Pending Assignments</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">{selectedClinic.total_responses}</div>
                      <div className="text-sm text-gray-600">Total Responses</div>
                    </CardContent>
                  </Card>
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
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Clinic</DialogTitle>
            <DialogDescription>
              Create a new dental clinic profile.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-8 text-gray-500">
            <Plus className="h-12 w-12 mx-auto mb-2" />
            <p>Clinic creation form will be implemented here.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button>
              Create Clinic
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 