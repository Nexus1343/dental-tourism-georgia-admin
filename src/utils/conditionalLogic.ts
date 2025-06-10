import { ConditionalLogic, LogicCondition, QuestionnaireQuestion } from '@/types/questionnaire';

/**
 * Evaluates a single condition against the provided answers
 */
export function evaluateCondition(
  condition: LogicCondition,
  answers: Record<string, any>
): boolean {
  const { question_id, operator, value: expectedValue } = condition;
  const actualValue = answers[question_id];

  switch (operator) {
    case 'equals':
      if (Array.isArray(actualValue)) {
        return actualValue.includes(expectedValue);
      }
      return actualValue === expectedValue;

    case 'not_equals':
      if (Array.isArray(actualValue)) {
        return !actualValue.includes(expectedValue);
      }
      return actualValue !== expectedValue;

    case 'contains':
      if (Array.isArray(actualValue)) {
        return actualValue.some(val => 
          String(val).toLowerCase().includes(String(expectedValue).toLowerCase())
        );
      }
      return String(actualValue || '').toLowerCase().includes(String(expectedValue).toLowerCase());

    case 'greater_than':
      const numActual = Number(actualValue);
      const numExpected = Number(expectedValue);
      return !isNaN(numActual) && !isNaN(numExpected) && numActual > numExpected;

    case 'less_than':
      const numActual2 = Number(actualValue);
      const numExpected2 = Number(expectedValue);
      return !isNaN(numActual2) && !isNaN(numExpected2) && numActual2 < numExpected2;

    case 'is_empty':
      if (Array.isArray(actualValue)) {
        return actualValue.length === 0;
      }
      return actualValue === null || actualValue === undefined || actualValue === '';

    case 'is_not_empty':
      if (Array.isArray(actualValue)) {
        return actualValue.length > 0;
      }
      return actualValue !== null && actualValue !== undefined && actualValue !== '';

    default:
      console.warn(`Unknown operator: ${operator}`);
      return false;
  }
}

/**
 * Evaluates conditional logic to determine if a question should be shown
 */
export function shouldShowQuestion(
  question: QuestionnaireQuestion,
  answers: Record<string, any>
): boolean {
  const logic = question.conditional_logic;
  
  if (!logic) {
    return true; // Show by default if no conditional logic
  }

  const { show_if, hide_if, operator = 'AND' } = logic;
  
  // Evaluate show_if conditions
  if (show_if && show_if.length > 0) {
    const showResults = show_if.map(condition => evaluateCondition(condition, answers));
    const shouldShow = operator === 'AND' 
      ? showResults.every(result => result)
      : showResults.some(result => result);
    
    if (!shouldShow) {
      return false;
    }
  }
  
  // Evaluate hide_if conditions
  if (hide_if && hide_if.length > 0) {
    const hideResults = hide_if.map(condition => evaluateCondition(condition, answers));
    const shouldHide = operator === 'AND'
      ? hideResults.every(result => result)
      : hideResults.some(result => result);
    
    if (shouldHide) {
      return false;
    }
  }
  
  return true;
}

/**
 * Get all questions that depend on a specific question
 */
export function getDependentQuestions(
  targetQuestionId: string,
  allQuestions: QuestionnaireQuestion[]
): QuestionnaireQuestion[] {
  return allQuestions.filter(question => {
    const logic = question.conditional_logic;
    if (!logic) return false;
    
    const allConditions = [...(logic.show_if || []), ...(logic.hide_if || [])];
    return allConditions.some(condition => condition.question_id === targetQuestionId);
  });
}

/**
 * Filter visible questions based on current answers
 */
export function getVisibleQuestions(
  questions: QuestionnaireQuestion[],
  answers: Record<string, any>
): QuestionnaireQuestion[] {
  return questions.filter(question => shouldShowQuestion(question, answers));
}

/**
 * Validate conditional logic configuration
 */
export function validateConditionalLogic(
  logic: ConditionalLogic,
  allQuestions: QuestionnaireQuestion[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const questionIds = new Set(allQuestions.map(q => q.id));
  
  const validateConditions = (conditions: LogicCondition[], type: string) => {
    conditions.forEach((condition, index) => {
      if (!questionIds.has(condition.question_id)) {
        errors.push(`${type} condition ${index + 1}: Question ID "${condition.question_id}" does not exist`);
      }
      
      if (!condition.operator) {
        errors.push(`${type} condition ${index + 1}: Missing operator`);
      }
      
      if (condition.value === undefined || condition.value === null) {
        errors.push(`${type} condition ${index + 1}: Missing value`);
      }
    });
  };
  
  if (logic.show_if) {
    validateConditions(logic.show_if, 'show_if');
  }
  
  if (logic.hide_if) {
    validateConditions(logic.hide_if, 'hide_if');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
} 