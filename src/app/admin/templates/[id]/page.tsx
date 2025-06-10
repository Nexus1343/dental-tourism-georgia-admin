'use client'

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FileText, 
  Edit, 
  Copy,
  Trash2,
  Eye,
  ArrowLeft,
  MoreVertical,
  Clock,
  Calendar,
  Building2,
  Users,
  Settings,
  MessageSquare,
  FileEdit,
  BarChart3,
  Download,
  Share,
  CheckCircle,
  XCircle,
  Activity
} from "lucide-react"
import Link from "next/link"
import { QuestionnaireTemplate, QuestionnairePage, QuestionnaireQuestion } from "@/types/database"
import { QuestionnaireTemplateService, QuestionnairePageService, QuestionnaireQuestionService, ClinicTemplateService } from "@/lib/database"
import { toast } from "sonner"

// Template statistics interface
interface TemplateStats {
  totalSubmissions: number
  completionRate: number
  averageCompletionTime: number
  assignedClinics: number
  dropOffPoints: Array<{
    page: string
    dropOffRate: number
  }>
}

export default function TemplateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [template, setTemplate] = useState<QuestionnaireTemplate | null>(null)
  const [stats, setStats] = useState<TemplateStats | null>(null)
  const [pages, setPages] = useState<Array<{ id: string; title: string; description?: string; questionCount: number }>>([])
  const [assignedClinics, setAssignedClinics] = useState<Array<{ id: string; name: string; status: string; isDefault: boolean }>>([])
  const [versions, setVersions] = useState<QuestionnaireTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch template with details
        const templateData = await QuestionnaireTemplateService.getById(params.id as string)
        if (!templateData) {
          setError("Template not found")
          return
        }
        
        setTemplate(templateData)
        
        // Fetch real statistics from database
        const statsData = await QuestionnaireTemplateService.getStatistics(params.id as string)
        setStats(statsData)
        
        // Fetch pages with question counts
        const pagesData = await QuestionnairePageService.getByTemplateId(params.id as string)
        const pagesWithQuestionCounts = await Promise.all(
          pagesData.map(async (page) => {
            const questions = await QuestionnaireQuestionService.getByPageId(page.id)
            return {
              id: page.id,
              title: page.title,
              description: page.description,
              questionCount: questions.length
            }
          })
        )
        setPages(pagesWithQuestionCounts)
        
        // Fetch assigned clinics
        const clinicAssignments = await ClinicTemplateService.getTemplateAssignments(params.id as string)
        const clinicsData = clinicAssignments.map((assignment: any) => ({
          id: assignment.clinic_id,
          name: assignment.clinic?.name || 'Unknown Clinic',
          status: assignment.is_active ? 'Active' : 'Inactive',
          isDefault: assignment.is_default
        }))
        setAssignedClinics(clinicsData)
        
        // Fetch template versions
        const versionsData = await QuestionnaireTemplateService.getVersions(templateData.name)
        setVersions(versionsData)
        
      } catch (err) {
        console.error("Error fetching template:", err)
        setError(err instanceof Error ? err.message : "Failed to load template")
        toast.error("Failed to load template")
      } finally {
        setLoading(false)
      }
    }

    fetchTemplate()
  }, [params.id])

  const handleDeleteTemplate = async () => {
    try {
      await QuestionnaireTemplateService.delete(params.id as string)
      toast.success("Template deleted successfully")
      router.push('/admin/templates')
    } catch (err) {
      console.error("Error deleting template:", err)
      toast.error("Failed to delete template")
    }
  }

  const handleDuplicateTemplate = async () => {
    try {
      if (!template) return
      
      const newName = `${template.name} (Copy)`
      const duplicated = await QuestionnaireTemplateService.duplicate(params.id as string, newName)
      toast.success("Template duplicated successfully")
      router.push(`/admin/templates/${duplicated.id}/edit`)
    } catch (err) {
      console.error("Error duplicating template:", err)
      toast.error("Failed to duplicate template")
    }
  }

  const handleToggleStatus = async () => {
    if (!template) return
    
    try {
      const updatedTemplate = await QuestionnaireTemplateService.toggleStatus(params.id as string)
      setTemplate(updatedTemplate)
      toast.success(`Template ${updatedTemplate.is_active ? 'activated' : 'deactivated'} successfully`)
    } catch (err) {
      console.error("Error updating template status:", err)
      toast.error("Failed to update template status")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleCreateVersion = async () => {
    try {
      if (!template) return
      
      const newVersion = await QuestionnaireTemplateService.createVersion(template.id)
      toast.success(`Version ${newVersion.version} created successfully`)
      
      // Refresh versions list
      const versionsData = await QuestionnaireTemplateService.getVersions(template.name)
      setVersions(versionsData)
    } catch (err) {
      console.error("Error creating version:", err)
      toast.error("Failed to create new version")
    }
  }

  const handleRollbackToVersion = async (versionId: string) => {
    try {
      if (!template) return
      
      const rolledBackTemplate = await QuestionnaireTemplateService.rollbackToVersion(template.id, versionId)
      toast.success("Successfully rolled back to selected version")
      router.push(`/admin/templates/${rolledBackTemplate.id}`)
    } catch (err) {
      console.error("Error rolling back version:", err)
      toast.error("Failed to rollback to selected version")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || (!loading && !template)) {
    return (
      <div className="space-y-6">
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {error ? "Error loading template" : "Template not found"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {error || "The template you're looking for doesn't exist or has been deleted."}
            </p>
            <div className="flex justify-center gap-2">
              <Button asChild>
                <Link href="/admin/templates">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Templates
                </Link>
              </Button>
              {error && (
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!template) {
    return null // This shouldn't happen due to the above check, but keeps TypeScript happy
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs 
        items={[
          { label: 'Templates', href: '/templates', icon: FileText },
          { label: template.name }
        ]}
      />

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{template.name}</h1>
            <StatusBadge 
              status={template.is_active ? 'active' : 'inactive'} 
              showIcon={true}
            />
            <Badge variant="outline">v{template.version}</Badge>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            {template.description}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/preview?template=${template.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Link>
          </Button>
          
          <Button asChild>
                            <Link href={`/admin/templates/${template.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Template
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDuplicateTemplate}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate Template
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleStatus}>
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
              <DropdownMenuItem onClick={handleCreateVersion}>
                <Activity className="mr-2 h-4 w-4" />
                Create Version
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Export Template
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share className="mr-2 h-4 w-4" />
                Share Template
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DeleteConfirmDialog
                itemName="template"
                onConfirm={handleDeleteTemplate}
              >
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Template
                </DropdownMenuItem>
              </DeleteConfirmDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Submissions</p>
                <p className="text-2xl font-bold">{stats?.totalSubmissions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{stats?.completionRate || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Completion Time</p>
                <p className="text-2xl font-bold">{stats?.averageCompletionTime || 0} min</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assigned Clinics</p>
                <p className="text-2xl font-bold">{stats?.assignedClinics || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="clinics">Clinics</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileEdit className="h-5 w-5" />
                  Template Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="text-sm">{template.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Language</p>
                    <Badge variant="outline">{template.language.toUpperCase()}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Estimated Completion</p>
                    <p className="text-sm">{template.estimated_completion_minutes} minutes</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Pages</p>
                    <p className="text-sm">{template.total_pages} pages</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Version</p>
                    <p className="text-sm">v{template.version}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p className="text-sm">{formatDate(template.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-sm">{formatDate(template.updated_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <StatusBadge 
                    status={template.is_active ? 'active' : 'inactive'} 
                    showIcon={true}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Introduction Text
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{template.introduction_text}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Completion Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{template.completion_message}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pages & Questions</CardTitle>
              <CardDescription>
                Preview of questionnaire structure (detailed editing available in edit mode)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pages.length === 0 ? (
                  <div className="text-center text-muted-foreground">
                    <p>No pages configured yet</p>
                  </div>
                ) : (
                  pages.map((page, index) => (
                    <div key={page.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Page {index + 1}: {page.title}</h4>
                        <Badge variant="outline">{page.questionCount} questions</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{page.description}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="configuration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Template Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">Patient Experience</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Allow Save Draft</span>
                      <Badge variant={template.configuration?.allow_save_draft ? "default" : "secondary"}>
                        {template.configuration?.allow_save_draft ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Show Progress</span>
                      <Badge variant={template.configuration?.show_progress ? "default" : "secondary"}>
                        {template.configuration?.show_progress ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Allow Back Navigation</span>
                      <Badge variant={template.configuration?.allow_back_navigation ? "default" : "secondary"}>
                        {template.configuration?.allow_back_navigation ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Require Completion</span>
                      <Badge variant={template.configuration?.require_completion ? "default" : "secondary"}>
                        {template.configuration?.require_completion ? "Required" : "Optional"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Technical Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Auto-save Interval</span>
                      <Badge variant="outline">
                        {template.configuration?.auto_save_interval || 60}s
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                  <p className="text-3xl font-bold text-green-600">{stats?.completionRate || 0}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Time</p>
                  <p className="text-3xl font-bold">{stats?.averageCompletionTime || 0}m</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Submissions</p>
                  <p className="text-3xl font-bold">{stats?.totalSubmissions || 0}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-4">Drop-off Analysis</h4>
                <div className="space-y-3">
                  {stats?.dropOffPoints.map((point: { page: string; dropOffRate: number }, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">{point.page}</span>
                      <Badge variant="outline">{point.dropOffRate}% drop-off</Badge>
                    </div>
                  )) || (
                    <div className="text-center text-muted-foreground">
                      <p>No analytics data available yet</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clinics Tab */}
        <TabsContent value="clinics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Assigned Clinics
              </CardTitle>
              <CardDescription>
                Clinics currently using this template
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignedClinics.length === 0 ? (
                  <div className="text-center text-muted-foreground">
                    <p>No clinics assigned yet</p>
                  </div>
                ) : (
                  assignedClinics.map((clinic) => (
                    <div key={clinic.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{clinic.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {clinic.isDefault ? 'Primary template' : 'Secondary template'}
                        </p>
                      </div>
                      <Badge variant={clinic.status === 'Active' ? 'default' : 'secondary'}>
                        {clinic.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Versions Tab */}
        <TabsContent value="versions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Template Versions
              </CardTitle>
              <CardDescription>
                Manage different versions of this template
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {versions.length === 0 ? (
                  <div className="text-center text-muted-foreground">
                    <p>No versions found</p>
                  </div>
                ) : (
                  versions.map((version) => (
                    <div key={version.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{version.name}</h4>
                          <Badge variant="outline">v{version.version}</Badge>
                          {version.id === template?.id && (
                            <Badge>Current</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Created {formatDate(version.created_at)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {version.id !== template?.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRollbackToVersion(version.id)}
                          >
                            Rollback
                          </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/templates/${version.id}`}>
                            View
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 