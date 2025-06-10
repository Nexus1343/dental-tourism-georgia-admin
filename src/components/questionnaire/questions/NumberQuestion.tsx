'use client'

import React from 'react';
import { Input } from '@/components/ui/input';
import { BaseQuestion } from './BaseQuestion';
import { QuestionRendererProps } from '@/types/questionnaire';
import { cn } from '@/lib/utils';

export function NumberQuestion({ 
  question, 
  value, 
  onChange, 
  onBlur, 
  error, 
  disabled = false,
  showValidation = true 
}: QuestionRendererProps) {
  const validation = question.validation_rules;
  const min = validation?.min;
  const max = validation?.max;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow empty value for clearing
    if (inputValue === '') {
      onChange(null);
      return;
    }
    
    const numValue = parseFloat(inputValue);
    
    // Only update if it's a valid number
    if (!isNaN(numValue)) {
      onChange(numValue);
    }
  };

  const displayValue = value === null || value === undefined ? '' : String(value);
  
  return (
    <BaseQuestion 
      question={question} 
      error={error} 
      showValidation={showValidation}
    >
      <div className="space-y-1">
        <Input
          id={question.id}
          type="number"
          value={displayValue}
          onChange={handleChange}
          onBlur={onBlur}
          disabled={disabled}
          min={min}
          max={max}
          step="any"
          placeholder={question.placeholder_text || ''}
          className={cn(
            "transition-colors",
            error && showValidation && "border-red-500 focus:border-red-500 focus:ring-red-500"
          )}
        />
        
        {/* Range indicator */}
        {(min !== undefined || max !== undefined) && (
          <p className="text-xs text-gray-500">
            {min !== undefined && max !== undefined 
              ? `Range: ${min} - ${max}`
              : min !== undefined 
                ? `Minimum: ${min}`
                : `Maximum: ${max}`
            }
          </p>
        )}
      </div>
    </BaseQuestion>
  );
} 