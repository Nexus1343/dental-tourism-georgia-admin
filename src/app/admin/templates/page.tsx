'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { StatusBadge } from "@/components/ui/status-badge"
import { DeleteConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Eye,
  Building2,
  Clock,
  Users
} from "lucide-react"
import Link from "next/link"
import { QuestionnaireTemplate } from "@/types/database"

// Mock data for development - will be replaced with actual API calls
const mockTemplates: QuestionnaireTemplate[] = [
  {
    id: "1",
    name: "Dental Implant Assessment",
    description: "Comprehensive questionnaire for patients considering dental implants",
    version: 2,
    is_active: true,
    language: "en",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-20T14:30:00Z",
    total_pages: 5,
    estimated_completion_minutes: 15,
    configuration: {},
    introduction_text: "Welcome to our dental implant assessment",
    completion_message: "Thank you for completing the assessment"
  },
  {
    id: "2", 
    name: "Orthodontic Consultation",
    description: "Initial consultation form for orthodontic treatments",
    version: 1,
    is_active: false,
    language: "en",
    created_at: "2024-01-10T09:00:00Z",
    updated_at: "2024-01-10T09:00:00Z",
    total_pages: 3,
    estimated_completion_minutes: 10,
    configuration: {},
    introduction_text: "Welcome to our orthodontic consultation",
    completion_message: "Thank you for your interest in orthodontic treatment"
  },
  {
    id: "3",
    name: "General Dental Checkup",
    description: "Standard questionnaire for routine dental checkups",
    version: 3,
    is_active: true,
    language: "en", 
    created_at: "2024-01-05T08:00:00Z",
    updated_at: "2024-01-25T16:00:00Z",
    total_pages: 4,
    estimated_completion_minutes: 8,
    configuration: {},
    introduction_text: "Welcome to our dental checkup questionnaire",
    completion_message: "Thank you for providing your health information"
  },
  {
    id: "4",
    name: "Cosmetic Dentistry Consultation",
    description: "Detailed assessment for cosmetic dental procedures",
    version: 1,
    is_active: true,
    language: "en",
    created_at: "2024-01-22T11:00:00Z", 
    updated_at: "2024-01-22T11:00:00Z",
    total_pages: 6,
    estimated_completion_minutes: 20,
    configuration: {},
    introduction_text: "Welcome to our cosmetic dentistry consultation",
    completion_message: "Thank you for sharing your aesthetic goals"
  }
]

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<QuestionnaireTemplate[]>(mockTemplates)
  const [filteredTemplates, setFilteredTemplates] = useState<QuestionnaireTemplate[]>(mockTemplates)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [languageFilter, setLanguageFilter] = useState<string>("all")
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])

  // Filter templates based on search and filters
  useEffect(() => {
    let filtered = templates

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(template => 
        statusFilter === "active" ? template.is_active : !template.is_active
      )
    }

    // Language filter
    if (languageFilter !== "all") {
      filtered = filtered.filter(template => template.language === languageFilter)
    }

    setFilteredTemplates(filtered)
  }, [templates, searchQuery, statusFilter, languageFilter])

  const handleDeleteTemplate = async (templateId: string) => {
    // TODO: Implement actual delete API call
    setTemplates(prev => prev.filter(t => t.id !== templateId))
    setSelectedTemplates(prev => prev.filter(id => id !== templateId))
  }

  const handleDuplicateTemplate = async (templateId: string) => {
    // TODO: Implement actual duplicate API call
    const template = templates.find(t => t.id === templateId)
    if (template) {
      const duplicated = {
        ...template,
        id: `${templateId}-copy`,
        name: `${template.name} (Copy)`,
        version: 1,
        is_active: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setTemplates(prev => [duplicated, ...prev])
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs 
        items={[
          { label: 'Templates', icon: FileText }
        ]}
      />

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground">
            Manage questionnaire templates for dental clinics
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/templates/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {/* Language Filter */}
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ka">Georgian</SelectItem>
                <SelectItem value="ru">Russian</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter Icon */}
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {filteredTemplates.length} of {templates.length} templates
            </span>
            {selectedTemplates.length > 0 && (
              <span>{selectedTemplates.length} selected</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="relative group hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-lg line-clamp-2">{template.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <StatusBadge 
                      status={template.is_active ? 'active' : 'inactive'} 
                      showIcon={false}
                    />
                    <Badge variant="outline">v{template.version}</Badge>
                  </div>
                </div>

                {/* Template Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/templates/${template.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/templates/${template.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Template
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicateTemplate(template.id)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DeleteConfirmDialog
                      itemName="template"
                      onConfirm={() => handleDeleteTemplate(template.id)}
                    >
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DeleteConfirmDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Description */}
              <CardDescription className="line-clamp-2">
                {template.description}
              </CardDescription>

              {/* Template Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{template.total_pages} pages</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{template.estimated_completion_minutes} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>3 clinics</span> {/* TODO: Get actual count */}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>45 submissions</span> {/* TODO: Get actual count */}
                </div>
              </div>

              {/* Dates */}
              <div className="pt-2 border-t text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Created: {formatDate(template.created_at)}</span>
                  <span>Updated: {formatDate(template.updated_at)}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" asChild>
                  <Link href={`/admin/templates/${template.id}/edit`}>
                    <Edit className="mr-2 h-3 w-3" />
                    Edit
                  </Link>
                </Button>
                <Button size="sm" variant="outline" className="flex-1" asChild>
                  <Link href={`/admin/preview?template=${template.id}`}>
                    <Eye className="mr-2 h-3 w-3" />
                    Preview
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== "all" || languageFilter !== "all" 
                ? "Try adjusting your search or filters"
                : "Get started by creating your first questionnaire template"
              }
            </p>
            <Button asChild>
              <Link href="/admin/templates/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Template
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pagination - TODO: Implement actual pagination */}
      {filteredTemplates.length > 0 && (
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page 1 of 1
            </span>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 