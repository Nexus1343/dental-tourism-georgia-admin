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

// ============================================================================
// TREATMENT TYPES
// ============================================================================

export type TreatmentCategory = 
  | 'preventive'
  | 'restorative'
  | 'cosmetic'
  | 'orthodontic'
  | 'surgical'
  | 'periodontal'
  | 'endodontic'
  | 'prosthodontic'
  | 'pediatric'
  | 'emergency'

export interface Treatment {
  id: string
  name: string
  slug: string
  category: TreatmentCategory
  description?: string
  procedure_details?: string
  duration_minutes?: number
  recovery_time_days?: number
  anesthesia_required: boolean
  requirements: string[]
  contraindications: string[]
  benefits: string[]
  risks: string[]
  aftercare_instructions?: string
  images: Record<string, any>[]
  seo_title?: string
  seo_description?: string
  seo_keywords: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateTreatment {
  name: string
  slug?: string
  category: TreatmentCategory
  description?: string
  procedure_details?: string
  duration_minutes?: number
  recovery_time_days?: number
  anesthesia_required?: boolean
  requirements?: string[]
  contraindications?: string[]
  benefits?: string[]
  risks?: string[]
  aftercare_instructions?: string
  images?: Record<string, any>[]
  seo_title?: string
  seo_description?: string
  seo_keywords?: string[]
  is_active?: boolean
}

export type UpdateTreatment = Partial<CreateTreatment>

export interface TreatmentFilters {
  category?: TreatmentCategory
  status?: 'active' | 'inactive'
  search?: string
  page?: number
  limit?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

// ============================================================================
// TREATMENT PACKAGE TYPES
// ============================================================================

export interface TreatmentPackage {
  id: string
  clinic_id?: string
  name: string
  description?: string
  treatment_ids: string[]
  total_base_price: number
  discount_percentage?: number
  min_duration_days?: number
  max_duration_days?: number
  includes_accommodation: boolean
  includes_transportation: boolean
  includes_tourism: boolean
  package_benefits?: string[]
  terms_and_conditions?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateTreatmentPackage {
  clinic_id?: string
  name: string
  description?: string
  treatment_ids: string[]
  total_base_price: number
  discount_percentage?: number
  min_duration_days?: number
  max_duration_days?: number
  includes_accommodation?: boolean
  includes_transportation?: boolean
  includes_tourism?: boolean
  package_benefits?: string[]
  terms_and_conditions?: string
  is_active?: boolean
}

export type UpdateTreatmentPackage = Partial<CreateTreatmentPackage>

export interface TreatmentPackageFilters {
  clinic_id?: string
  status?: 'active' | 'inactive'
  includes_accommodation?: boolean
  includes_transportation?: boolean
  includes_tourism?: boolean
  min_price?: number
  max_price?: number
  search?: string
  page?: number
  limit?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

// Extended type with relations
export interface TreatmentPackageWithDetails extends TreatmentPackage {
  treatments?: Treatment[]
  clinic?: Clinic
  final_price?: number
}

// ============================================================================
// USER MANAGEMENT TYPES
// ============================================================================

export type UserRole = 'super_admin' | 'clinic_admin' | 'doctor' | 'marketing_team' | 'operations_team' | 'patient'
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended'

export interface User {
  id: string
  email: string
  role: UserRole
  status: UserStatus
  first_name?: string
  last_name?: string
  phone?: string
  preferred_language: string
  created_at: string
  updated_at: string
  last_login_at?: string
  metadata: Record<string, any>
}

export interface CreateUserData {
  email: string
  password: string
  role: UserRole
  first_name?: string
  last_name?: string
  phone?: string
  preferred_language?: string
  clinic_id?: string // For clinic_admin role
}

export interface UpdateUserData {
  first_name?: string
  last_name?: string
  phone?: string
  preferred_language?: string
  role?: UserRole
  status?: UserStatus
  metadata?: Record<string, any>
}

export interface UserFilters {
  role?: UserRole
  status?: UserStatus
  search?: string
  page?: number
  pageSize?: number
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

// Database function response type (matches our SQL functions)
export interface DatabaseResponse<T> {
  success: boolean
  data?: T
  error?: string
  pagination?: {
    page: number
    page_size: number
    total_count: number
    total_pages: number
  }
}

// ============================================================================
// PATIENT REVIEWS
// ============================================================================

export interface PatientReview {
  id: string
  patient_name: string
  patient_country: string
  review_text: string
  treatment_id?: string
  rating: number
  is_verified: boolean
  is_active: boolean
  patient_photo_url?: string
  created_at: string
  updated_at: string
  treatments?: Treatment
}

export interface CreatePatientReview {
  patient_name: string
  patient_country: string
  review_text: string
  treatment_id?: string
  rating: number
  is_verified?: boolean
  is_active?: boolean
  patient_photo_url?: string
}

export type UpdatePatientReview = Partial<CreatePatientReview>

export interface PatientReviewFilters {
  search?: string
  country?: string
  rating?: number
  isVerified?: boolean
  isActive?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// ============================================================================
// BLOG POSTS
// ============================================================================

export type BlogPostStatus = 'draft' | 'published' | 'archived'

export interface BlogPostImage {
  id: string
  url: string
  filename: string
  size: number
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  short_description?: string
  main_text_body: string
  images: BlogPostImage[]
  author_id?: string
  status: BlogPostStatus
  language: string
  tags?: string[]
  featured_image_url?: string
  is_featured: boolean
  view_count: number
  seo_title?: string
  seo_description?: string
  seo_keywords?: string[]
  published_at?: string
  created_at: string
  updated_at: string
}

export interface CreateBlogPost {
  title: string
  slug?: string
  short_description?: string
  main_text_body: string
  images?: BlogPostImage[]
  author_id?: string
  status?: BlogPostStatus
  language?: string
  tags?: string[]
  featured_image_url?: string
  is_featured?: boolean
  seo_title?: string
  seo_description?: string
  seo_keywords?: string[]
  published_at?: string
}

export type UpdateBlogPost = Partial<CreateBlogPost>

export interface BlogPostFilters {
  search?: string
  status?: BlogPostStatus
  language?: string
  is_featured?: boolean
  author_id?: string
  tags?: string[]
  date_from?: string
  date_to?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface BlogPostWithAuthor extends BlogPost {
  author?: User
}

// ============================================================================
// BEFORE & AFTER CASES
// ============================================================================

export type CaseDisplayStatus = 'active' | 'inactive' | 'hidden'

export interface BeforeAfterCase {
  id: string
  title: string
  treatment_name: string
  treatment_description: string
  before_image_url: string
  after_image_url: string
  status: CaseDisplayStatus
  display_order: number
  created_at: string
  updated_at: string
}

export interface CreateBeforeAfterCase {
  title: string
  treatment_name: string
  treatment_description: string
  before_image_url: string
  after_image_url: string
  status?: CaseDisplayStatus
  display_order?: number
}

export type UpdateBeforeAfterCase = Partial<CreateBeforeAfterCase>

export interface BeforeAfterCaseFilters {
  search?: string
  status?: CaseDisplayStatus
  treatment_name?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
} 