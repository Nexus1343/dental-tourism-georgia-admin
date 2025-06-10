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
import { QuestionnaireTemplate } from "@/types/database"

// Mock data - will be replaced with actual API call
const mockTemplate: QuestionnaireTemplate = {
  id: "1",
  name: "Dental Implant Assessment",
  description: "Comprehensive questionnaire for patients considering dental implants. This template covers medical history, current oral health status, expectations, and budget considerations.",
  version: 2,
  is_active: true,
  language: "en",
  created_at: "2024-01-15T10:00:00Z",
  updated_at: "2024-01-20T14:30:00Z",
  total_pages: 5,
  estimated_completion_minutes: 15,
  configuration: {
    allow_save_draft: true,
    show_progress: true,
    allow_back_navigation: true,
    require_completion: false,
    auto_save_interval: 60
  },
  introduction_text: "Welcome to our dental implant assessment questionnaire. This comprehensive evaluation will help our dental team understand your oral health history, current needs, and treatment preferences. The information you provide will be kept confidential and used solely for planning your dental care.",
  completion_message: "Thank you for completing the dental implant assessment. Our dental team will review your responses and contact you within 2-3 business days to discuss your treatment options and schedule a consultation."
}

// Mock stats - will be replaced with actual API call
const mockStats = {
  totalSubmissions: 145,
  completionRate: 87.2,
  averageCompletionTime: 12.5,
  assignedClinics: 8,
  dropOffPoints: [
    { page: "Medical History", dropOffRate: 15.2 },
    { page: "Treatment Preferences", dropOffRate: 8.7 },
    { page: "Budget Information", dropOffRate: 12.1 }
  ]
}

export default function TemplateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [template, setTemplate] = useState<QuestionnaireTemplate | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchTemplate = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))
        setTemplate(mockTemplate)
      } catch (error) {
        console.error("Error fetching template:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTemplate()
  }, [params.id])

  const handleDeleteTemplate = async () => {
    try {
      // TODO: Implement actual delete API call
      console.log("Deleting template:", params.id)
              router.push('/admin/templates')
    } catch (error) {
      console.error("Error deleting template:", error)
    }
  }

  const handleDuplicateTemplate = async () => {
    try {
      // TODO: Implement actual duplicate API call
      console.log("Duplicating template:", params.id)
      // Redirect to edit page of duplicated template
    } catch (error) {
      console.error("Error duplicating template:", error)
    }
  }

  const handleToggleStatus = async () => {
    if (!template) return
    
    try {
      // TODO: Implement actual API call
      const updatedTemplate = { ...template, is_active: !template.is_active }
      setTemplate(updatedTemplate)
    } catch (error) {
      console.error("Error updating template status:", error)
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

  if (!template) {
    return (
      <div className="space-y-6">
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Template not found</h3>
            <p className="text-muted-foreground mb-4">
              The template you&apos;re looking for doesn&apos;t exist or has been deleted.
            </p>
            <Button asChild>
              <Link href="/admin/templates">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Templates
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
                <p className="text-2xl font-bold">{mockStats.totalSubmissions}</p>
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
                <p className="text-2xl font-bold">{mockStats.completionRate}%</p>
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
                <p className="text-2xl font-bold">{mockStats.averageCompletionTime} min</p>
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
                <p className="text-2xl font-bold">{mockStats.assignedClinics}</p>
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
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Page 1: Personal Information</h4>
                    <Badge variant="outline">5 questions</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Basic demographic and contact information</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Page 2: Medical History</h4>
                    <Badge variant="outline">8 questions</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">General health and dental history</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Page 3: Treatment Preferences</h4>
                    <Badge variant="outline">6 questions</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Desired outcomes and treatment preferences</p>
                </div>
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
                  <p className="text-3xl font-bold text-green-600">{mockStats.completionRate}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Time</p>
                  <p className="text-3xl font-bold">{mockStats.averageCompletionTime}m</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Submissions</p>
                  <p className="text-3xl font-bold">{mockStats.totalSubmissions}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-4">Drop-off Analysis</h4>
                <div className="space-y-3">
                  {mockStats.dropOffPoints.map((point, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">{point.page}</span>
                      <Badge variant="outline">{point.dropOffRate}% drop-off</Badge>
                    </div>
                  ))}
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
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Tbilisi Dental Center</h4>
                    <p className="text-sm text-muted-foreground">Primary template</p>
                  </div>
                  <Badge>Active</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Smile Studio Batumi</h4>
                    <p className="text-sm text-muted-foreground">Secondary template</p>
                  </div>
                  <Badge>Active</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Georgian Dental Academy</h4>
                    <p className="text-sm text-muted-foreground">Testing purposes</p>
                  </div>
                  <Badge variant="secondary">Testing</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 