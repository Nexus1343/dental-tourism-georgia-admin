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
  Eye,
  Edit,
  Trash2,
  Building2,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Loader2
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { ClinicService, QuestionnaireTemplateService, ClinicTemplateService } from "@/lib/database"
import { Clinic, CreateClinic, QuestionnaireTemplate, ClinicQuestionnaireTemplate } from "@/types/database"

// Extended interface for clinic templates with joined template data
interface ClinicQuestionnaireTemplateWithTemplate extends ClinicQuestionnaireTemplate {
  template: QuestionnaireTemplate
}


export default function ClinicsPage() {
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [cityFilter, setCityFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [templateAssignmentClinic, setTemplateAssignmentClinic] = useState<Clinic | null>(null)
  const [availableTemplates, setAvailableTemplates] = useState<QuestionnaireTemplate[]>([])
  const [clinicTemplates, setClinicTemplates] = useState<ClinicQuestionnaireTemplateWithTemplate[]>([])
  const [templateLoading, setTemplateLoading] = useState(false)
  const [assignLoading, setAssignLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [clinicToDelete, setClinicToDelete] = useState<Clinic | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    pending: 0,
    totalTemplateAssignments: 0
  })

  // Load templates data
  const loadTemplates = async () => {
    try {
      const response = await QuestionnaireTemplateService.getAll({
        status: 'active',
        limit: 100
      })
      setAvailableTemplates(response.data)
    } catch (error) {
      console.error('Error loading templates:', error)
      toast.error('Failed to load templates')
    }
  }

  const loadClinicTemplates = async (clinicId: string) => {
    try {
      setTemplateLoading(true)
      const assignments = await ClinicTemplateService.getClinicTemplates(clinicId)
      setClinicTemplates(assignments as ClinicQuestionnaireTemplateWithTemplate[])
    } catch (error) {
      console.error('Error loading clinic templates:', error)
      toast.error('Failed to load clinic templates')
    } finally {
      setTemplateLoading(false)
    }
  }

  // Load clinics on component mount
  useEffect(() => {
    loadClinics()
    loadStats()
    loadTemplates()
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



  const handleDeleteClinic = (clinic: Clinic) => {
    setClinicToDelete(clinic)
    setShowDeleteDialog(true)
  }

  const confirmDeleteClinic = async () => {
    if (!clinicToDelete) return

    try {
      setDeleteLoading(true)
      await ClinicService.delete(clinicToDelete.id)
      toast.success('Clinic deleted successfully')
      loadClinics()
      loadStats()
    } catch (error) {
      console.error('Failed to delete clinic:', error)
      toast.error('Failed to delete clinic')
    } finally {
      setDeleteLoading(false)
      setShowDeleteDialog(false)
      setClinicToDelete(null)
    }
  }

  const handleAssignTemplates = async (clinic: Clinic) => {
    setTemplateAssignmentClinic(clinic)
    setShowTemplateDialog(true)
    await loadClinicTemplates(clinic.id)
  }

  const handleAssignTemplate = async (templateId: string, isDefault: boolean = false) => {
    if (!templateAssignmentClinic) return

    try {
      setAssignLoading(true)
      
      await ClinicTemplateService.assignTemplate(
        templateAssignmentClinic.id,
        templateId,
        { isDefault }
      )
      
      toast.success('Template assigned successfully!')
      
      // Reload clinic templates
      await loadClinicTemplates(templateAssignmentClinic.id)
      
      // Reload stats to update template assignment count
      loadStats()
    } catch (error: any) {
      console.error('Error assigning template:', error)
      toast.error(error?.message || 'Failed to assign template')
    } finally {
      setAssignLoading(false)
    }
  }

  const handleRemoveTemplate = async (assignmentId: string) => {
    try {
      setAssignLoading(true)
      
      await ClinicTemplateService.removeAssignment(assignmentId)
      
      toast.success('Template removed successfully!')
      
      // Reload clinic templates
      if (templateAssignmentClinic) {
        await loadClinicTemplates(templateAssignmentClinic.id)
      }
      
      // Reload stats to update template assignment count
      loadStats()
    } catch (error: any) {
      console.error('Error removing template:', error)
      toast.error(error?.message || 'Failed to remove template')
    } finally {
      setAssignLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building2 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Clinics</h1>
        </div>
        <Link href="/admin/clinics/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Clinic
          </Button>
        </Link>
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search clinics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {allCities.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Clinics Grid */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredClinics.map((clinic) => (
            <Card key={clinic.id} className="relative">
              <CardHeader>
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
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/clinics/${clinic.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/clinics/${clinic.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Clinic
                        </Link>
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



      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Clinic</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{clinicToDelete?.name}&quot;? This action cannot be undone and will permanently remove all clinic data, including any associated templates and submissions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteDialog(false)
                setClinicToDelete(null)
              }}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteClinic}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Clinic
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Assignment Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Templates</DialogTitle>
            <DialogDescription>
              Assign questionnaire templates to {templateAssignmentClinic?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Currently Assigned Templates */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Currently Assigned Templates</h3>
              {templateLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : clinicTemplates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No templates assigned to this clinic yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clinicTemplates.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div>
                            <h4 className="font-medium">{assignment.template.name}</h4>
                            <p className="text-sm text-gray-600">
                              {assignment.template.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>Language: {assignment.template.language}</span>
                              <span>Est. Time: {assignment.template.estimated_completion_minutes} min</span>
                              {assignment.is_default && (
                                <Badge variant="secondary" className="text-xs">Default</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveTemplate(assignment.id)}
                        disabled={assignLoading}
                        className="text-red-600 hover:text-red-700"
                      >
                        {assignLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Available Templates to Assign */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Available Templates</h3>
              {availableTemplates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No templates available for assignment.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableTemplates
                    .filter(template => 
                      !clinicTemplates.some(assignment => assignment.template_id === template.id)
                    )
                    .map((template) => (
                      <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-green-600" />
                            <div>
                              <h4 className="font-medium">{template.name}</h4>
                              <p className="text-sm text-gray-600">
                                {template.description}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span>Language: {template.language}</span>
                                <span>Est. Time: {template.estimated_completion_minutes} min</span>
                                <span>Pages: {template.total_pages}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssignTemplate(template.id, false)}
                            disabled={assignLoading}
                          >
                            {assignLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            Assign
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAssignTemplate(template.id, true)}
                            disabled={assignLoading}
                          >
                            {assignLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
                            Set as Default
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowTemplateDialog(false)
                setTemplateAssignmentClinic(null)
                setClinicTemplates([])
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 