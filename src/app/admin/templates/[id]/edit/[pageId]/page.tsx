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
  Type,
  Mail,
  Phone,
  Hash,
  Calendar,
  CircleDot,
  CheckSquare,
  Square,
  Upload,
  Camera,
  Star,
  Sliders,
  Activity,
  DollarSign,
  Users,
  Image,
  Settings,
  HelpCircle,
  AlertCircle
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

import { QuestionnaireTemplate, QuestionnairePage, QuestionnaireQuestion, QuestionType } from "@/types/database"
import { QuestionnaireTemplateService, QuestionnairePageService, QuestionnaireQuestionService } from "@/lib/database"
import { toast } from "sonner"

// Question configuration schema
const questionConfigSchema = z.object({
  question_text: z.string().min(1, "Question text is required"),
  question_type: z.enum([
    "text", "textarea", "email", "phone", "number", "date", "date_picker",
    "single_choice", "multiple_choice", "checkbox", "file_upload", "photo_upload",
    "photo_grid", "rating", "slider", "pain_scale", "tooth_chart", "budget_range"
  ]),
  help_text: z.string().optional(),
  placeholder_text: z.string().optional(),
  tooltip_text: z.string().optional(),
  is_required: z.boolean(),
  validation_message: z.string().optional(),
  question_group: z.string().optional()
})

type QuestionConfigData = z.infer<typeof questionConfigSchema>



// Question type definitions with icons and categories
const questionTypes = [
  // Text Input Types
  {
    type: "text" as QuestionType,
    name: "Text Input",
    description: "Single line text input",
    icon: Type,
    category: "Text",
    color: "bg-blue-50 text-blue-700 border-blue-200"
  },
  {
    type: "textarea" as QuestionType,
    name: "Long Text",
    description: "Multi-line text area",
    icon: FileText,
    category: "Text",
    color: "bg-blue-50 text-blue-700 border-blue-200"
  },
  {
    type: "email" as QuestionType,
    name: "Email",
    description: "Email address input",
    icon: Mail,
    category: "Text",
    color: "bg-blue-50 text-blue-700 border-blue-200"
  },
  {
    type: "phone" as QuestionType,
    name: "Phone",
    description: "Phone number input",
    icon: Phone,
    category: "Text",
    color: "bg-blue-50 text-blue-700 border-blue-200"
  },
  // Numeric Types
  {
    type: "number" as QuestionType,
    name: "Number",
    description: "Numeric input",
    icon: Hash,
    category: "Number",
    color: "bg-green-50 text-green-700 border-green-200"
  },
  {
    type: "slider" as QuestionType,
    name: "Slider",
    description: "Range slider input",
    icon: Sliders,
    category: "Number",
    color: "bg-green-50 text-green-700 border-green-200"
  },
  {
    type: "budget_range" as QuestionType,
    name: "Budget Range",
    description: "Budget selection",
    icon: DollarSign,
    category: "Number",
    color: "bg-green-50 text-green-700 border-green-200"
  },
  // Date Types
  {
    type: "date" as QuestionType,
    name: "Date",
    description: "Date input",
    icon: Calendar,
    category: "Date",
    color: "bg-purple-50 text-purple-700 border-purple-200"
  },
  {
    type: "date_picker" as QuestionType,
    name: "Date Picker",
    description: "Interactive date picker",
    icon: Calendar,
    category: "Date",
    color: "bg-purple-50 text-purple-700 border-purple-200"
  },
  // Choice Types
  {
    type: "single_choice" as QuestionType,
    name: "Single Choice",
    description: "Radio button selection",
    icon: CircleDot,
    category: "Choice",
    color: "bg-orange-50 text-orange-700 border-orange-200"
  },
  {
    type: "multiple_choice" as QuestionType,
    name: "Multiple Choice",
    description: "Checkbox selection",
    icon: CheckSquare,
    category: "Choice",
    color: "bg-orange-50 text-orange-700 border-orange-200"
  },
  {
    type: "checkbox" as QuestionType,
    name: "Checkbox",
    description: "Single checkbox",
    icon: Square,
    category: "Choice",
    color: "bg-orange-50 text-orange-700 border-orange-200"
  },
  // File Upload Types
  {
    type: "file_upload" as QuestionType,
    name: "File Upload",
    description: "General file upload",
    icon: Upload,
    category: "Upload",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200"
  },
  {
    type: "photo_upload" as QuestionType,
    name: "Photo Upload",
    description: "Image upload",
    icon: Camera,
    category: "Upload",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200"
  },
  {
    type: "photo_grid" as QuestionType,
    name: "Photo Grid",
    description: "Multiple photos grid",
    icon: Image,
    category: "Upload",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200"
  },
  // Rating Types
  {
    type: "rating" as QuestionType,
    name: "Rating",
    description: "Star rating",
    icon: Star,
    category: "Rating",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200"
  },
  {
    type: "pain_scale" as QuestionType,
    name: "Pain Scale",
    description: "1-10 pain rating",
    icon: Activity,
    category: "Rating",
    color: "bg-red-50 text-red-700 border-red-200"
  },
  // Dental Specific
  {
    type: "tooth_chart" as QuestionType,
    name: "Tooth Chart",
    description: "Interactive dental chart",
    icon: Users,
    category: "Dental",
    color: "bg-teal-50 text-teal-700 border-teal-200"
  }
]

// Group question types by category
const questionCategories = questionTypes.reduce((acc, type) => {
  if (!acc[type.category]) {
    acc[type.category] = []
  }
  acc[type.category].push(type)
  return acc
}, {} as Record<string, typeof questionTypes>)

// Sortable question item component
function SortableQuestionItem({ question, onEdit, onDelete, onDuplicate }: {
  question: QuestionnaireQuestion
  onEdit: (question: QuestionnaireQuestion) => void
  onDelete: (questionId: string) => void
  onDuplicate: (question: QuestionnaireQuestion) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const questionTypeInfo = questionTypes.find(type => type.type === question.question_type)
  const QuestionIcon = questionTypeInfo?.icon || HelpCircle

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
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

        {/* Question Icon & Type */}
        <div className={`p-2 rounded-lg border ${questionTypeInfo?.color || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
          <QuestionIcon className="h-4 w-4" />
        </div>

        {/* Question Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 truncate">{question.question_text}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {questionTypeInfo?.name || question.question_type}
              </p>
              
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  #{question.order_index}
                </Badge>
                <Badge variant={questionTypeInfo?.category === 'Upload' ? 'default' : 'secondary'} className="text-xs">
                  {questionTypeInfo?.category || 'Other'}
                </Badge>
                {question.is_required && (
                  <Badge variant="destructive" className="text-xs">Required</Badge>
                )}
                {question.question_group && (
                  <Badge variant="outline" className="text-xs">{question.question_group}</Badge>
                )}
              </div>
              
              {question.help_text && (
                <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                  Help: {question.help_text}
                </p>
              )}
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(question)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Question
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(question)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-600"
                  onClick={() => onDelete(question.id)}
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

export default function QuestionEditorPage() {
  const params = useParams()
  const router = useRouter()
  const [template, setTemplate] = useState<QuestionnaireTemplate | null>(null)
  const [page, setPage] = useState<QuestionnairePage | null>(null)
  const [questions, setQuestions] = useState<QuestionnaireQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showQuestionDialog, setShowQuestionDialog] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<QuestionnaireQuestion | null>(null)
  const [activeTab, setActiveTab] = useState("questions")
  const [error, setError] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const questionForm = useForm<QuestionConfigData>({
    resolver: zodResolver(questionConfigSchema),
    defaultValues: {
      question_text: "",
      question_type: "text",
      help_text: "",
      placeholder_text: "",
      tooltip_text: "",
      is_required: false,
      validation_message: "",
      question_group: ""
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch template
        const templateData = await QuestionnaireTemplateService.getById(params.id as string)
        if (!templateData) {
          setError("Template not found")
          return
        }
        setTemplate(templateData)

        // Fetch page
        const pageData = await QuestionnairePageService.getById(params.pageId as string)
        if (!pageData) {
          setError("Page not found")
          return
        }
        setPage(pageData)

        // Fetch questions for this page
        const questionsData = await QuestionnaireQuestionService.getByPageId(params.pageId as string)
        setQuestions(questionsData)

      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err instanceof Error ? err.message : "Failed to load data")
        toast.error("Failed to load question data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, params.pageId])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((item) => item.id === active.id)
      const newIndex = questions.findIndex((item) => item.id === over.id)
      
      const newItems = arrayMove(questions, oldIndex, newIndex)
      
      // Update order indices
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        order_index: index + 1
      }))
      
      // Optimistically update UI
      setQuestions(updatedItems)
      
      try {
        // Save new question order to database
        const questionIds = updatedItems.map(q => q.id)
        await QuestionnaireQuestionService.reorder(params.pageId as string, questionIds)
        toast.success("Question order updated")
      } catch (err) {
        console.error("Error reordering questions:", err)
        toast.error("Failed to update question order")
        // Revert on error
        setQuestions(questions)
      }
    }
  }

  const handleAddQuestion = async (questionType?: QuestionType) => {
    if (questionType) {
      // Add question with specific type
      try {
        const newQuestion = await QuestionnaireQuestionService.create({
          template_id: params.id as string,
          page_id: params.pageId as string,
          section: "general",
          question_text: `New ${questionTypes.find(t => t.type === questionType)?.name || questionType} Question`,
          question_type: questionType,
          options: {},
          validation_rules: {},
          is_required: false,
          order_index: Math.max(...questions.map(q => q.order_index), 0) + 1,
          conditional_logic: {}
        })
        
        setQuestions(prev => [...prev, newQuestion])
        toast.success("Question added successfully")
      } catch (err) {
        console.error("Error adding question:", err)
        toast.error("Failed to add question")
      }
    } else {
      // Open dialog for custom question
      questionForm.reset()
      setEditingQuestion(null)
      setShowQuestionDialog(true)
    }
  }

  const handleEditQuestion = (question: QuestionnaireQuestion) => {
    setEditingQuestion(question)
    questionForm.reset({
      question_text: question.question_text,
      question_type: question.question_type,
      help_text: question.help_text || "",
      placeholder_text: question.placeholder_text || "",
      tooltip_text: question.tooltip_text || "",
      is_required: question.is_required,
      validation_message: question.validation_message || "",
      question_group: question.question_group || ""
    })
    setShowQuestionDialog(true)
  }

  const handleSaveQuestion = async (data: QuestionConfigData) => {
    try {
      if (editingQuestion) {
        // Update existing question
        const updatedQuestion = await QuestionnaireQuestionService.update(editingQuestion.id, {
          question_text: data.question_text,
          question_type: data.question_type,
          help_text: data.help_text,
          placeholder_text: data.placeholder_text,
          tooltip_text: data.tooltip_text,
          is_required: data.is_required,
          validation_message: data.validation_message,
          question_group: data.question_group
        })
        
        setQuestions(prev => prev.map(question => 
          question.id === editingQuestion.id ? updatedQuestion : question
        ))
        toast.success("Question updated successfully")
      } else {
        // Add new question
        const newQuestion = await QuestionnaireQuestionService.create({
          template_id: params.id as string,
          page_id: params.pageId as string,
          section: "general",
          question_text: data.question_text,
          question_type: data.question_type,
          options: {},
          validation_rules: {},
          is_required: data.is_required,
          order_index: Math.max(...questions.map(q => q.order_index), 0) + 1,
          help_text: data.help_text,
          placeholder_text: data.placeholder_text,
          tooltip_text: data.tooltip_text,
          validation_message: data.validation_message,
          question_group: data.question_group,
          conditional_logic: {}
        })
        
        setQuestions(prev => [...prev, newQuestion])
        toast.success("Question created successfully")
      }
      
      setShowQuestionDialog(false)
      setEditingQuestion(null)
    } catch (err) {
      console.error("Error saving question:", err)
      toast.error("Failed to save question")
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await QuestionnaireQuestionService.delete(questionId)
      
      setQuestions(prev => {
        const filtered = prev.filter(q => q.id !== questionId)
        // Renumber questions
        return filtered.map((question, index) => ({
          ...question,
          order_index: index + 1
        }))
      })
      
      toast.success("Question deleted successfully")
    } catch (err) {
      console.error("Error deleting question:", err)
      toast.error("Failed to delete question")
    }
  }

  const handleDuplicateQuestion = async (question: QuestionnaireQuestion) => {
    try {
      const newQuestion = await QuestionnaireQuestionService.create({
        template_id: params.id as string,
        page_id: params.pageId as string,
        section: question.section,
        question_text: `${question.question_text} (Copy)`,
        question_type: question.question_type,
        options: question.options,
        validation_rules: question.validation_rules,
        is_required: question.is_required,
        order_index: Math.max(...questions.map(q => q.order_index), 0) + 1,
        conditional_logic: question.conditional_logic,
        help_text: question.help_text,
        placeholder_text: question.placeholder_text,
        question_group: question.question_group,
        validation_message: question.validation_message,
        tooltip_text: question.tooltip_text
      })
      
      setQuestions(prev => [...prev, newQuestion])
      toast.success("Question duplicated successfully")
    } catch (err) {
      console.error("Error duplicating question:", err)
      toast.error("Failed to duplicate question")
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Questions are already saved individually, so just update the page
      // to ensure consistency
      await QuestionnairePageService.update(params.pageId as string, {
        updated_at: new Date().toISOString()
      })
      
      toast.success("Questions saved successfully")
    } catch (err) {
      console.error("Error saving questions:", err)
      toast.error("Failed to save questions")
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

  if (error || (!loading && (!template || !page))) {
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
              {error ? "Error loading page" : "Page not found"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {error || "The page you're looking for doesn't exist or has been deleted."}
            </p>
            <div className="flex justify-center gap-2">
              <Button asChild>
                <Link href={`/admin/templates/${params.id}/edit`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Template
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

  if (!template || !page) {
    return null // This shouldn't happen due to the above check, but keeps TypeScript happy
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs 
        items={[
          { label: 'Templates', href: '/admin/templates', icon: FileText },
          { label: template.name, href: `/admin/templates/${template.id}` },
          { label: 'Edit', href: `/admin/templates/${template.id}/edit` },
          { label: page.title }
        ]}
      />

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Edit Questions</h1>
            <Badge variant="outline">Page {page.page_number}</Badge>
          </div>
          <p className="text-muted-foreground">
            {page.title} • {questions.length} questions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/preview?template=${template.id}&page=${page.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              Preview Page
            </Link>
          </Button>
          
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Questions"}
          </Button>

          <Button variant="outline" asChild>
            <Link href={`/admin/templates/${template.id}/edit`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Pages
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="logic">Conditional Logic</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-6">
          {/* Question Management Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Question Management</CardTitle>
                  <CardDescription>
                    Create and organize questions for this page. Drag to reorder.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Question
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                      <div className="p-2">
                        <h4 className="font-medium text-sm mb-3">Question Types</h4>
                        {Object.entries(questionCategories).map(([category, types]) => (
                          <div key={category} className="mb-4">
                            <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                              {category}
                            </h5>
                            {types.map((type) => (
                              <DropdownMenuItem 
                                key={type.type}
                                onClick={() => handleAddQuestion(type.type)}
                                className="flex items-start gap-3 p-3"
                              >
                                <div className={`p-1 rounded ${type.color}`}>
                                  <type.icon className="h-3 w-3" />
                                </div>
                                <div>
                                  <div className="font-medium text-sm">{type.name}</div>
                                  <div className="text-xs text-muted-foreground">{type.description}</div>
                                </div>
                              </DropdownMenuItem>
                            ))}
                          </div>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleAddQuestion()}>
                          <Settings className="mr-2 h-4 w-4" />
                          Custom Question
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{questions.length}</div>
                  <div className="text-gray-600">Total Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {questions.filter(q => q.is_required).length}
                  </div>
                  <div className="text-gray-600">Required</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {new Set(questions.map(q => q.question_group)).size}
                  </div>
                  <div className="text-gray-600">Groups</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {new Set(questions.map(q => questionTypes.find(t => t.type === q.question_type)?.category)).size}
                  </div>
                  <div className="text-gray-600">Categories</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions List */}
          <Card>
            <CardContent className="p-6">
              {questions.length === 0 ? (
                <div className="text-center py-12">
                  <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No questions yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first question to start building this page.
                  </p>
                  <Button onClick={() => handleAddQuestion()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Question
                  </Button>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={questions.map(q => q.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {questions.map((question) => (
                        <SortableQuestionItem
                          key={question.id}
                          question={question}
                          onEdit={handleEditQuestion}
                          onDelete={handleDeleteQuestion}
                          onDuplicate={handleDuplicateQuestion}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validation Tab */}
        <TabsContent value="validation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Validation Rules</CardTitle>
              <CardDescription>
                Configure validation rules for questions on this page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Validation rules configuration will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conditional Logic Tab */}
        <TabsContent value="logic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conditional Logic</CardTitle>
              <CardDescription>
                Set up conditional logic between questions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Conditional logic builder will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Question Preview</CardTitle>
              <CardDescription>
                Preview how the questions will appear to patients.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Interactive question preview will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Question Configuration Dialog */}
      <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? "Edit Question" : "Add New Question"}
            </DialogTitle>
            <DialogDescription>
              Configure the question text, type, and properties.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={questionForm.handleSubmit(handleSaveQuestion)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question_text">Question Text *</Label>
              <Textarea
                id="question_text"
                placeholder="e.g., What is your name?"
                rows={2}
                {...questionForm.register("question_text")}
              />
              {questionForm.formState.errors.question_text && (
                <p className="text-sm text-red-600">{questionForm.formState.errors.question_text.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="question_type">Question Type *</Label>
                <Select 
                  value={questionForm.watch("question_type")} 
                  onValueChange={(value) => questionForm.setValue("question_type", value as QuestionType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select question type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(questionCategories).map(([category, types]) => (
                      <div key={category}>
                        <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                          {category}
                        </div>
                        {types.map((type) => (
                          <SelectItem key={type.type} value={type.type}>
                            <div className="flex items-center gap-2">
                              <type.icon className="h-4 w-4" />
                              {type.name}
                            </div>
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="question_group">Question Group</Label>
                <Input
                  id="question_group"
                  placeholder="e.g., personal_info"
                  {...questionForm.register("question_group")}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="placeholder_text">Placeholder Text</Label>
                <Input
                  id="placeholder_text"
                  placeholder="e.g., Enter your name..."
                  {...questionForm.register("placeholder_text")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tooltip_text">Tooltip Text</Label>
                <Input
                  id="tooltip_text"
                  placeholder="Additional help text..."
                  {...questionForm.register("tooltip_text")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="help_text">Help Text</Label>
              <Textarea
                id="help_text"
                placeholder="Additional instructions for the question..."
                rows={2}
                {...questionForm.register("help_text")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="validation_message">Custom Validation Message</Label>
              <Input
                id="validation_message"
                placeholder="Custom error message..."
                {...questionForm.register("validation_message")}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_required"
                {...questionForm.register("is_required")}
                className="rounded"
              />
              <Label htmlFor="is_required">Required Question</Label>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowQuestionDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingQuestion ? "Update Question" : "Add Question"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 