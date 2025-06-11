// Utility functions for handling JSONB fields in the database

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'min' | 'max' | 'email' | 'phone' | 'custom'
  value?: any
  message?: string
}

export interface ConditionalLogic {
  condition: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in'
  questionId: string
  value: any
  action: 'show' | 'hide' | 'require' | 'skip'
  operator?: 'and' | 'or'
  children?: ConditionalLogic[]
}

export interface QuestionOption {
  id: string
  label: string
  value: string
  order?: number
  isOther?: boolean
}

export interface PhotoUploadConfig {
  types: PhotoType[]
  maxFileSize: number
  allowedFormats: string[]
  minResolution?: { width: number; height: number }
  maxResolution?: { width: number; height: number }
  compressionQuality?: number
}

export interface PhotoType {
  id: string
  name: string
  description: string
  required: boolean
  exampleImage?: string
  exampleImagePath?: string
  instructions?: string
}

export interface SliderConfig {
  min: number
  max: number
  step: number
  showLabels: boolean
  leftLabel?: string
  rightLabel?: string
  showValue: boolean
}

export interface RatingConfig {
  scale: number
  showLabels: boolean
  labels?: string[]
  allowHalf: boolean
}

// Validation Rules Utilities
export class ValidationUtils {
  static createValidationRules(rules: ValidationRule[]): Record<string, any> {
    const result: Record<string, any> = {}
    
    rules.forEach(rule => {
      switch (rule.type) {
        case 'required':
          result.required = { value: true, message: rule.message || 'This field is required' }
          break
        case 'minLength':
          result.minLength = { value: rule.value, message: rule.message || `Minimum ${rule.value} characters` }
          break
        case 'maxLength':
          result.maxLength = { value: rule.value, message: rule.message || `Maximum ${rule.value} characters` }
          break
        case 'pattern':
          result.pattern = { value: rule.value, message: rule.message || 'Invalid format' }
          break
        case 'min':
          result.min = { value: rule.value, message: rule.message || `Minimum value: ${rule.value}` }
          break
        case 'max':
          result.max = { value: rule.value, message: rule.message || `Maximum value: ${rule.value}` }
          break
        case 'email':
          result.pattern = { 
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
            message: rule.message || 'Invalid email format' 
          }
          break
        case 'phone':
          result.pattern = { 
            value: /^[\+]?[1-9][\d]{0,15}$/, 
            message: rule.message || 'Invalid phone format' 
          }
          break
        case 'custom':
          result[rule.type] = { value: rule.value, message: rule.message }
          break
      }
    })
    
    return result
  }

  static parseValidationRules(jsonbData: Record<string, any>): ValidationRule[] {
    const rules: ValidationRule[] = []
    
    Object.entries(jsonbData).forEach(([key, value]) => {
      if (typeof value === 'object' && value.value !== undefined) {
        rules.push({
          type: key as ValidationRule['type'],
          value: value.value,
          message: value.message
        })
      }
    })
    
    return rules
  }

  static validateField(value: any, rules: ValidationRule[]): string | null {
    for (const rule of rules) {
      switch (rule.type) {
        case 'required':
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            return rule.message || 'This field is required'
          }
          break
        case 'minLength':
          if (typeof value === 'string' && value.length < rule.value) {
            return rule.message || `Minimum ${rule.value} characters required`
          }
          break
        case 'maxLength':
          if (typeof value === 'string' && value.length > rule.value) {
            return rule.message || `Maximum ${rule.value} characters allowed`
          }
          break
        case 'min':
          if (typeof value === 'number' && value < rule.value) {
            return rule.message || `Minimum value: ${rule.value}`
          }
          break
        case 'max':
          if (typeof value === 'number' && value > rule.value) {
            return rule.message || `Maximum value: ${rule.value}`
          }
          break
        case 'pattern':
          if (typeof value === 'string' && !new RegExp(rule.value).test(value)) {
            return rule.message || 'Invalid format'
          }
          break
      }
    }
    return null
  }
}

// Conditional Logic Utilities
export class ConditionalLogicUtils {
  static createConditionalLogic(conditions: ConditionalLogic[]): Record<string, any> {
    return {
      rules: conditions,
      version: 1
    }
  }

  static parseConditionalLogic(jsonbData: Record<string, any>): ConditionalLogic[] {
    if (!jsonbData || !jsonbData.rules) return []
    return jsonbData.rules
  }

  static evaluateCondition(
    condition: ConditionalLogic, 
    formData: Record<string, any>
  ): boolean {
    const fieldValue = formData[condition.questionId]
    
    switch (condition.condition) {
      case 'equals':
        return fieldValue === condition.value
      case 'not_equals':
        return fieldValue !== condition.value
      case 'contains':
        return Array.isArray(fieldValue) ? fieldValue.includes(condition.value) : 
               String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase())
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value)
      case 'less_than':
        return Number(fieldValue) < Number(condition.value)
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue)
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue)
      default:
        return false
    }
  }

  static evaluateConditionalLogic(
    conditions: ConditionalLogic[], 
    formData: Record<string, any>
  ): boolean {
    if (!conditions.length) return true

    return conditions.every((condition, index) => {
      const result = this.evaluateCondition(condition, formData)
      
      if (condition.children && condition.children.length > 0) {
        const childrenResult = condition.operator === 'or' 
          ? condition.children.some(child => this.evaluateCondition(child, formData))
          : condition.children.every(child => this.evaluateCondition(child, formData))
        
        return condition.operator === 'or' ? (result || childrenResult) : (result && childrenResult)
      }
      
      return result
    })
  }
}

// Question Options Utilities
export class QuestionOptionsUtils {
  static createOptions(options: QuestionOption[]): Record<string, any> {
    return {
      options: options.sort((a, b) => (a.order || 0) - (b.order || 0)),
      allowOther: options.some(opt => opt.isOther),
      version: 1
    }
  }

  static parseOptions(jsonbData: Record<string, any>): QuestionOption[] {
    if (!jsonbData || !jsonbData.options) return []
    return jsonbData.options
  }

  static addOption(
    existingOptions: QuestionOption[], 
    newOption: Omit<QuestionOption, 'id'>
  ): QuestionOption[] {
    const option: QuestionOption = {
      ...newOption,
      id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      order: newOption.order || existingOptions.length
    }
    
    return [...existingOptions, option].sort((a, b) => (a.order || 0) - (b.order || 0))
  }

  static updateOption(
    options: QuestionOption[], 
    optionId: string, 
    updates: Partial<QuestionOption>
  ): QuestionOption[] {
    return options.map(opt => 
      opt.id === optionId ? { ...opt, ...updates } : opt
    )
  }

  static removeOption(options: QuestionOption[], optionId: string): QuestionOption[] {
    return options.filter(opt => opt.id !== optionId)
  }

  static reorderOptions(options: QuestionOption[], orderedIds: string[]): QuestionOption[] {
    const optionMap = new Map(options.map(opt => [opt.id, opt]))
    
    return orderedIds.map((id, index) => ({
      ...optionMap.get(id)!,
      order: index
    }))
  }
}

// Photo Configuration Utilities
export class PhotoConfigUtils {
  static createPhotoConfig(config: PhotoUploadConfig): Record<string, any> {
    return {
      ...config,
      version: 1
    }
  }

  static parsePhotoConfig(jsonbData: Record<string, any>): PhotoUploadConfig {
    return {
      types: jsonbData.types || [],
      maxFileSize: jsonbData.maxFileSize || 5 * 1024 * 1024, // 5MB default
      allowedFormats: jsonbData.allowedFormats || ['jpg', 'jpeg', 'png'],
      minResolution: jsonbData.minResolution,
      maxResolution: jsonbData.maxResolution,
      compressionQuality: jsonbData.compressionQuality || 0.8
    }
  }

  static getDefaultDentalPhotoTypes(): PhotoType[] {
    return [
      {
        id: 'front_smile',
        name: 'Front Smile',
        description: 'Full front view with natural smile',
        required: true,
        instructions: 'Look directly at camera and smile naturally'
      },
      {
        id: 'side_profile_left',
        name: 'Left Side Profile',
        description: 'Left side profile view',
        required: false,
        instructions: 'Turn head to show left side profile'
      },
      {
        id: 'side_profile_right',
        name: 'Right Side Profile',
        description: 'Right side profile view',
        required: false,
        instructions: 'Turn head to show right side profile'
      },
      {
        id: 'upper_teeth',
        name: 'Upper Teeth',
        description: 'Close-up of upper teeth',
        required: true,
        instructions: 'Open mouth to clearly show upper teeth'
      },
      {
        id: 'lower_teeth',
        name: 'Lower Teeth',
        description: 'Close-up of lower teeth',
        required: true,
        instructions: 'Open mouth to clearly show lower teeth'
      },
      {
        id: 'bite_view',
        name: 'Bite View',
        description: 'Teeth in normal bite position',
        required: false,
        instructions: 'Close teeth in normal bite position'
      }
    ]
  }
}

// Slider Configuration Utilities
export class SliderConfigUtils {
  static createSliderConfig(config: SliderConfig): Record<string, any> {
    return {
      ...config,
      version: 1
    }
  }

  static parseSliderConfig(jsonbData: Record<string, any>): SliderConfig {
    return {
      min: jsonbData.min || 0,
      max: jsonbData.max || 100,
      step: jsonbData.step || 1,
      showLabels: jsonbData.showLabels !== false,
      leftLabel: jsonbData.leftLabel,
      rightLabel: jsonbData.rightLabel,
      showValue: jsonbData.showValue !== false
    }
  }
}

// Rating Configuration Utilities
export class RatingConfigUtils {
  static createRatingConfig(config: RatingConfig): Record<string, any> {
    return {
      ...config,
      version: 1
    }
  }

  static parseRatingConfig(jsonbData: Record<string, any>): RatingConfig {
    return {
      scale: jsonbData.scale || 5,
      showLabels: jsonbData.showLabels !== false,
      labels: jsonbData.labels || [],
      allowHalf: jsonbData.allowHalf || false
    }
  }

  static getDefaultRatingLabels(scale: number): string[] {
    switch (scale) {
      case 3:
        return ['Poor', 'Good', 'Excellent']
      case 5:
        return ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent']
      case 10:
        return Array.from({ length: 10 }, (_, i) => `${i + 1}`)
      default:
        return Array.from({ length: scale }, (_, i) => `${i + 1}`)
    }
  }
} 