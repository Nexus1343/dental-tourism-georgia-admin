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
  QuestionnaireTemplateWithDetails,
  PaginatedResponse,
  ApiResponse
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
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Clinic>> {
    let query = supabase
      .from('clinics')
      .select('*', { count: 'exact' })

    if (options?.search) {
      query = query.or(`name.ilike.%${options.search}%,city.ilike.%${options.search}%`)
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
      .update({ is_active: false })
      .eq('id', id)

    if (error) throw error
  }
} 