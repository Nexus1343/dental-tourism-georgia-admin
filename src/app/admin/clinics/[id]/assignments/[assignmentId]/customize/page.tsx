'use client'

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft,
  Save,
  Eye,
  RotateCcw,
  History,
  Plus,
  Edit,
  Trash2,
  Copy,
  Settings,
  Palette,
  MessageSquare,
  FileText,
  Image,
  Check,
  X,
  AlertTriangle,
  Info
} from "lucide-react"

interface CustomQuestion {
  id: string
  question_text: string
  question_type: string
  is_required: boolean
  position: number
  page_id: string
  validation_rules: Record<string, any>
  options: string[]
}

interface QuestionCustomization {
  question_id: string
  original_text: string
  custom_text: string
  custom_help_text?: string
  custom_validation?: Record<string, any>
  is_hidden: boolean
  custom_options?: string[]
}

interface TemplateCustomization {
  id: string
  template_id: string
  clinic_id: string
  assignment_id: string
  custom_intro_message: string
  custom_completion_message: string
  custom_branding: {
    logo_url?: string
    primary_color?: string
    secondary_color?: string
    font_family?: string
  }
  question_customizations: QuestionCustomization[]
  custom_questions: CustomQuestion[]
  version: number
  created_at: string
  updated_at: string
  created_by: string
}

interface OriginalQuestion {
  id: string
  question_text: string
  help_text?: string
  question_type: string
  is_required: boolean
  page_id: string
  page_title: string
  validation_rules: Record<string, any>
  options?: string[]
}

// Mock data
const mockOriginalQuestions: OriginalQuestion[] = [
  {
    id: "1",
    question_text: "What is your primary reason for seeking dental treatment?",
    help_text: "Please select the main concern that brought you to our clinic",
    question_type: "single_choice",
    is_required: true,
    page_id: "page1",
    page_title: "Initial Assessment",
    validation_rules: {},
    options: ["Routine checkup", "Pain or discomfort", "Cosmetic improvement", "Emergency treatment"]
  },
  {
    id: "2",
    question_text: "When was your last dental visit?",
    question_type: "single_choice",
    is_required: true,
    page_id: "page1", 
    page_title: "Initial Assessment",
    validation_rules: {},
    options: ["Less than 6 months", "6-12 months", "1-2 years", "More than 2 years", "Never"]
  },
  {
    id: "3",
    question_text: "Do you have any allergies to medications or dental materials?",
    help_text: "Include any known allergies to antibiotics, anesthetics, or dental materials",
    question_type: "textarea",
    is_required: false,
    page_id: "page2",
    page_title: "Medical History",
    validation_rules: { max_length: 500 },
    options: []
  }
]

const mockCustomization: TemplateCustomization = {
  id: "1",
  template_id: "1",
  clinic_id: "1",
  assignment_id: "1",
  custom_intro_message: "Welcome to Smile Perfect Dental Clinic! We're excited to help you achieve your perfect smile.",
  custom_completion_message: "Thank you for completing our questionnaire. Our team will review your responses and contact you soon.",
  custom_branding: {
    logo_url: "https://example.com/logo.png",
    primary_color: "#0066CC",
    secondary_color: "#F8F9FA",
    font_family: "Inter"
  },
  question_customizations: [
    {
      question_id: "1",
      original_text: "What is your primary reason for seeking dental treatment?",
      custom_text: "What brings you to Smile Perfect Dental Clinic today?",
      custom_help_text: "Help us understand your primary dental concern so we can provide the best care",
      is_hidden: false
    },
    {
      question_id: "3",
      original_text: "Do you have any allergies to medications or dental materials?",
      custom_text: "Please list any allergies or sensitivities we should know about",
      custom_help_text: "This helps ensure your safety during treatment",
      is_hidden: false,
      custom_validation: { max_length: 300 }
    }
  ],
  custom_questions: [
    {
      id: "custom-1",
      question_text: "How did you hear about Smile Perfect Dental Clinic?",
      question_type: "single_choice",
      is_required: false,
      position: 1,
      page_id: "page1",
      validation_rules: {},
      options: ["Google search", "Social media", "Friend/family referral", "Doctor referral", "Advertisement", "Other"]
    }
  ],
  version: 2,
  created_at: "2024-01-20T10:30:00Z",
  updated_at: "2024-12-15T14:20:00Z",
  created_by: "Admin User"
}

export default function CustomizeAssignmentPage() {
  const params = useParams()
  const router = useRouter()
  const { id: clinicId, assignmentId } = params

  const [customization, setCustomization] = useState<TemplateCustomization>(mockCustomization)
  const [originalQuestions, setOriginalQuestions] = useState<OriginalQuestion[]>(mockOriginalQuestions)
  const [showPreview, setShowPreview] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [showAddQuestionDialog, setShowAddQuestionDialog] = useState(false)
  const [unsavedChanges, setUnsavedChanges] = useState(false)

  // Mock clinic and template data
  const clinicName = "Smile Perfect Dental Clinic"
  const templateName = "Basic Dental Consultation"

  const updateCustomization = (field: string, value: any) => {
    setCustomization(prev => ({ ...prev, [field]: value }))
    setUnsavedChanges(true)
  }

  const updateBranding = (field: string, value: string) => {
    setCustomization(prev => ({
      ...prev,
      custom_branding: { ...prev.custom_branding, [field]: value }
    }))
    setUnsavedChanges(true)
  }

  const updateQuestionCustomization = (questionId: string, field: string, value: any) => {
    setCustomization(prev => {
      const existing = prev.question_customizations.find(q => q.question_id === questionId)
      if (existing) {
        return {
          ...prev,
          question_customizations: prev.question_customizations.map(q =>
            q.question_id === questionId ? { ...q, [field]: value } : q
          )
        }
      } else {
        const originalQuestion = originalQuestions.find(q => q.id === questionId)
        if (!originalQuestion) return prev
        
        return {
          ...prev,
          question_customizations: [...prev.question_customizations, {
            question_id: questionId,
            original_text: originalQuestion.question_text,
            custom_text: originalQuestion.question_text,
            is_hidden: false,
            [field]: value
          }]
        }
      }
    })
    setUnsavedChanges(true)
  }

  const addCustomQuestion = (question: Omit<CustomQuestion, 'id'>) => {
    const newQuestion: CustomQuestion = {
      ...question,
      id: `custom-${Date.now()}`
    }
    setCustomization(prev => ({
      ...prev,
      custom_questions: [...prev.custom_questions, newQuestion]
    }))
    setUnsavedChanges(true)
    setShowAddQuestionDialog(false)
  }

  const removeCustomQuestion = (questionId: string) => {
    setCustomization(prev => ({
      ...prev,
      custom_questions: prev.custom_questions.filter(q => q.id !== questionId)
    }))
    setUnsavedChanges(true)
  }

  const resetCustomization = (questionId: string) => {
    setCustomization(prev => ({
      ...prev,
      question_customizations: prev.question_customizations.filter(q => q.question_id !== questionId)
    }))
    setUnsavedChanges(true)
  }

  const saveCustomization = async () => {
    // TODO: Implement save logic
    console.log('Saving customization:', customization)
    setUnsavedChanges(false)
  }

  const getQuestionCustomization = (questionId: string) => {
    return customization.question_customizations.find(q => q.question_id === questionId)
  }

  const isQuestionCustomized = (questionId: string) => {
    return customization.question_customizations.some(q => q.question_id === questionId)
  }

  // Group questions by page
  const questionsByPage = originalQuestions.reduce((acc, question) => {
    if (!acc[question.page_id]) {
      acc[question.page_id] = {
        title: question.page_title,
        questions: []
      }
    }
    acc[question.page_id].questions.push(question)
    return acc
  }, {} as Record<string, { title: string; questions: OriginalQuestion[] }>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customize Template</h1>
            <p className="text-gray-600 mt-1">
              Customize &quot;{templateName}&quot; for {clinicName}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {unsavedChanges && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50">
              <AlertTriangle className="mr-1 h-3 w-3" />
              Unsaved Changes
            </Badge>
          )}
          <Button variant="outline" onClick={() => setShowVersionHistory(true)}>
            <History className="mr-2 h-4 w-4" />
            Version History
          </Button>
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button onClick={saveCustomization} disabled={!unsavedChanges}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Customization Tabs */}
      <Tabs defaultValue="messages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="messages">Messages & Branding</TabsTrigger>
          <TabsTrigger value="questions">Question Customization</TabsTrigger>
          <TabsTrigger value="custom">Custom Questions</TabsTrigger>
          <TabsTrigger value="settings">Advanced Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-4">
          {/* Intro/Completion Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Custom Messages
              </CardTitle>
              <CardDescription>
                Customize the intro and completion messages for your clinic
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="intro_message">Introduction Message</Label>
                <Textarea
                  id="intro_message"
                  placeholder="Welcome message for patients..."
                  rows={3}
                  value={customization.custom_intro_message}
                  onChange={(e) => updateCustomization('custom_intro_message', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="completion_message">Completion Message</Label>
                <Textarea
                  id="completion_message"
                  placeholder="Thank you message after completion..."
                  rows={3}
                  value={customization.custom_completion_message}
                  onChange={(e) => updateCustomization('custom_completion_message', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Branding */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Custom Branding
              </CardTitle>
              <CardDescription>
                Customize the visual appearance of the questionnaire
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="logo_url">Logo URL</Label>
                  <Input
                    id="logo_url"
                    placeholder="https://your-clinic.com/logo.png"
                    value={customization.custom_branding.logo_url || ''}
                    onChange={(e) => updateBranding('logo_url', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="font_family">Font Family</Label>
                  <Select 
                    value={customization.custom_branding.font_family || 'Inter'}
                    onValueChange={(value) => updateBranding('font_family', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                      <SelectItem value="Lato">Lato</SelectItem>
                      <SelectItem value="Poppins">Poppins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary_color"
                      type="color"
                      value={customization.custom_branding.primary_color || '#0066CC'}
                      onChange={(e) => updateBranding('primary_color', e.target.value)}
                      className="w-16"
                    />
                    <Input
                      value={customization.custom_branding.primary_color || '#0066CC'}
                      onChange={(e) => updateBranding('primary_color', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary_color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary_color"
                      type="color"
                      value={customization.custom_branding.secondary_color || '#F8F9FA'}
                      onChange={(e) => updateBranding('secondary_color', e.target.value)}
                      className="w-16"
                    />
                    <Input
                      value={customization.custom_branding.secondary_color || '#F8F9FA'}
                      onChange={(e) => updateBranding('secondary_color', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Question Customization</CardTitle>
              <CardDescription>
                Override question text, help text, and validation rules for specific questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="space-y-2">
                {Object.entries(questionsByPage).map(([pageId, page]) => (
                  <AccordionItem key={pageId} value={pageId}>
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center justify-between w-full mr-4">
                        <span>{page.title}</span>
                        <Badge variant="outline">
                          {page.questions.filter(q => isQuestionCustomized(q.id)).length} / {page.questions.length} customized
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        {page.questions.map((question) => {
                          const customization_data = getQuestionCustomization(question.id)
                          const isCustomized = isQuestionCustomized(question.id)
                          
                          return (
                            <div key={question.id} className={`p-4 border rounded-lg ${
                              isCustomized ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                            }`}>
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium">Original:</span>
                                    <Badge variant="outline" className="text-xs">
                                      {question.question_type}
                                    </Badge>
                                    {question.is_required && (
                                      <Badge variant="destructive" className="text-xs">Required</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-700">{question.question_text}</p>
                                  {question.help_text && (
                                    <p className="text-xs text-gray-500 mt-1">{question.help_text}</p>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  {isCustomized && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => resetCustomization(question.id)}
                                    >
                                      <RotateCcw className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div className="space-y-2">
                                  <Label htmlFor={`custom_text_${question.id}`}>Custom Question Text</Label>
                                  <Textarea
                                    id={`custom_text_${question.id}`}
                                    placeholder="Enter custom question text..."
                                    rows={2}
                                    value={customization_data?.custom_text || question.question_text}
                                    onChange={(e) => updateQuestionCustomization(question.id, 'custom_text', e.target.value)}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`custom_help_${question.id}`}>Custom Help Text</Label>
                                  <Input
                                    id={`custom_help_${question.id}`}
                                    placeholder="Enter custom help text..."
                                    value={customization_data?.custom_help_text || question.help_text || ''}
                                    onChange={(e) => updateQuestionCustomization(question.id, 'custom_help_text', e.target.value)}
                                  />
                                </div>

                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={`hide_${question.id}`}
                                    checked={customization_data?.is_hidden || false}
                                    onChange={(e) => updateQuestionCustomization(question.id, 'is_hidden', e.target.checked)}
                                    className="rounded"
                                  />
                                  <Label htmlFor={`hide_${question.id}`}>Hide this question</Label>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Custom Questions</CardTitle>
                  <CardDescription>
                    Add clinic-specific questions to gather additional information
                  </CardDescription>
                </div>
                <Button onClick={() => setShowAddQuestionDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {customization.custom_questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2" />
                  <p>No custom questions added yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {customization.custom_questions.map((question, index) => (
                    <div key={question.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {question.question_type}
                            </Badge>
                            {question.is_required && (
                              <Badge variant="destructive" className="text-xs">Required</Badge>
                            )}
                            <Badge className="text-xs bg-purple-100 text-purple-800 border-purple-200">
                              Custom
                            </Badge>
                          </div>
                          <p className="font-medium">{question.question_text}</p>
                          {question.options && question.options.length > 0 && (
                            <div className="mt-2">
                              <span className="text-sm text-gray-600">Options:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {question.options.map((option, optionIndex) => (
                                  <Badge key={optionIndex} variant="outline" className="text-xs">
                                    {option}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeCustomQuestion(question.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Configure advanced customization options and inheritance rules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Inherit Template Updates</div>
                    <div className="text-sm text-gray-600">
                      Apply updates from the base template
                    </div>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Version Control</div>
                    <div className="text-sm text-gray-600">
                      Track customization changes
                    </div>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700 mb-2">
                  <Info className="h-4 w-4" />
                  <span className="font-medium">Customization Info</span>
                </div>
                <div className="text-sm text-blue-600 space-y-1">
                  <div>Version: {customization.version}</div>
                  <div>Last updated: {new Date(customization.updated_at).toLocaleString()}</div>
                  <div>Created by: {customization.created_by}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Custom Question Dialog */}
      <Dialog open={showAddQuestionDialog} onOpenChange={setShowAddQuestionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Custom Question</DialogTitle>
            <DialogDescription>
              Create a new clinic-specific question
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Question Text</Label>
              <Textarea
                placeholder="Enter your question..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Question Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text Input</SelectItem>
                    <SelectItem value="textarea">Long Text</SelectItem>
                    <SelectItem value="single_choice">Single Choice</SelectItem>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Page</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select page" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(questionsByPage).map(([pageId, page]) => (
                      <SelectItem key={pageId} value={pageId}>
                        {page.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input type="checkbox" id="custom_required" className="rounded" />
              <Label htmlFor="custom_required">Required question</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddQuestionDialog(false)}>
              Cancel
            </Button>
            <Button>
              Add Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Customization Preview</DialogTitle>
            <DialogDescription>
              Preview how the customized questionnaire will appear to patients
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="p-6 border rounded-lg bg-white">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2" style={{ color: customization.custom_branding.primary_color }}>
                  {clinicName}
                </h2>
                <p className="text-gray-600">{customization.custom_intro_message}</p>
              </div>
              
              <div className="space-y-4">
                {originalQuestions.slice(0, 2).map((question) => {
                  const customData = getQuestionCustomization(question.id)
                  return (
                    <div key={question.id} className="p-4 border rounded">
                      <label className="block font-medium mb-2">
                        {customData?.custom_text || question.question_text}
                        {question.is_required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {(customData?.custom_help_text || question.help_text) && (
                        <p className="text-sm text-gray-600 mb-3">
                          {customData?.custom_help_text || question.help_text}
                        </p>
                      )}
                      <div className="bg-gray-100 p-2 rounded text-sm text-gray-500">
                        [{question.question_type} input field]
                      </div>
                    </div>
                  )
                })}
                
                {customization.custom_questions.map((question) => (
                  <div key={question.id} className="p-4 border rounded border-purple-200 bg-purple-50">
                    <label className="block font-medium mb-2">
                      {question.question_text}
                      {question.is_required && <span className="text-red-500 ml-1">*</span>}
                      <Badge className="ml-2 text-xs bg-purple-100 text-purple-800 border-purple-200">
                        Custom
                      </Badge>
                    </label>
                    <div className="bg-gray-100 p-2 rounded text-sm text-gray-500">
                      [{question.question_type} input field]
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded text-center">
                <p className="text-green-800">{customization.custom_completion_message}</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowPreview(false)}>Close Preview</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Version History Dialog */}
      <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
            <DialogDescription>
              Track changes to customizations over time
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            <div className="p-3 border rounded-lg bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Version 2 (Current)</span>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">Active</Badge>
              </div>
              <p className="text-sm text-gray-600">Updated question text and added custom question</p>
              <p className="text-xs text-gray-500 mt-1">
                December 15, 2024 at 2:20 PM by Admin User
              </p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Version 1</span>
                <Button variant="outline" size="sm">Restore</Button>
              </div>
              <p className="text-sm text-gray-600">Initial customization with branding and intro message</p>
              <p className="text-xs text-gray-500 mt-1">
                January 20, 2024 at 10:30 AM by Admin User
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowVersionHistory(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 