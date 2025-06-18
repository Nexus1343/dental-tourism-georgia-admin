'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/ui/status-badge"
import { DeleteConfirmDialog } from "@/components/ui/confirm-dialog"
import { toast } from "sonner"
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
  Users,
  CheckCircle,
  XCircle
} from "lucide-react"
import Link from "next/link"
import { QuestionnaireTemplate } from "@/types/database"

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<QuestionnaireTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<QuestionnaireTemplate[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [languageFilter, setLanguageFilter] = useState<string>("all")
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load templates from database
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (statusFilter !== 'all') params.append('status', statusFilter);
        if (languageFilter !== 'all') params.append('language', languageFilter);
        params.append('page', '1');
        params.append('limit', '50');

        const response = await fetch(`/api/admin/templates?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch templates');
        }
        
        const result = await response.json();
        setTemplates(result.data || []);
        setFilteredTemplates(result.data || []);
      } catch (err) {
        console.error("Error loading templates:", err)
        setError(err instanceof Error ? err.message : "Failed to load templates")
        toast.error("Failed to load templates")
      } finally {
        setLoading(false)
      }
    }

    // Debounce search queries
    const timeoutId = setTimeout(() => {
      loadTemplates()
    }, searchQuery ? 300 : 0) // 300ms debounce for search, immediate for filters

    return () => clearTimeout(timeoutId)
  }, [searchQuery, statusFilter, languageFilter])

  // Filter templates based on search and filters (now handled by the service)
  useEffect(() => {
    setFilteredTemplates(templates)
  }, [templates])

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/admin/templates/${templateId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete template');
      }

      setTemplates(prev => prev.filter(t => t.id !== templateId))
      setSelectedTemplates(prev => prev.filter(id => id !== templateId))
      toast.success("Template deleted successfully")
    } catch (err) {
      console.error("Error deleting template:", err)
      toast.error("Failed to delete template")
    }
  }

  const handleDuplicateTemplate = async (templateId: string) => {
    try {
      const template = templates.find(t => t.id === templateId)
      if (!template) return
      
      const newName = `${template.name} (Copy)`
      
      const response = await fetch('/api/admin/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newName,
          description: template.description,
          estimated_completion_minutes: template.estimated_completion_minutes,
          introduction_text: template.introduction_text,
          completion_message: template.completion_message,
          language: template.language,
          is_active: false, // Start as inactive for duplicated templates
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate template');
      }

      const result = await response.json();
      setTemplates(prev => [result.data, ...prev])
      toast.success("Template duplicated successfully")
    } catch (err) {
      console.error("Error duplicating template:", err)
      toast.error("Failed to duplicate template")
    }
  }

  const handleToggleStatus = async (templateId: string) => {
    try {
      const response = await fetch(`/api/admin/templates/${templateId}/toggle-status`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle template status');
      }

      const result = await response.json();
      
      // Update the template in the local state
      setTemplates(prev => prev.map(t => 
        t.id === templateId ? result.data : t
      ));
      setFilteredTemplates(prev => prev.map(t => 
        t.id === templateId ? result.data : t
      ));
      
      toast.success(result.message || "Template status updated successfully");
    } catch (err) {
      console.error("Error toggling template status:", err);
      toast.error("Failed to toggle template status");
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Templates</h1>
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

      {/* Loading State */}
      {loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="relative">
              <CardHeader className="pb-3">
                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="flex gap-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto h-12 w-12 text-red-500 mb-4">
              <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.684-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-red-600">Failed to load templates</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Templates Grid */}
      {!loading && !error && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
          <Card key={template.id} className="relative group hover:shadow-md transition-shadow card-interactive">
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
                    <DropdownMenuItem onClick={() => handleToggleStatus(template.id)}>
                      {template.is_active ? (
                        <>
                          <XCircle className="mr-2 h-4 w-4" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Activate
                        </>
                      )}
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
                <Button 
                  size="sm" 
                  variant={template.is_active ? "destructive" : "default"} 
                  onClick={() => handleToggleStatus(template.id)}
                  className="flex-shrink-0"
                >
                  {template.is_active ? (
                    <XCircle className="h-3 w-3" />
                  ) : (
                    <CheckCircle className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredTemplates.length === 0 && (
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
      {!loading && !error && filteredTemplates.length > 0 && (
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