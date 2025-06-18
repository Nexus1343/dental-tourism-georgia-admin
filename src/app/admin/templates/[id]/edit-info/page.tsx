'use client'

import React, { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  ArrowRight,
  Save,
  FileEdit,
  MessageSquare,
  Settings,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { toast } from "sonner"

// Validation schemas for each step
const basicInfoSchema = z.object({
  name: z.string().min(1, "Template name is required").max(255, "Name too long"),
  description: z.string().max(500, "Description too long"),
  estimated_completion_minutes: z.number().min(1, "Must be at least 1 minute").max(120, "Must be less than 2 hours"),
  language: z.enum(["en", "ka", "ru"], { required_error: "Please select a language" })
})

const messagesSchema = z.object({
  introduction_text: z.string().min(1, "Introduction text is required").max(1000, "Introduction too long"),
  completion_message: z.string().min(1, "Completion message is required").max(1000, "Completion too long")
})

const configSchema = z.object({
  allow_save_draft: z.boolean(),
  show_progress: z.boolean(),
  allow_back_navigation: z.boolean(),
  require_completion: z.boolean(),
  auto_save_interval: z.number().min(30).max(600)
})

type BasicInfoData = z.infer<typeof basicInfoSchema>
type MessagesData = z.infer<typeof messagesSchema>
type ConfigData = z.infer<typeof configSchema>

type TemplateFormData = BasicInfoData & MessagesData & ConfigData

export default function EditTemplateInfoPage() {
  const router = useRouter()
  const params = useParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<Partial<TemplateFormData>>({
    allow_save_draft: true,
    show_progress: true,
    allow_back_navigation: true,
    require_completion: false,
    auto_save_interval: 60
  })

  const steps = [
    { number: 1, title: "Basic Information", icon: FileEdit },
    { number: 2, title: "Introduction & Messages", icon: MessageSquare },
    { number: 3, title: "Configuration", icon: Settings }
  ]

  // Load existing template data
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/templates/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to load template')
        }
        const result = await response.json()
        const template = result.data // Extract the template from the data property
        
        console.log("Loaded template data:", template) // Debug log
        
        setFormData({
          name: template.name,
          description: template.description || "",
          estimated_completion_minutes: template.estimated_completion_minutes,
          language: template.language,
          introduction_text: template.introduction_text || "",
          completion_message: template.completion_message || "",
          allow_save_draft: true,
          show_progress: true,
          allow_back_navigation: true,
          require_completion: false,
          auto_save_interval: 60
        })
      } catch (error) {
        console.error("Error loading template:", error)
        toast.error("Failed to load template")
      } finally {
        setLoading(false)
      }
    }

    loadTemplate()
  }, [params.id])

  // Step 1: Basic Information Form
  const basicInfoForm = useForm<BasicInfoData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: "",
      description: "",
      estimated_completion_minutes: 10,
      language: "en"
    }
  })

  // Step 2: Messages Form
  const messagesForm = useForm<MessagesData>({
    resolver: zodResolver(messagesSchema),
    defaultValues: {
      introduction_text: "",
      completion_message: ""
    }
  })

  // Step 3: Configuration Form
  const configForm = useForm<ConfigData>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      allow_save_draft: true,
      show_progress: true,
      allow_back_navigation: true,
      require_completion: false,
      auto_save_interval: 60
    }
  })

  // Update forms when data is loaded
  useEffect(() => {
    if (formData.name) {
      basicInfoForm.reset({
        name: formData.name || "",
        description: formData.description || "",
        estimated_completion_minutes: formData.estimated_completion_minutes || 10,
        language: formData.language || "en"
      })
      
      messagesForm.reset({
        introduction_text: formData.introduction_text || "",
        completion_message: formData.completion_message || ""
      })
      
      configForm.reset({
        allow_save_draft: formData.allow_save_draft || true,
        show_progress: formData.show_progress || true,
        allow_back_navigation: formData.allow_back_navigation || true,
        require_completion: formData.require_completion || false,
        auto_save_interval: formData.auto_save_interval || 60
      })
    }
  }, [formData, basicInfoForm, messagesForm, configForm])

  const handleStepSubmit = async (stepData: any, nextStep?: number) => {
    setFormData(prev => ({ ...prev, ...stepData }))
    if (nextStep) {
      setCurrentStep(nextStep)
    }
  }

  const handleFinalSubmit = async (finalStepData: ConfigData) => {
    setIsSubmitting(true)
    try {
      const completeData = { ...formData, ...finalStepData }
      
      // Update template using the API
      const response = await fetch(`/api/admin/templates/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: completeData.name!,
          description: completeData.description,
          estimated_completion_minutes: completeData.estimated_completion_minutes!,
          introduction_text: completeData.introduction_text,
          completion_message: completeData.completion_message,
          language: completeData.language!
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update template')
      }
      
      toast.success("Template updated successfully!")
      
      // Redirect back to template view page
      router.push(`/admin/templates/${params.id}`)
    } catch (error) {
      console.error("Error updating template:", error)
      toast.error("Failed to update template. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCurrentStepData = () => {
    switch (currentStep) {
      case 1:
        return basicInfoForm.getValues()
      case 2:
        return messagesForm.getValues()
      case 3:
        return configForm.getValues()
      default:
        return {}
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/admin/templates/${params.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Template
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Template</h1>
            <p className="text-muted-foreground">
              Update template information and settings
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/templates/${params.id}`)}
          >
            Cancel
          </Button>
        </div>
      </div>

      {/* Step Indicator */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center gap-3 ${
                  step.number === currentStep 
                    ? 'text-primary' 
                    : step.number < currentStep 
                      ? 'text-green-600' 
                      : 'text-muted-foreground'
                }`}>
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step.number === currentStep 
                      ? 'border-primary bg-primary/10' 
                      : step.number < currentStep 
                        ? 'border-green-600 bg-green-50' 
                        : 'border-muted'
                  }`}>
                    {step.number < currentStep ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium">Step {step.number}</div>
                    <div className="text-xs">{step.title}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`mx-6 h-px w-16 ${
                    step.number < currentStep ? 'bg-green-600' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {React.createElement(steps[currentStep - 1].icon, { className: "h-5 w-5" })}
            Step {currentStep}: {steps[currentStep - 1].title}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && "Update the basic information for your questionnaire template"}
            {currentStep === 2 && "Update the introduction and completion messages"}
            {currentStep === 3 && "Update advanced configuration options"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <form onSubmit={basicInfoForm.handleSubmit((data) => handleStepSubmit(data, 2))} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Dental Implant Assessment"
                    {...basicInfoForm.register("name")}
                  />
                  {basicInfoForm.formState.errors.name && (
                    <p className="text-sm text-red-600">{basicInfoForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language *</Label>
                  <Select 
                    value={basicInfoForm.watch("language")} 
                    onValueChange={(value) => basicInfoForm.setValue("language", value as "en" | "ka" | "ru")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ka">Georgian</SelectItem>
                      <SelectItem value="ru">Russian</SelectItem>
                    </SelectContent>
                  </Select>
                  {basicInfoForm.formState.errors.language && (
                    <p className="text-sm text-red-600">{basicInfoForm.formState.errors.language.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of what this template is used for..."
                  rows={3}
                  {...basicInfoForm.register("description")}
                />
                {basicInfoForm.formState.errors.description && (
                  <p className="text-sm text-red-600">{basicInfoForm.formState.errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated_completion_minutes">Estimated Completion Time (minutes) *</Label>
                <Input
                  id="estimated_completion_minutes"
                  type="number"
                  min="1"
                  max="120"
                  {...basicInfoForm.register("estimated_completion_minutes", { valueAsNumber: true })}
                />
                {basicInfoForm.formState.errors.estimated_completion_minutes && (
                  <p className="text-sm text-red-600">{basicInfoForm.formState.errors.estimated_completion_minutes.message}</p>
                )}
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={!basicInfoForm.formState.isValid}>
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          )}

          {/* Step 2: Introduction & Messages */}
          {currentStep === 2 && (
            <form onSubmit={messagesForm.handleSubmit((data) => handleStepSubmit(data, 3))} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="introduction_text">Introduction Text *</Label>
                <Textarea
                  id="introduction_text"
                  placeholder="Welcome message that patients will see when starting the questionnaire..."
                  rows={4}
                  {...messagesForm.register("introduction_text")}
                />
                {messagesForm.formState.errors.introduction_text && (
                  <p className="text-sm text-red-600">{messagesForm.formState.errors.introduction_text.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  This text will be displayed on the first page of the questionnaire.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="completion_message">Completion Message *</Label>
                <Textarea
                  id="completion_message"
                  placeholder="Thank you message displayed after completing the questionnaire..."
                  rows={4}
                  {...messagesForm.register("completion_message")}
                />
                {messagesForm.formState.errors.completion_message && (
                  <p className="text-sm text-red-600">{messagesForm.formState.errors.completion_message.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  This message will be shown after the patient completes the questionnaire.
                </p>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous Step
                </Button>
                <Button type="submit" disabled={!messagesForm.formState.isValid}>
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: Configuration */}
          {currentStep === 3 && (
            <form onSubmit={configForm.handleSubmit(handleFinalSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="allow_save_draft">Allow Save Draft</Label>
                      <p className="text-xs text-muted-foreground">
                        Patients can save their progress and continue later
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      id="allow_save_draft"
                      className="h-4 w-4"
                      {...configForm.register("allow_save_draft")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="show_progress">Show Progress</Label>
                      <p className="text-xs text-muted-foreground">
                        Display progress bar to patients
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      id="show_progress"
                      className="h-4 w-4"
                      {...configForm.register("show_progress")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="allow_back_navigation">Allow Back Navigation</Label>
                      <p className="text-xs text-muted-foreground">
                        Patients can go back to previous pages
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      id="allow_back_navigation"
                      className="h-4 w-4"
                      {...configForm.register("allow_back_navigation")}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="require_completion">Require Completion</Label>
                      <p className="text-xs text-muted-foreground">
                        All questions must be answered to submit
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      id="require_completion"
                      className="h-4 w-4"
                      {...configForm.register("require_completion")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="auto_save_interval">Auto Save Interval (seconds)</Label>
                    <Input
                      id="auto_save_interval"
                      type="number"
                      min="30"
                      max="600"
                      {...configForm.register("auto_save_interval", { valueAsNumber: true })}
                    />
                    <p className="text-xs text-muted-foreground">
                      How often to automatically save progress (30-600 seconds)
                    </p>
                    {configForm.formState.errors.auto_save_interval && (
                      <p className="text-sm text-red-600">{configForm.formState.errors.auto_save_interval.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous Step
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 