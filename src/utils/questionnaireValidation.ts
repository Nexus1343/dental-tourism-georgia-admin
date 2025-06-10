import { QuestionnaireQuestion, ValidationRules, ValidationError } from '@/types/questionnaire';

/**
 * Validate a single question answer
 */
export function validateQuestionAnswer(
  question: QuestionnaireQuestion,
  value: any
): ValidationError | null {
  const { validation_rules, is_required, question_type } = question;
  
  // Check required validation
  if (is_required && isEmpty(value)) {
    return {
      field: question.id,
      message: `${question.question_text} is required`,
      type: 'required'
    };
  }
  
  // Skip other validations if value is empty and not required
  if (isEmpty(value)) {
    return null;
  }
  
  // Apply validation rules
  if (validation_rules) {
    const error = validateAgainstRules(question, value, validation_rules);
    if (error) {
      return error;
    }
  }
  
  // Apply question type specific validations
  const typeError = validateByType(question, value);
  if (typeError) {
    return typeError;
  }
  
  return null;
}

/**
 * Validate multiple questions answers
 */
export function validateQuestions(
  questions: QuestionnaireQuestion[],
  answers: Record<string, any>
): Record<string, string> {
  const errors: Record<string, string> = {};
  
  questions.forEach(question => {
    const value = answers[question.id];
    const error = validateQuestionAnswer(question, value);
    
    if (error) {
      errors[question.id] = error.message;
    }
  });
  
  return errors;
}

/**
 * Check if a value is considered empty
 */
function isEmpty(value: any): boolean {
  if (value === null || value === undefined || value === '') {
    return true;
  }
  
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  
  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }
  
  return false;
}

/**
 * Validate against validation rules
 */
function validateAgainstRules(
  question: QuestionnaireQuestion,
  value: any,
  rules: ValidationRules
): ValidationError | null {
  // Length validations
  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      return {
        field: question.id,
        message: `Minimum ${rules.minLength} characters required`,
        type: 'length'
      };
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
      return {
        field: question.id,
        message: `Maximum ${rules.maxLength} characters allowed`,
        type: 'length'
      };
    }
  }
  
  // Numeric validations
  if (typeof value === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      return {
        field: question.id,
        message: `Value must be at least ${rules.min}`,
        type: 'range'
      };
    }
    
    if (rules.max !== undefined && value > rules.max) {
      return {
        field: question.id,
        message: `Value must be at most ${rules.max}`,
        type: 'range'
      };
    }
  }
  
  // Array validations (for multiple choice, file uploads, etc.)
  if (Array.isArray(value)) {
    if (rules.minFiles && value.length < rules.minFiles) {
      return {
        field: question.id,
        message: `Minimum ${rules.minFiles} selections required`,
        type: 'range'
      };
    }
    
    if (rules.maxFiles && value.length > rules.maxFiles) {
      return {
        field: question.id,
        message: `Maximum ${rules.maxFiles} selections allowed`,
        type: 'range'
      };
    }
  }
  
  // Pattern validation
  if (rules.pattern && typeof value === 'string') {
    const regex = new RegExp(rules.pattern);
    if (!regex.test(value)) {
      return {
        field: question.id,
        message: question.validation_message || 'Invalid format',
        type: 'format'
      };
    }
  }
  
  return null;
}

/**
 * Validate by question type
 */
function validateByType(
  question: QuestionnaireQuestion,
  value: any
): ValidationError | null {
  const { question_type } = question;
  
  switch (question_type) {
    case 'email':
      if (typeof value === 'string') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return {
            field: question.id,
            message: 'Please enter a valid email address',
            type: 'format'
          };
        }
      }
      break;
      
    case 'phone':
      if (typeof value === 'string') {
        // Basic phone validation - remove spaces, dashes, parentheses
        const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
        const phoneRegex = /^[\+]?[\d]{10,15}$/;
        if (!phoneRegex.test(cleanPhone)) {
          return {
            field: question.id,
            message: 'Please enter a valid phone number',
            type: 'format'
          };
        }
      }
      break;
      
    case 'number':
      if (value !== null && value !== undefined && isNaN(Number(value))) {
        return {
          field: question.id,
          message: 'Please enter a valid number',
          type: 'format'
        };
      }
      break;
      
    case 'date':
    case 'date_picker':
      if (typeof value === 'string') {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return {
            field: question.id,
            message: 'Please enter a valid date',
            type: 'format'
          };
        }
      }
      break;
  }
  
  return null;
}

/**
 * Check if page can be navigated away from
 */
export function canNavigateFromPage(
  questions: QuestionnaireQuestion[],
  answers: Record<string, any>
): boolean {
  const requiredQuestions = questions.filter(q => q.is_required);
  
  return requiredQuestions.every(question => {
    const value = answers[question.id];
    return !isEmpty(value);
  });
} 