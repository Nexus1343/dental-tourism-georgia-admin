import { supabase } from './supabase'
import {
  QuestionnaireTemplate,
  QuestionnairePage,
  QuestionnaireQuestion,
  Clinic,
  ClinicQuestionnaireTemplate,
  CreateQuestionnaireTemplate,
  CreateQuestionnairePage,
  CreateQuestionnaireQuestion,
  CreateClinic,
  QuestionnaireTemplateWithDetails,
  PaginatedResponse,
  ApiResponse,
  BeforeAfterCase,
  CreateBeforeAfterCase,
  UpdateBeforeAfterCase,
  BeforeAfterCaseFilters,
  CaseDisplayStatus
} from '@/types/database'

// Questionnaire Template Services
export class QuestionnaireTemplateService {
  static async getAll(options?: {
    search?: string
    status?: 'active' | 'inactive'
    language?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<QuestionnaireTemplate>> {
    let query = supabase
      .from('questionnaire_templates')
      .select('*', { count: 'exact' })

    // Apply filters
    if (options?.search) {
      query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`)
    }
    
    if (options?.status) {
      query = query.eq('is_active', options.status === 'active')
    }
    
    if (options?.language) {
      query = query.eq('language', options.language)
    }

    // Apply pagination
    const page = options?.page || 1
    const limit = options?.limit || 10
    const from = (page - 1) * limit
    const to = from + limit - 1

    query = query.range(from, to).order('updated_at', { ascending: false })

    const { data, error, count } = await query

    if (error) throw error

    return {
      data: data || [],
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    }
  }

  static async getById(id: string): Promise<QuestionnaireTemplateWithDetails | null> {
    const { data, error } = await supabase
      .from('questionnaire_templates')
      .select(`
        *,
        pages:questionnaire_pages(*),
        questions:questionnaire_questions(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async create(template: CreateQuestionnaireTemplate): Promise<QuestionnaireTemplate> {
    const { data, error } = await supabase
      .from('questionnaire_templates')
      .insert([template])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async update(id: string, template: Partial<QuestionnaireTemplate>): Promise<QuestionnaireTemplate> {
    const { data, error } = await supabase
      .from('questionnaire_templates')
      .update({ ...template, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('questionnaire_templates')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  static async duplicate(id: string, newName: string): Promise<QuestionnaireTemplate> {
    // First get the original template
    const original = await this.getById(id)
    if (!original) throw new Error('Template not found')

    // Create new template
    const newTemplate = await this.create({
      name: newName,
      description: original.description,
      estimated_completion_minutes: original.estimated_completion_minutes,
      introduction_text: original.introduction_text,
      completion_message: original.completion_message,
      language: original.language
    })

    // Duplicate pages and questions
    if (original.pages) {
      for (const page of original.pages) {
        const newPageData: CreateQuestionnairePage = {
          template_id: newTemplate.id,
          page_number: page.page_number,
          title: page.title,
          description: page.description,
          instruction_text: page.instruction_text,
          page_type: page.page_type,
          show_progress: page.show_progress,
          allow_back_navigation: page.allow_back_navigation,
          auto_advance: page.auto_advance
        }
        
        const newPage = await QuestionnairePageService.create(newPageData)
        
        // Duplicate questions for this page
        const pageQuestions = original.questions?.filter(q => q.page_id === page.id)
        if (pageQuestions) {
          for (const question of pageQuestions) {
            await QuestionnaireQuestionService.create({
              template_id: newTemplate.id,
              page_id: newPage.id,
              section: question.section,
              question_text: question.question_text,
              question_type: question.question_type,
              options: question.options,
              validation_rules: question.validation_rules,
              is_required: question.is_required,
              order_index: question.order_index,
              conditional_logic: question.conditional_logic,
              help_text: question.help_text,
              placeholder_text: question.placeholder_text,
              question_group: question.question_group,
              validation_message: question.validation_message,
              tooltip_text: question.tooltip_text
            })
          }
        }
      }
    }

    return newTemplate
  }

  static async toggleStatus(id: string): Promise<QuestionnaireTemplate> {
    const template = await this.getById(id)
    if (!template) throw new Error('Template not found')

    return this.update(id, { is_active: !template.is_active })
  }

  static async getStatistics(id: string): Promise<{
    totalSubmissions: number
    completionRate: number
    averageCompletionTime: number
    assignedClinics: number
    dropOffPoints: Array<{
      page: string
      dropOffRate: number
    }>
  }> {
    // Since we don't have submissions table yet, we'll calculate stats from available data
    
    // Get assigned clinics count
    const { data: clinicAssignments, error: clinicError } = await supabase
      .from('clinic_questionnaire_templates')
      .select('*')
      .eq('template_id', id)
      .eq('is_active', true)

    if (clinicError) throw clinicError

    // Get pages for drop-off analysis (simulate based on page complexity)
    const { data: pages, error: pagesError } = await supabase
      .from('questionnaire_pages')
      .select('id, title, page_number')
      .eq('template_id', id)
      .order('page_number')

    if (pagesError) throw pagesError

    // Get questions count for each page
    const pageStats = await Promise.all(
      (pages || []).map(async (page) => {
        const { data: questions, error } = await supabase
          .from('questionnaire_questions')
          .select('id')
          .eq('page_id', page.id)
        
        if (error) throw error
        
        // Simulate drop-off rate based on page complexity
        const questionCount = questions?.length || 0
        const baseDropOff = 2 // Base 2% drop-off
        const complexityDropOff = questionCount * 0.5 // 0.5% per question
        const dropOffRate = Math.min(baseDropOff + complexityDropOff, 15) // Max 15%
        
        return {
          page: page.title,
          dropOffRate: Math.round(dropOffRate * 10) / 10
        }
      })
    )

    // For now, return simulated stats until we have actual submissions
    // In a real implementation, this would query actual submission data
    const assignedClinicsCount = clinicAssignments?.length || 0
    const totalSubmissions = assignedClinicsCount * 12 // Simulate 12 submissions per clinic
    const completionRate = Math.max(85 - (pageStats.length * 3), 70) // Decrease with more pages
    const averageCompletionTime = Math.ceil(pageStats.reduce((sum, page) => sum + 1.5, 0)) // 1.5 min per page

    return {
      totalSubmissions,
      completionRate,
      averageCompletionTime,
      assignedClinics: assignedClinicsCount,
      dropOffPoints: pageStats
    }
  }

  static async createVersion(id: string, versionNotes?: string): Promise<QuestionnaireTemplate> {
    // Get current template with all data
    const template = await this.getById(id)
    if (!template) throw new Error('Template not found')

    // Create new version by duplicating and incrementing version
    const newVersion = template.version + 1
    const versionedName = `${template.name} v${newVersion}`
    
    return this.duplicate(id, versionedName)
  }

  static async getVersions(templateName: string): Promise<QuestionnaireTemplate[]> {
    // Get all templates with same base name (different versions)
    const baseName = templateName.replace(/ v\d+$/, '') // Remove version suffix if present
    
    const { data, error } = await supabase
      .from('questionnaire_templates')
      .select('*')
      .or(`name.eq.${baseName},name.like.${baseName} v%`)
      .order('version', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async rollbackToVersion(currentId: string, targetVersionId: string): Promise<QuestionnaireTemplate> {
    // This would typically involve more complex logic to merge versions
    // For now, we'll duplicate the target version as a new current version
    const targetTemplate = await this.getById(targetVersionId)
    if (!targetTemplate) throw new Error('Target version not found')

    const newVersion = targetTemplate.version + 1
    const rolledBackName = targetTemplate.name.replace(/ v\d+$/, '') // Remove version suffix
    
    return this.duplicate(targetVersionId, rolledBackName)
  }
}

// Questionnaire Page Services
export class QuestionnairePageService {
  static async getByTemplateId(templateId: string): Promise<QuestionnairePage[]> {
    const { data, error } = await supabase
      .from('questionnaire_pages')
      .select('*')
      .eq('template_id', templateId)
      .order('page_number', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async getById(id: string): Promise<QuestionnairePage | null> {
    const { data, error } = await supabase
      .from('questionnaire_pages')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async create(page: CreateQuestionnairePage): Promise<QuestionnairePage> {
    const { data, error } = await supabase
      .from('questionnaire_pages')
      .insert([page])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async update(id: string, page: Partial<QuestionnairePage>): Promise<QuestionnairePage> {
    const { data, error } = await supabase
      .from('questionnaire_pages')
      .update({ ...page, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('questionnaire_pages')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  static async reorder(templateId: string, pageIds: string[]): Promise<void> {
    const updates = pageIds.map((id, index) => 
      supabase
        .from('questionnaire_pages')
        .update({ page_number: index + 1 })
        .eq('id', id)
    )

    await Promise.all(updates)
  }
}

// Questionnaire Question Services
export class QuestionnaireQuestionService {
  static async getByPageId(pageId: string): Promise<QuestionnaireQuestion[]> {
    const { data, error } = await supabase
      .from('questionnaire_questions')
      .select('*')
      .eq('page_id', pageId)
      .order('order_index', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async getByTemplateId(templateId: string): Promise<QuestionnaireQuestion[]> {
    const { data, error } = await supabase
      .from('questionnaire_questions')
      .select('*')
      .eq('template_id', templateId)
      .order('order_index', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async create(question: CreateQuestionnaireQuestion): Promise<QuestionnaireQuestion> {
    const { data, error } = await supabase
      .from('questionnaire_questions')
      .insert([question])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async update(id: string, question: Partial<QuestionnaireQuestion>): Promise<QuestionnaireQuestion> {
    const { data, error } = await supabase
      .from('questionnaire_questions')
      .update({ ...question, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('questionnaire_questions')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  static async reorder(pageId: string, questionIds: string[]): Promise<void> {
    const updates = questionIds.map((id, index) => 
      supabase
        .from('questionnaire_questions')
        .update({ order_index: index + 1 })
        .eq('id', id)
    )

    await Promise.all(updates)
  }
}

// Clinic Services
export class ClinicService {
  static async getAll(options?: {
    search?: string
    status?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Clinic>> {
    let query = supabase
      .from('clinics')
      .select('*', { count: 'exact' })

    if (options?.search) {
      query = query.or(`name.ilike.%${options.search}%,city.ilike.%${options.search}%,description.ilike.%${options.search}%`)
    }

    if (options?.status && options.status !== 'all') {
      query = query.eq('status', options.status)
    }

    const page = options?.page || 1
    const limit = options?.limit || 10
    const from = (page - 1) * limit
    const to = from + limit - 1

    query = query.range(from, to).order('name', { ascending: true })

    const { data, error, count } = await query

    if (error) throw error

    return {
      data: data || [],
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    }
  }

  static async getById(id: string): Promise<Clinic | null> {
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async create(clinic: CreateClinic): Promise<Clinic> {
    const clinicData = {
      ...clinic,
      accreditations: clinic.accreditations || [],
      facilities: clinic.facilities || [],
      languages_spoken: clinic.languages_spoken || [],
      images: clinic.images || [],
      seo_keywords: clinic.seo_keywords || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('clinics')
      .insert([clinicData])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async update(id: string, updates: Partial<CreateClinic>): Promise<Clinic> {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('clinics')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async delete(id: string): Promise<void> {
    // First, deactivate any template assignments
    await supabase
      .from('clinic_questionnaire_templates')
      .update({ is_active: false })
      .eq('clinic_id', id)

    // Then delete the clinic
    const { error } = await supabase
      .from('clinics')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  static async updateStatus(id: string, status: 'active' | 'inactive' | 'pending_approval' | 'suspended'): Promise<Clinic> {
    const { data, error } = await supabase
      .from('clinics')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getBySlug(slug: string): Promise<Clinic | null> {
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No rows returned
      throw error
    }
    return data
  }

  static async checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
    let query = supabase
      .from('clinics')
      .select('id')
      .eq('slug', slug)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data, error } = await query

    if (error) throw error
    return (data?.length || 0) > 0
  }

  static async getStatistics(): Promise<{
    total: number
    active: number
    inactive: number
    pending: number
    totalTemplateAssignments: number
  }> {
    // Get clinic counts by status
    const { data: clinics, error: clinicsError } = await supabase
      .from('clinics')
      .select('status')

    if (clinicsError) throw clinicsError

    // Get total template assignments
    const { data: assignments, error: assignmentsError } = await supabase
      .from('clinic_questionnaire_templates')
      .select('id')
      .eq('is_active', true)

    if (assignmentsError) throw assignmentsError

    const statusCounts = clinics?.reduce((acc, clinic) => {
      acc[clinic.status] = (acc[clinic.status] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    return {
      total: clinics?.length || 0,
      active: statusCounts['active'] || 0,
      inactive: statusCounts['inactive'] || 0,
      pending: statusCounts['pending'] || 0,
      totalTemplateAssignments: assignments?.length || 0
    }
  }
}

// Clinic Template Assignment Services
export class ClinicTemplateService {
  static async assignTemplate(
    clinicId: string, 
    templateId: string, 
    options?: {
      isDefault?: boolean
      effectiveFrom?: string
      effectiveUntil?: string
      customizations?: Record<string, any>
    }
  ): Promise<ClinicQuestionnaireTemplate> {
    const assignment = {
      clinic_id: clinicId,
      template_id: templateId,
      is_default: options?.isDefault || false,
      effective_from: options?.effectiveFrom,
      effective_until: options?.effectiveUntil,
      customizations: options?.customizations || {}
    }

    const { data, error } = await supabase
      .from('clinic_questionnaire_templates')
      .insert([assignment])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getClinicTemplates(clinicId: string): Promise<ClinicQuestionnaireTemplate[]> {
    const { data, error } = await supabase
      .from('clinic_questionnaire_templates')
      .select(`
        *,
        template:questionnaire_templates(*)
      `)
      .eq('clinic_id', clinicId)
      .eq('is_active', true)

    if (error) throw error
    return data || []
  }

  static async getTemplateAssignments(templateId: string): Promise<ClinicQuestionnaireTemplate[]> {
    const { data, error } = await supabase
      .from('clinic_questionnaire_templates')
      .select(`
        *,
        clinic:clinics(*)
      `)
      .eq('template_id', templateId)
      .eq('is_active', true)

    if (error) throw error
    return data || []
  }

  static async removeAssignment(id: string): Promise<void> {
    const { error } = await supabase
      .from('clinic_questionnaire_templates')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// ============================================================================
// BEFORE & AFTER CASES SERVICE
// ============================================================================

export class BeforeAfterCaseService {
  static async getAll(options?: BeforeAfterCaseFilters): Promise<PaginatedResponse<BeforeAfterCase>> {
    let query = supabase
      .from('before_after_cases')
      .select('*', { count: 'exact' })

    // Apply filters
    if (options?.search) {
      query = query.or(`title.ilike.%${options.search}%,treatment_name.ilike.%${options.search}%,treatment_description.ilike.%${options.search}%`)
    }
    
    if (options?.status) {
      query = query.eq('status', options.status)
    }
    
    if (options?.treatment_name) {
      query = query.ilike('treatment_name', `%${options.treatment_name}%`)
    }

    // Apply sorting
    const sortBy = options?.sortBy || 'display_order'
    const sortOrder = options?.sortOrder || 'asc'
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    const page = options?.page || 1
    const limit = options?.limit || 10
    const from = (page - 1) * limit
    const to = from + limit - 1

    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) throw error

    return {
      data: data || [],
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    }
  }

  static async getById(id: string): Promise<BeforeAfterCase | null> {
    const { data, error } = await supabase
      .from('before_after_cases')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async create(caseData: CreateBeforeAfterCase): Promise<BeforeAfterCase> {
    // Get the highest display_order to set as default
    if (!caseData.display_order) {
      const { data: maxOrderData } = await supabase
        .from('before_after_cases')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .single()
      
      caseData.display_order = (maxOrderData?.display_order || 0) + 1
    }

    const { data, error } = await supabase
      .from('before_after_cases')
      .insert([{ ...caseData, status: caseData.status || 'active' }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async update(id: string, caseData: UpdateBeforeAfterCase): Promise<BeforeAfterCase> {
    const { data, error } = await supabase
      .from('before_after_cases')
      .update({ ...caseData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('before_after_cases')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  static async updateStatus(id: string, status: CaseDisplayStatus): Promise<BeforeAfterCase> {
    return this.update(id, { status })
  }

  static async reorder(caseUpdates: Array<{ id: string; display_order: number }>): Promise<void> {
    const updates = caseUpdates.map(({ id, display_order }) => 
      supabase
        .from('before_after_cases')
        .update({ display_order, updated_at: new Date().toISOString() })
        .eq('id', id)
    )

    const results = await Promise.all(updates)
    
    const errors = results.filter(result => result.error)
    if (errors.length > 0) {
      throw new Error(`Failed to reorder cases: ${errors.map(e => e.error?.message).join(', ')}`)
    }
  }

  static async getStatistics(): Promise<{
    total: number
    active: number
    inactive: number
    hidden: number
    byTreatment: Array<{ treatment_name: string; count: number }>
  }> {
    // Get total counts by status
    const { data: statusCounts, error: statusError } = await supabase
      .from('before_after_cases')
      .select('status')

    if (statusError) throw statusError

    const stats = {
      total: statusCounts?.length || 0,
      active: statusCounts?.filter(c => c.status === 'active').length || 0,
      inactive: statusCounts?.filter(c => c.status === 'inactive').length || 0,
      hidden: statusCounts?.filter(c => c.status === 'hidden').length || 0,
      byTreatment: [] as Array<{ treatment_name: string; count: number }>
    }

    // Get counts by treatment name
    const { data: treatmentCounts, error: treatmentError } = await supabase
      .from('before_after_cases')
      .select('treatment_name')

    if (treatmentError) throw treatmentError

    if (treatmentCounts) {
      const treatmentMap = new Map<string, number>()
      treatmentCounts.forEach(case_ => {
        const current = treatmentMap.get(case_.treatment_name) || 0
        treatmentMap.set(case_.treatment_name, current + 1)
      })
      
      stats.byTreatment = Array.from(treatmentMap.entries())
        .map(([treatment_name, count]) => ({ treatment_name, count }))
        .sort((a, b) => b.count - a.count)
    }

    return stats
  }
} 