// Database entity types based on the analyzed schema

export type QuestionType = 
  | 'text'
  | 'textarea'
  | 'email'
  | 'phone'
  | 'number'
  | 'date'
  | 'date_picker'
  | 'single_choice'
  | 'multiple_choice'
  | 'checkbox'
  | 'file_upload'
  | 'photo_upload'
  | 'photo_grid'
  | 'rating'
  | 'slider'
  | 'pain_scale'
  | 'tooth_chart'
  | 'budget_range'

export type PageType = 'intro' | 'standard' | 'photo_upload' | 'summary'

export interface QuestionnaireTemplate {
  id: string
  name: string
  description?: string
  version: number
  is_active: boolean
  language: string
  created_by?: string
  created_at: string
  updated_at: string
  total_pages: number
  estimated_completion_minutes: number
  configuration: Record<string, any>
  introduction_text?: string
  completion_message?: string
}

export interface QuestionnairePage {
  id: string
  template_id: string
  page_number: number
  title: string
  description?: string
  instruction_text?: string
  page_type: PageType
  validation_rules: Record<string, any>
  show_progress: boolean
  allow_back_navigation: boolean
  auto_advance: boolean
  created_at: string
  updated_at: string
}

export interface QuestionnaireQuestion {
  id: string
  template_id: string
  page_id?: string
  section: string
  question_text: string
  question_type: QuestionType
  options?: Record<string, any>
  validation_rules: Record<string, any>
  is_required: boolean
  order_index: number
  conditional_logic?: Record<string, any>
  help_text?: string
  placeholder_text?: string
  question_group?: string
  display_logic: Record<string, any>
  validation_message?: string
  tooltip_text?: string
  created_at: string
  updated_at: string
}

export interface Clinic {
  id: string
  name: string
  slug: string
  status: 'active' | 'inactive' | 'pending_approval' | 'suspended'
  description?: string
  address?: string
  city?: string
  country: string
  phone?: string
  email?: string
  website?: string
  established_year?: number
  license_number?: string
  accreditations: string[]
  facilities: string[]
  languages_spoken: string[]
  operating_hours?: Record<string, any>
  coordinates?: { x: number; y: number }
  images: string[]
  seo_title?: string
  seo_description?: string
  seo_keywords?: string[]
  created_at: string
  updated_at: string
}

export interface ClinicQuestionnaireTemplate {
  id: string
  clinic_id: string
  template_id: string
  is_default: boolean
  is_active: boolean
  customizations: Record<string, any>
  assigned_by?: string
  assigned_at: string
  effective_from?: string
  effective_until?: string
}

// Extended types with relations
export interface QuestionnaireTemplateWithDetails extends QuestionnaireTemplate {
  pages?: QuestionnairePage[]
  questions?: QuestionnaireQuestion[]
  assignedClinics?: Clinic[]
  totalQuestions?: number
}

export interface QuestionnairePageWithQuestions extends QuestionnairePage {
  questions?: QuestionnaireQuestion[]
}

export interface ClinicWithTemplates extends Clinic {
  templates?: ClinicQuestionnaireTemplate[]
}

// Form types for creation/editing
export interface CreateQuestionnaireTemplate {
  name: string
  description?: string
  estimated_completion_minutes: number
  introduction_text?: string
  completion_message?: string
  language?: string
}

export interface CreateQuestionnairePage {
  template_id: string
  page_number: number
  title: string
  description?: string
  instruction_text?: string
  page_type: PageType
  show_progress?: boolean
  allow_back_navigation?: boolean
  auto_advance?: boolean
}

export interface CreateQuestionnaireQuestion {
  template_id: string
  page_id?: string
  section: string
  question_text: string
  question_type: QuestionType
  options?: Record<string, any>
  validation_rules?: Record<string, any>
  is_required?: boolean
  order_index: number
  conditional_logic?: Record<string, any>
  help_text?: string
  placeholder_text?: string
  question_group?: string
  validation_message?: string
  tooltip_text?: string
}

export interface CreateClinic {
  name: string
  slug: string
  status: 'active' | 'inactive' | 'pending_approval' | 'suspended'
  description?: string
  address?: string
  city?: string
  country: string
  phone?: string
  email?: string
  website?: string
  established_year?: number
  license_number?: string
  accreditations?: string[]
  facilities?: string[]
  languages_spoken?: string[]
  operating_hours?: Record<string, any>
  coordinates?: { x: number; y: number }
  images?: string[]
  seo_title?: string
  seo_description?: string
  seo_keywords?: string[]
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
  totalPages: number
} 