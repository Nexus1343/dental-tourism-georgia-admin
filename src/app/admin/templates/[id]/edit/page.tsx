'use client'

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { StatusBadge } from "@/components/ui/status-badge"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FileText, 
  ArrowLeft,
  Save,
  Plus,
  MoreVertical,
  GripVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
  Settings,
  MessageSquare,
  User,
  Heart,
  CreditCard,
  Camera,
  List,
  HelpCircle
} from "lucide-react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { QuestionnaireTemplate, QuestionnairePage, QuestionnaireQuestion } from "@/types/database"
import { QuestionnaireTemplateService, QuestionnairePageService, QuestionnaireQuestionService } from "@/lib/database"
import { toast } from "sonner"
import { PageFlowDiagram } from "@/components/ui/page-flow-diagram"

// Page configuration schema
const pageConfigSchema = z.object({
  title: z.string().min(1, "Page title is required"),
  description: z.string().max(500, "Description too long"),
  instruction_text: z.string().max(1000, "Instructions too long"),
  page_type: z.enum(["intro", "standard", "photo_upload", "summary"]),
  show_progress: z.boolean(),
  allow_back_navigation: z.boolean(),
  auto_advance: z.boolean()
})

type PageConfigData = z.infer<typeof pageConfigSchema>



// Page templates for quick insertion
const pageTemplates = [
  {
    id: "personal-info",
    name: "Personal Information",
    description: "Basic demographic and contact details",
    icon: User,
    defaultConfig: {
      title: "Personal Information",
      description: "Basic demographic and contact information",
      instruction_text: "Please provide your basic information to help us serve you better.",
      page_type: "standard" as const,
      show_progress: true,
      allow_back_navigation: false,
      auto_advance: false
    }
  },
  {
    id: "medical-history",
    name: "Medical History", 
    description: "Health background and medical conditions",
    icon: Heart,
    defaultConfig: {
      title: "Medical History",
      description: "Current health status and medical background",
      instruction_text: "Your medical history helps us provide the best treatment recommendations.",
      page_type: "standard" as const,
      show_progress: true,
      allow_back_navigation: true,
      auto_advance: false
    }
  },
  {
    id: "photo-upload",
    name: "Photo Upload",
    description: "Dental photos for assessment",
    icon: Camera,
    defaultConfig: {
      title: "Photo Upload",
      description: "Upload dental photos for assessment", 
      instruction_text: "Please upload clear photos of your teeth as instructed.",
      page_type: "photo_upload" as const,
      show_progress: true,
      allow_back_navigation: true,
      auto_advance: false
    }
  }
]

// Sortable page item component
function SortablePageItem({ page, onEdit, onDelete, onDuplicate }: {
  page: QuestionnairePage
  onEdit: (page: QuestionnairePage) => void
  onDelete: (pageId: string) => void
  onDuplicate: (page: QuestionnairePage) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const getPageTypeIcon = (type: string) => {
    switch (type) {
      case 'intro': return MessageSquare
      case 'photo_upload': return Camera  
      case 'summary': return List
      default: return FileText
    }
  }

  const getPageTypeColor = (type: string) => {
    switch (type) {
      case 'intro': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'photo_upload': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'summary': return 'bg-green-50 text-green-700 border-green-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const PageIcon = getPageTypeIcon(page.page_type)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow card-interactive"
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <button
          className="mt-1 p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </button>

        {/* Page Icon & Type */}
        <div className={`p-2 rounded-lg border ${getPageTypeColor(page.page_type)}`}>
          <PageIcon className="h-4 w-4" />
        </div>

        {/* Page Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 truncate">{page.title}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{page.description}</p>
              
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  Page {page.page_number}
                </Badge>
                <Badge variant={page.page_type === 'photo_upload' ? 'default' : 'secondary'} className="text-xs">
                  {page.page_type.replace('_', ' ')}
                </Badge>
                {!page.allow_back_navigation && (
                  <Badge variant="outline" className="text-xs">No Back</Badge>
                )}
                {page.auto_advance && (
                  <Badge variant="outline" className="text-xs">Auto Advance</Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(page)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Page
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/admin/templates/${page.template_id}/edit/${page.id}`}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Edit Questions
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(page)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-600"
                  onClick={() => onDelete(page.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EditTemplatePage() {
  const params = useParams()
  const router = useRouter()
  const [template, setTemplate] = useState<QuestionnaireTemplate | null>(null)
  const [pages, setPages] = useState<QuestionnairePage[]>([])
  const [questions, setQuestions] = useState<QuestionnaireQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPageDialog, setShowPageDialog] = useState(false)
  const [editingPage, setEditingPage] = useState<QuestionnairePage | null>(null)
  const [activeTab, setActiveTab] = useState("pages")
  const [error, setError] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const pageForm = useForm<PageConfigData>({
    resolver: zodResolver(pageConfigSchema),
    defaultValues: {
      title: "",
      description: "",
      instruction_text: "",
      page_type: "standard",
      show_progress: true,
      allow_back_navigation: true,
      auto_advance: false
    }
  })

  useEffect(() => {
    const fetchTemplateData = async () => {
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

        // Fetch pages for this template
        const pagesData = await QuestionnairePageService.getByTemplateId(params.id as string)
        setPages(pagesData)

        // Fetch all questions for this template
        const questionsData = await QuestionnaireQuestionService.getByTemplateId(params.id as string)
        setQuestions(questionsData)

      } catch (err) {
        console.error("Error fetching template data:", err)
        setError(err instanceof Error ? err.message : "Failed to load template")
        toast.error("Failed to load template data")
      } finally {
        setLoading(false)
      }
    }

    fetchTemplateData()
  }, [params.id])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = pages.findIndex((item) => item.id === active.id)
      const newIndex = pages.findIndex((item) => item.id === over.id)
      
      const newItems = arrayMove(pages, oldIndex, newIndex)
      
      // Update page numbers
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        page_number: index + 1
      }))
      
      // Optimistically update UI
      setPages(updatedItems)
      
      try {
        // Save new page order to database
        const pageIds = updatedItems.map(page => page.id)
        await QuestionnairePageService.reorder(params.id as string, pageIds)
        toast.success("Page order updated")
      } catch (err) {
        console.error("Error reordering pages:", err)
        toast.error("Failed to update page order")
        // Revert on error
        setPages(pages)
      }
    }
  }

  const handleAddPage = async (template?: any) => {
    const newPageNumber = Math.max(...pages.map(p => p.page_number), 0) + 1
    
    if (template) {
      // Add from template
      try {
        const newPage = await QuestionnairePageService.create({
          template_id: params.id as string,
          title: template.defaultConfig.title,
          description: template.defaultConfig.description,
          page_number: newPageNumber,
          page_type: template.defaultConfig.page_type,
          instruction_text: template.defaultConfig.instruction_text,
          show_progress: template.defaultConfig.show_progress,
          allow_back_navigation: template.defaultConfig.allow_back_navigation,
          auto_advance: template.defaultConfig.auto_advance
        })
        
        setPages(prev => [...prev, newPage])
        toast.success("Page added successfully")
      } catch (err) {
        console.error("Error adding page:", err)
        toast.error("Failed to add page")
      }
    } else {
      // Open dialog for custom page
      pageForm.reset()
      setEditingPage(null)
      setShowPageDialog(true)
    }
  }

  const handleEditPage = (page: QuestionnairePage) => {
    setEditingPage(page)
    pageForm.reset({
      title: page.title,
      description: page.description || "",
      instruction_text: page.instruction_text || "",
      page_type: page.page_type,
      show_progress: page.show_progress,
      allow_back_navigation: page.allow_back_navigation,
      auto_advance: page.auto_advance
    })
    setShowPageDialog(true)
  }

  const handleSavePage = async (data: PageConfigData) => {
    try {
      if (editingPage) {
        // Update existing page
        const updatedPage = await QuestionnairePageService.update(editingPage.id, {
          title: data.title,
          description: data.description,
          instruction_text: data.instruction_text,
          page_type: data.page_type,
          show_progress: data.show_progress,
          allow_back_navigation: data.allow_back_navigation,
          auto_advance: data.auto_advance
        })
        
        setPages(prev => prev.map(page => 
          page.id === editingPage.id ? updatedPage : page
        ))
        toast.success("Page updated successfully")
      } else {
        // Add new page
        const newPage = await QuestionnairePageService.create({
          template_id: params.id as string,
          title: data.title,
          description: data.description,
          page_number: Math.max(...pages.map(p => p.page_number), 0) + 1,
          page_type: data.page_type,
          instruction_text: data.instruction_text,
          show_progress: data.show_progress,
          allow_back_navigation: data.allow_back_navigation,
          auto_advance: data.auto_advance
        })
        
        setPages(prev => [...prev, newPage])
        toast.success("Page created successfully")
      }
      
      setShowPageDialog(false)
      setEditingPage(null)
    } catch (err) {
      console.error("Error saving page:", err)
      toast.error("Failed to save page")
    }
  }

  const handleDeletePage = async (pageId: string) => {
    try {
      await QuestionnairePageService.delete(pageId)
      
      setPages(prev => {
        const filtered = prev.filter(p => p.id !== pageId)
        // Renumber pages
        return filtered.map((page, index) => ({
          ...page,
          page_number: index + 1
        }))
      })
      
      // Also remove questions for this page
      setQuestions(prev => prev.filter(q => q.page_id !== pageId))
      
      toast.success("Page deleted successfully")
    } catch (err) {
      console.error("Error deleting page:", err)
      toast.error("Failed to delete page")
    }
  }

  const handleDuplicatePage = async (page: QuestionnairePage) => {
    try {
      const newPage = await QuestionnairePageService.create({
        template_id: params.id as string,
        title: `${page.title} (Copy)`,
        description: page.description,
        page_number: Math.max(...pages.map(p => p.page_number), 0) + 1,
        page_type: page.page_type,
        instruction_text: page.instruction_text,
        show_progress: page.show_progress,
        allow_back_navigation: page.allow_back_navigation,
        auto_advance: page.auto_advance
      })
      
      setPages(prev => [...prev, newPage])
      toast.success("Page duplicated successfully")
    } catch (err) {
      console.error("Error duplicating page:", err)
      toast.error("Failed to duplicate page")
    }
  }

  const handleSaveTemplate = async () => {
    if (!template) return
    
    setSaving(true)
    try {
      // Update template total_pages count
      await QuestionnaireTemplateService.update(template.id, {
        total_pages: pages.length
      })
      
      // Update local template state
      setTemplate(prev => prev ? { ...prev, total_pages: pages.length } : null)
      
      toast.success("Template saved successfully")
    } catch (err) {
      console.error("Error saving template:", err)
      toast.error("Failed to save template")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
            <div className="mx-auto h-12 w-12 text-red-500 mb-4">
              <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.684-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-red-600">
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
          { label: 'Templates', href: '/admin/templates', icon: FileText },
          { label: template.name, href: `/admin/templates/${template.id}` },
          { label: 'Edit' }
        ]}
      />

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Edit Template</h1>
            <StatusBadge 
              status={template.is_active ? 'active' : 'inactive'} 
              showIcon={true}
            />
            <Badge variant="outline">v{template.version}</Badge>
          </div>
          <p className="text-muted-foreground">
            {template.name} • {pages.length} pages
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/preview?template=${template.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Link>
          </Button>
          
          <Button onClick={handleSaveTemplate} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>

          <Button variant="outline" asChild>
            <Link href={`/admin/templates/${template.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Template
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="flow">Page Flow</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* Pages Tab */}
        <TabsContent value="pages" className="space-y-6">
          {/* Page Management Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pages Management</CardTitle>
                  <CardDescription>
                    Organize and configure questionnaire pages. Drag to reorder.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Page
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                      <div className="p-2">
                        <h4 className="font-medium text-sm mb-2">Page Templates</h4>
                        {pageTemplates.map((template) => (
                          <DropdownMenuItem 
                            key={template.id}
                            onClick={() => handleAddPage(template)}
                            className="flex items-start gap-3 p-3"
                          >
                            <template.icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <div className="font-medium text-sm">{template.name}</div>
                              <div className="text-xs text-muted-foreground">{template.description}</div>
                            </div>
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleAddPage()}>
                          <Settings className="mr-2 h-4 w-4" />
                          Custom Page
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Pages List */}
          <Card>
            <CardContent className="p-6">
              {pages.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No pages yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first page to start building the questionnaire.
                  </p>
                  <Button onClick={() => handleAddPage()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Page
                  </Button>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={pages.map(p => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {pages.map((page) => (
                        <SortablePageItem
                          key={page.id}
                          page={page}
                          onEdit={handleEditPage}
                          onDelete={handleDeletePage}
                          onDuplicate={handleDuplicatePage}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Page Flow Tab */}
        <TabsContent value="flow" className="space-y-6">
          <PageFlowDiagram pages={pages} />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Settings</CardTitle>
              <CardDescription>
                Configure template-wide settings and behavior.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Template settings configuration will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Preview</CardTitle>
              <CardDescription>
                Preview how the questionnaire will appear to patients.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Interactive preview will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Page Configuration Dialog */}
      <Dialog open={showPageDialog} onOpenChange={setShowPageDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPage ? "Edit Page" : "Add New Page"}
            </DialogTitle>
            <DialogDescription>
              Configure the page settings and behavior.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={pageForm.handleSubmit(handleSavePage)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Page Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Personal Information"
                  {...pageForm.register("title")}
                />
                {pageForm.formState.errors.title && (
                  <p className="text-sm text-red-600">{pageForm.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="page_type">Page Type *</Label>
                <Select 
                  value={pageForm.watch("page_type")} 
                  onValueChange={(value) => pageForm.setValue("page_type", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select page type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="intro">Introduction</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="photo_upload">Photo Upload</SelectItem>
                    <SelectItem value="summary">Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Brief description of this page..."
                {...pageForm.register("description")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instruction_text">Instructions</Label>
              <Textarea
                id="instruction_text"
                placeholder="Instructions that will be shown to patients..."
                rows={3}
                {...pageForm.register("instruction_text")}
              />
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Page Behavior</h4>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="show_progress"
                    {...pageForm.register("show_progress")}
                    className="rounded"
                  />
                  <Label htmlFor="show_progress">Show Progress Bar</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="allow_back_navigation"
                    {...pageForm.register("allow_back_navigation")}
                    className="rounded"
                  />
                  <Label htmlFor="allow_back_navigation">Allow Back Navigation</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="auto_advance"
                    {...pageForm.register("auto_advance")}
                    className="rounded"
                  />
                  <Label htmlFor="auto_advance">Auto Advance</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowPageDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingPage ? "Update Page" : "Add Page"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 