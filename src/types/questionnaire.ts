// Question types available in the system
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
  | 'budget_range';

// Page types
export type PageType = 'intro' | 'standard' | 'photo_upload' | 'summary';

// Validation rules interface
export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  format?: string;
  fileTypes?: string[];
  maxFileSize?: number;
  minFiles?: number;
  maxFiles?: number;
  allow_other?: boolean;
  max_files?: number;
  max_file_size?: number;
  accepted_types?: string[];
}

// Question option interface
export interface QuestionOption {
  id: string;
  label: string;
  value: string;
  isOther?: boolean;
}

// Conditional logic interface
export interface ConditionalLogic {
  show_if?: LogicCondition[];
  hide_if?: LogicCondition[];
  operator?: 'AND' | 'OR';
}

export interface LogicCondition {
  question_id: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: any;
}

// Question interface
export interface QuestionnaireQuestion {
  id: string;
  page_id: string;
  section: string;
  question_text: string;
  question_type: QuestionType;
  options?: QuestionOption[];
  validation_rules?: ValidationRules;
  is_required: boolean;
  order_index: number;
  conditional_logic?: ConditionalLogic;
  help_text?: string;
  placeholder_text?: string;
  question_group?: string;
  display_logic?: Record<string, any>;
  validation_message?: string;
  tooltip_text?: string;
}

// Page interface
export interface QuestionnairePage {
  id: string;
  page_number: number;
  title: string;
  description?: string;
  instruction_text?: string;
  page_type: PageType;
  validation_rules?: ValidationRules;
  show_progress: boolean;
  allow_back_navigation: boolean;
  auto_advance: boolean;
  questions: QuestionnaireQuestion[];
}

// Form validation error
export interface ValidationError {
  field: string;
  message: string;
  type: 'required' | 'format' | 'length' | 'range' | 'custom';
}

// Question component props
export interface QuestionRendererProps {
  question: QuestionnaireQuestion;
  value?: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  showValidation?: boolean;
}

// Form context interface
export interface QuestionnaireFormContext {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isDirty: boolean;
} 