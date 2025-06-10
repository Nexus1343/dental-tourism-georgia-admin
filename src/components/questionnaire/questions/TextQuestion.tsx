'use client'

import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BaseQuestion } from './BaseQuestion';
import { QuestionRendererProps } from '@/types/questionnaire';
import { cn } from '@/lib/utils';

export function TextQuestion({ 
  question, 
  value = '', 
  onChange, 
  onBlur, 
  error, 
  disabled = false,
  showValidation = true 
}: QuestionRendererProps) {
  const isTextarea = question.question_type === 'textarea';
  const validation = question.validation_rules;
  const maxLength = validation?.maxLength;
  const currentLength = value?.length || 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    // Apply max length validation
    if (maxLength && newValue.length > maxLength) {
      return;
    }
    
    onChange(newValue);
  };

  const inputProps = {
    id: question.id,
    value: value || '',
    onChange: handleChange,
    onBlur,
    disabled,
    placeholder: question.placeholder_text || '',
    className: cn(
      error && showValidation && "border-red-500 focus:border-red-500 focus:ring-red-500",
      "transition-colors"
    )
  };

  return (
    <BaseQuestion 
      question={question} 
      error={error} 
      showValidation={showValidation}
    >
      {isTextarea ? (
        <div className="space-y-1">
          <Textarea 
            {...inputProps}
            rows={4}
            className={cn(inputProps.className, "resize-y min-h-[100px]")}
          />
          {maxLength && (
            <div className="flex justify-end">
              <span className={cn(
                "text-xs",
                currentLength > maxLength * 0.9 ? "text-orange-600" : "text-gray-500",
                currentLength >= maxLength && "text-red-600"
              )}>
                {currentLength}/{maxLength}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          <Input {...inputProps} />
          {maxLength && (
            <div className="flex justify-end">
              <span className={cn(
                "text-xs",
                currentLength > maxLength * 0.9 ? "text-orange-600" : "text-gray-500",
                currentLength >= maxLength && "text-red-600"
              )}>
                {currentLength}/{maxLength}
              </span>
            </div>
          )}
        </div>
      )}
    </BaseQuestion>
  );
} 