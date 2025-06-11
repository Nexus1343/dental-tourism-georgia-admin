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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  ArrowLeft,
  Save,
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
  Image,
  FileText
} from "lucide-react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { QuestionnaireTemplate, QuestionnairePage, QuestionnaireQuestion, QuestionType } from "@/types/database"
import { QuestionnaireTemplateService, QuestionnairePageService, QuestionnaireQuestionService } from "@/lib/database"
import { toast } from "sonner"
import { ChoiceQuestionConfig, QuestionConfigForm } from "@/components/ui/question-config-forms"

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
    description: "Medical pain scale",
    icon: Activity,
    category: "Rating",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200"
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

export default function QuestionEditorPage() {
  const params = useParams()
  const router = useRouter()
  const [template, setTemplate] = useState<QuestionnaireTemplate | null>(null)
  const [page, setPage] = useState<QuestionnairePage | null>(null)
  const [question, setQuestion] = useState<QuestionnaireQuestion | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [questionConfig, setQuestionConfig] = useState<Record<string, any>>({})

  const isNewQuestion = params.questionId === 'new'

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

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch template
        const templateData = await QuestionnaireTemplateService.getById(params.id as string)
        setTemplate(templateData)
        
        // Fetch page
        const pageData = await QuestionnairePageService.getById(params.pageId as string)
        setPage(pageData)
        
        // Fetch question if editing existing one
        if (!isNewQuestion) {
          // For now, fetch all questions for the page and find the one we need
          const questionsData = await QuestionnaireQuestionService.getByPageId(params.pageId as string)
          const questionData = questionsData.find(q => q.id === params.questionId)
          
          if (questionData) {
            setQuestion(questionData)
            
            // Populate form with existing question data
            questionForm.reset({
              question_text: questionData.question_text,
              question_type: questionData.question_type,
              help_text: questionData.help_text || "",
              placeholder_text: questionData.placeholder_text || "",
              tooltip_text: questionData.tooltip_text || "",
              is_required: questionData.is_required,
              validation_message: questionData.validation_message || "",
              question_group: questionData.question_group || ""
            })
            
            // Set the question config (options, etc.)
            setQuestionConfig(questionData.options || {})
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        toast.error("Failed to load question data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, params.pageId, params.questionId, isNewQuestion, questionForm])

  const handleSaveQuestion = async (data: QuestionConfigData) => {
    try {
      setSaving(true)
      
      if (isNewQuestion) {
        // Create new question
        const newQuestion = await QuestionnaireQuestionService.create({
          template_id: params.id as string,
          page_id: params.pageId as string,
          section: "general",
          question_text: data.question_text,
          question_type: data.question_type,
          options: questionConfig,
          validation_rules: {},
          is_required: data.is_required,
          order_index: 1, // Will be adjusted by the backend
          help_text: data.help_text,
          placeholder_text: data.placeholder_text,
          tooltip_text: data.tooltip_text,
          validation_message: data.validation_message,
          question_group: data.question_group,
          conditional_logic: {}
        })
        
        toast.success("Question created successfully")
        router.push(`/admin/templates/${params.id}/edit/${params.pageId}`)
      } else {
        // Update existing question
        if (!question) {
          toast.error("Question not found")
          return
        }
        
        const updatedQuestion = await QuestionnaireQuestionService.update(question.id, {
          question_text: data.question_text,
          question_type: data.question_type,
          help_text: data.help_text,
          placeholder_text: data.placeholder_text,
          tooltip_text: data.tooltip_text,
          is_required: data.is_required,
          validation_message: data.validation_message,
          question_group: data.question_group,
          options: questionConfig
        })
        
        toast.success("Question updated successfully")
        router.push(`/admin/templates/${params.id}/edit/${params.pageId}`)
      }
    } catch (err) {
      console.error("Error saving question:", err)
      toast.error("Failed to save question")
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

  const breadcrumbs = [
    { label: "Templates", href: "/admin/templates" },
    { label: template?.name || "Template", href: `/admin/templates/${params.id}` },
    { label: page?.title || "Page", href: `/admin/templates/${params.id}/edit/${params.pageId}` },
    { label: isNewQuestion ? "New Question" : "Edit Question", href: "#" }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Breadcrumbs items={breadcrumbs} />
          <h1 className="text-2xl font-semibold text-gray-900">
            {isNewQuestion ? "Create New Question" : "Edit Question"}
          </h1>
          <p className="text-sm text-gray-600">
            Configure the question text, type, and properties for {page?.title}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href={`/admin/templates/${params.id}/edit/${params.pageId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Questions
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <form onSubmit={questionForm.handleSubmit(handleSaveQuestion)} className="space-y-6">
        {/* Basic Question Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Configure the fundamental properties of your question.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="question_text">Question Text *</Label>
                  <Textarea
                    id="question_text"
                    placeholder="e.g., What is your name?"
                    rows={3}
                    {...questionForm.register("question_text")}
                  />
                  {questionForm.formState.errors.question_text && (
                    <p className="text-sm text-red-600">{questionForm.formState.errors.question_text.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="question_type">Question Type *</Label>
                  <Select 
                    value={questionForm.watch("question_type")} 
                    onValueChange={(value) => {
                      questionForm.setValue("question_type", value as QuestionType)
                      // Reset question config when type changes
                      setQuestionConfig({})
                    }}
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

              {/* Right Column - Additional Settings */}
              <div className="space-y-4">
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

                <div className="space-y-2">
                  <Label htmlFor="help_text">Help Text</Label>
                  <Textarea
                    id="help_text"
                    placeholder="Additional instructions for the question..."
                    rows={3}
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Configuration */}
        {(['single_choice', 'multiple_choice', 'checkbox', 'file_upload', 'photo_upload', 'photo_grid'].includes(questionForm.watch("question_type"))) && (
          <div>
            {['single_choice', 'multiple_choice', 'checkbox'].includes(questionForm.watch("question_type")) ? (
              <Card>
                <CardHeader>
                  <CardTitle>Choice Configuration</CardTitle>
                  <CardDescription>
                    Configure the available options for this question.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChoiceQuestionConfig
                    questionType={questionForm.watch("question_type")}
                    config={questionConfig}
                    onChange={setQuestionConfig}
                  />
                </CardContent>
              </Card>
            ) : (
              <QuestionConfigForm
                questionType={questionForm.watch("question_type")}
                config={questionConfig}
                onChange={setQuestionConfig}
                questionId={question?.id}
              />
            )}
          </div>
        )}

        {/* Save Actions */}
        <div className="flex justify-end gap-3 border-t pt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push(`/admin/templates/${params.id}/edit/${params.pageId}`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving 
              ? "Saving..." 
              : isNewQuestion 
                ? "Create Question" 
                : "Update Question"
            }
          </Button>
        </div>
      </form>
    </div>
  )
} 